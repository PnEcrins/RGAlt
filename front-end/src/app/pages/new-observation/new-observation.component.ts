import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  afterNextRender,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import 'moment/locale/fr';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { round } from '@turf/helpers';

import {
  Observation,
  ObservationFeature,
  ObservationType,
  ObservationTypes,
} from '../../types/types';
import { OfflineService } from '../../services/offline.service';
import { v4 as uuidv4 } from 'uuid';
import { SettingsService } from '../../services/settings.service';
import { ObservationsService } from '../../services/observations.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,
  ],
  templateUrl: './new-observation.component.html',
  styleUrl: './new-observation.component.scss',
})
export class NewObservationComponent {
  observationTypeParent: ObservationType | null = null;
  columns: number = 2;
  breakpoints = {
    xl: 4,
    lg: 4,
    md: 2,
    sm: 2,
    xs: 1,
  };
  mobile?: boolean;

  L: any;
  map: any;
  marker: any;
  @ViewChild('cameraInput') private cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  typeForm: FormGroup<{
    type: FormControl<ObservationType | null>;
  }> = new FormGroup({
    type: new FormControl<ObservationType | null>(null, Validators.required),
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
    date: FormControl<any | null>;
    name: FormControl<string | null>;
    comment: FormControl<string | null>;
  }> = new FormGroup({
    date: new FormControl<any | null>(moment(), Validators.required),
    name: new FormControl<string | null>(''),
    comment: new FormControl<string | null>(''),
  });

  breakpointObserver = inject(BreakpointObserver);
  platform = inject(Platform);
  router = inject(Router);
  offlineService = inject(OfflineService);
  settingsService = inject(SettingsService);
  observationsService = inject(ObservationsService);
  snackBar = inject(MatSnackBar);
  ngZone = inject(NgZone);

  observationsTypes: ObservationTypes =
    this.settingsService.settings.value!.categories;

  ngOnInit() {
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
  }
  constructor() {
    afterNextRender(async () => {
      this.initMap();
    });
  }

  async initMap() {
    this.L = await import('leaflet');
    await import('leaflet.locatecontrol');

    this.map = this.L.map('map', { zoom: 4, center: [47, 2] });

    this.L.tileLayer(
      'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
      {
        attribution: "<a target='_blank' href='https://ign.fr/'>IGN</a>",
      },
    ).addTo(this.map);

    this.map.on('move', (e: any) => {
      const center = this.map.getCenter();
      this.ngZone.run(() => {
        this.mapForm.value.position = {
          lat: round(center.lat, 6),
          lng: round(center.lng, 6),
        };
      });
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
      icon: this.L.icon({
        ...this.L.Icon.Default.prototype.options,
        iconUrl: 'assets/marker-icon.png',
        iconRetinaUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png',
      }),
    }).addTo(this.map);
  }

  observationClick(value: ObservationType) {
    if (value.children.length === 0) {
      this.typeForm.setValue({ type: value });
    } else {
      this.typeForm.setValue({ type: null });
      this.observationTypeParent = value;
      this.observationsTypes = value.children;
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
    this.observationTypeParent = null;
    this.typeForm.setValue({ type: null });
    this.observationsTypes = this.settingsService.settings.value!.categories;
  }

  async saveAsDraft() {
    const newObservation: Observation = {
      uuid: uuidv4(),
      name: this.moreDataForm.value.name!,
      event_date: moment(this.moreDataForm.value.date!.toDate()).format(
        'YYYY-MM-DD',
      ),
      comments: this.moreDataForm.value.comment!,
      category: this.typeForm.value.type!.id,
      source: undefined,
      coordinates: [
        this.mapForm.value.position!.lng,
        this.mapForm.value.position!.lng,
      ],
    };
    await this.offlineService.writeOrUpdateDataInStore('observations', [
      newObservation,
    ]);
    this.offlineService.handleObservationsPending();
    this.router.navigate(['/']);
  }

  sendObservation() {
    const observation: ObservationFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          this.mapForm.value.position!.lng,
          this.mapForm.value.position!.lat,
        ],
      },
      properties: {
        comments: this.moreDataForm.value.comment ?? '',
        event_date: moment(this.moreDataForm.value.date.toDate()).format(
          'YYYY-MM-DD',
        ),
        category: this.typeForm.value.type!.id,
      },
    };
    if (Boolean(this.moreDataForm.value.name)) {
      observation.properties.name = this.moreDataForm.value.name!;
    }
    this.observationsService.sendObservation(observation).subscribe({
      next: () => {
        this.snackBar.open('Observation transférée', '', { duration: 2000 });
        this.router.navigate(['/']);
      },
      error: async () => {
        this.snackBar.open(
          "Une erreur est survenue lors du transfert de l'observation",
          '',
          {
            duration: 2000,
          },
        );

        await this.saveAsDraft();
      },
    });
  }

  getEventType(eventTypeId: number) {
    const eventTypes = [
      ...this.settingsService.settings.value!.categories.map((type) => type),
      ...this.settingsService.settings
        .value!.categories.map((type) => type.children)
        .flat(),
    ];
    return eventTypes.find(
      (observationType) => observationType.id === eventTypeId,
    );
  }
}
