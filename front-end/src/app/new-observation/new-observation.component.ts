import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { Platform, PlatformModule } from '@angular/cdk/platform';
import { MatDatepickerModule } from '@angular/material/datepicker';
import 'moment/locale/fr';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { round } from '@turf/helpers';

import observations from './observations.json';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-new-observation',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    PlatformModule,
    MatDatepickerModule,
    MatTooltipModule,
  ],
  templateUrl: './new-observation.component.html',
  styleUrl: './new-observation.component.scss',
})
export class NewObservationComponent {
  observations = observations;
  observationParent: any = null;
  columns: number = 2;
  breakpoints = {
    xl: 4,
    lg: 4,
    md: 2,
    sm: 2,
    xs: 1,
  };
  mobile?: boolean;

  isPlatformBrowser: boolean = false;
  L: any;
  map: any;
  marker: any;
  @ViewChild('cameraInput') private cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  typeForm: FormGroup<{
    type: FormControl<{ id: number; name: string; icon: string } | null>;
  }> = new FormGroup({
    type: new FormControl<{ id: number; name: string; icon: string } | null>(
      null,
      Validators.required,
    ),
  });

  photoForm: FormGroup<{
    photo: FormControl<string | null>;
  }> = new FormGroup({
    photo: new FormControl<string | null>(null),
  });

  mapForm: FormGroup<{
    position: FormControl<{ lat: number; lng: number } | null>;
  }> = new FormGroup({
    position: new FormControl<{ lat: number; lng: number } | null>(null),
  });

  moreDataForm: FormGroup<{
    date: FormControl<Date | null>;
    comment: FormControl<string | null>;
  }> = new FormGroup({
    date: new FormControl<any | null>(moment(), Validators.required),
    comment: new FormControl<string | null>(''),
  });

  breakpointObserver = inject(BreakpointObserver);
  platform = inject(Platform);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    this.mobile = this.platform.ANDROID || this.platform.IOS;

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((breakpointState) => {
        if (breakpointState.matches) {
          if (breakpointState.breakpoints[Breakpoints.XSmall]) {
            this.columns = this.breakpoints.xs;
          } else if (breakpointState.breakpoints[Breakpoints.Small]) {
            this.columns = this.breakpoints.sm;
          } else if (breakpointState.breakpoints[Breakpoints.Medium]) {
            this.columns = this.breakpoints.md;
          } else if (breakpointState.breakpoints[Breakpoints.Large]) {
            this.columns = this.breakpoints.lg;
          } else if (breakpointState.breakpoints[Breakpoints.XLarge]) {
            this.columns = this.breakpoints.xl;
          }
        }
      });

    this.initMap();
  }

  async initMap() {
    if (this.isPlatformBrowser) {
      this.L = await import('leaflet');
      await import('leaflet.locatecontrol');
      const { Icon, icon } = await import('leaflet');

      this.map = this.L.map('map', { zoom: 4, center: [47, 2] });

      this.L.tileLayer(
        'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        {
          attribution: "<a target='_blank' href='https://ign.fr/'>IGN</a>",
        },
      ).addTo(this.map);

      this.map.on('move', (e: any) => {
        const center = this.map.getCenter();
        this.mapForm.value.position = {
          lat: round(center.lat, 6),
          lng: round(center.lng, 6),
        };
        this.marker.setLatLng(center);
      });

      this.L.control
        .locate({ setView: 'once', showPopup: false })
        .addTo(this.map);

      const center = this.map.getCenter();
      this.mapForm.value.position = {
        lat: round(center.lat, 6),
        lng: round(center.lng, 6),
      };
      this.marker = this.L.marker(center, {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      }).addTo(this.map);
    }
  }

  observationClick(value: any) {
    if (value.observations.length === 0) {
      this.typeForm.setValue({ type: value });
    } else {
      this.typeForm.setValue({ type: null });
      this.observationParent = value;
      this.observations = value.observations;
    }
  }

  async addPhotoFromCamera() {
    this.cameraInput.nativeElement.click();
  }

  async addPhotoFromLibrary() {
    this.fileInput.nativeElement.click();
  }

  onPhotoSelected(event: any) {
    const photo: File = event.target.files[0];

    if (photo) {
      this.photoForm.value.photo = URL.createObjectURL(photo);
    }
  }

  backToPreviousObservations() {
    this.observationParent = null;
    this.typeForm.setValue({ type: null });
    this.observations = observations;
  }

  saveAsDraft() {
    this.router.navigate(['/']);
  }

  sendObservation() {
    this.router.navigate(['/']);
  }
}
