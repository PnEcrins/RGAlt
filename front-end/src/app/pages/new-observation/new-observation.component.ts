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
import { MatChipsModule } from '@angular/material/chips';

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
  Icons,
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
import { firstValueFrom } from 'rxjs';
import { NewObservationLoaderDialog } from './dialogs/new-observation-loader-dialog';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

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
    MatChipsModule,
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
    photos: FormControl<
      { file: File | null; objectUrl: string; uuid?: string | null }[] | null
    >;
  }> = new FormGroup({
    photos: new FormControl<any[]>([]),
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
  readonly dialog = inject(MatDialog);

  observationsTypes: ObservationTypes = [];

  icons: Icons = [];

  observationIsInvalid = true;
  currentObservation: any = null;
  photosToDelete: string[] = [];

  async ngOnInit() {
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
    this.observationsTypes = this.settingsService.settings.value!.categories!;
    const state = this.router.lastSuccessfulNavigation?.extras?.state;

    if (state && state['data']) {
      const isOffline = !Boolean(state['data']!.id);
      this.currentObservation = state['data'];

      const category = isOffline
        ? this.currentObservation.category
        : this.currentObservation.properties.category;

      let observationsType =
        this.observationsTypes.find((type) => type.id === category) || null;
      if (!observationsType) {
        for (let index = 0; index < this.observationsTypes.length; index++) {
          const currentObservationsType = this.observationsTypes[index];
          observationsType =
            currentObservationsType.children.find(
              (children) => children.id === category,
            ) || null;

          if (observationsType) {
            this.observationTypeParent = currentObservationsType;
            this.observationsTypes = currentObservationsType.children;
            break;
          }
        }
      }

      this.typeForm.setValue({
        type: observationsType,
      });

      const files = this.currentObservation!.files;

      const photos: {
        file: File | null;
        objectUrl: string;
        uuid?: string;
      }[] = [];
      if (isOffline) {
        for (let index = 0; index < files!.length; index++) {
          const photo = {
            file: files![index],
            objectUrl: URL.createObjectURL(files![index]),
            uuid: uuidv4(),
          };
          photos.push(photo);
        }
      } else {
        const observation = await firstValueFrom(
          this.observationsService.getObservation(
            this.currentObservation.id.toString(),
          ),
        );
        for (
          let index = 0;
          index < (observation as ObservationFeature).properties.medias!.length;
          index++
        ) {
          const media = (observation as ObservationFeature).properties!.medias![
            index
          ];
          const photo = {
            file: null,
            objectUrl: media.thumbnails!.small,
            uuid: media.uuid,
          };
          photos.push(photo);
        }
      }
      this.photoForm.setValue({ photos });

      const coordinates =
        this.currentObservation.coordinates ||
        this.currentObservation.geometry.coordinates;
      this.mapForm.setValue({
        position: {
          lat: coordinates![1],
          lng: coordinates![0],
        },
      });

      const moreData = !isOffline
        ? this.currentObservation.properties
        : this.currentObservation;

      this.moreDataForm.setValue({
        date: moment(moreData.event_date),
        name: moreData.name!,
        comment: moreData.comments,
      });
    }
  }
  constructor() {
    afterNextRender(async () => {
      await this.initIcons();
      await this.initMap();
    });
  }

  async initMap() {
    this.L = await import('leaflet');
    await import('leaflet.locatecontrol');
    await import('leaflet.offline');
    await import('leaflet.fullscreen');

    this.map = this.L.default.map('map', {
      zoom: environment.baseMaps.zoom,
      center:
        this.mapForm.value.position?.lat && this.mapForm.value.position?.lng
          ? [this.mapForm.value.position.lat, this.mapForm.value.position.lng]
          : environment.baseMaps.center,
    });

    this.L.default.control
      .fullscreen({
        position: 'topleft',
        title: 'Voir la carte en plein écran',
        titleCancel: 'Sortir de la carte du plein écran',
        forceSeparateButton: true,
      })
      .addTo(this.map);

    const defaultLayerUrl = this.settingsService.settings.value?.base_maps
      .main_map.url
      ? this.settingsService.settings.value?.base_maps.main_map.url
      : environment.baseMaps.mainMap.url;
    const defaultLayerAttribution = this.settingsService.settings.value
      ?.base_maps.main_map.attribution
      ? this.settingsService.settings.value?.base_maps.main_map.attribution
      : environment.baseMaps.mainMap.attribution;

    const satelliteLayerUrl = this.settingsService.settings.value?.base_maps
      .satellite_map.url
      ? this.settingsService.settings.value?.base_maps.satellite_map.url
      : environment.baseMaps.satellitMap.url;
    const satelliteLayerAttribution = this.settingsService.settings.value
      ?.base_maps.satellite_map.attribution
      ? this.settingsService.settings.value?.base_maps.satellite_map.attribution
      : environment.baseMaps.satellitMap.attribution;

    const defaultLayer = this.L.default.tileLayer.offline(defaultLayerUrl, {
      attribution: defaultLayerAttribution,
    });
    defaultLayer.addTo(this.map);
    const satelliteLayer = this.L.default.tileLayer.offline(satelliteLayerUrl, {
      attribution: satelliteLayerAttribution,
    });

    this.L.default.control
      .layers(
        { Defaut: defaultLayer, Satellite: satelliteLayer },
        {},
        { collapsed: true },
      )
      .addTo(this.map);

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

    this.L.default.control
      .locate({ setView: 'once', showPopup: false })
      .addTo(this.map);

    const center = this.map.getCenter();
    this.mapForm.value.position = {
      lat: round(center.lat, 6),
      lng: round(center.lng, 6),
    };
    this.marker = this.L.default
      .marker(center, {
        icon: this.L.default.icon({
          ...this.L.default.Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      })
      .addTo(this.map);
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
    const photoSelected: File = event.target.files[0];
    if (
      photoSelected &&
      this.photoForm.value.photos &&
      !this.photoForm.value.photos.find(
        (photo) => photo.file?.name === photoSelected.name,
      )
    ) {
      this.photoForm.value.photos.push({
        file: photoSelected,
        objectUrl: URL.createObjectURL(photoSelected),
        uuid: uuidv4(),
      } as any);
    }
    event.target.value = null;
  }

  backToPreviousObservations() {
    this.observationTypeParent = null;
    this.typeForm.setValue({ type: null });
    this.observationsTypes = this.settingsService.settings.value!.categories;
  }

  async saveAsDraft() {
    const newObservation: Observation = {
      uuid: this.currentObservation ? this.currentObservation.uuid : uuidv4(),
      name: this.moreDataForm.value.name!,
      event_date: moment(this.moreDataForm.value.date!.toDate()).format(
        'YYYY-MM-DD',
      ),
      comments: this.moreDataForm.value.comment!,
      category: this.typeForm.value.type!.id,
      source: undefined,
      coordinates: [
        this.mapForm.value.position!.lng,
        this.mapForm.value.position!.lat,
      ],
      files: this.photoForm.value.photos!.map((photo) => photo.file!),
    };
    await this.offlineService.writeOrUpdateDataInStore('observations', [
      newObservation,
    ]);
    this.offlineService.handleObservationsPending();
    this.snackBar.open("Brouillon de l'observation enregistré", '', {
      duration: 2000,
    });
    this.router.navigate(['/']);
  }

  sendObservation() {
    const newObservationLoaderDialogRef = this.dialog.open(
      NewObservationLoaderDialog,
      {
        width: '250px',
        data: { title: 'Observation en cours de transfert' },
        disableClose: true,
      },
    );
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
    if (this.currentObservation) {
      this.observationsService
        .putObservation(this.currentObservation.id, observation)
        .subscribe({
          next: async (observationResponse: any) => {
            const photosToSend = this.photoForm.value.photos?.filter(
              (photo) => photo.file,
            );
            for (let index = 0; index < photosToSend!.length; index++) {
              const photo = photosToSend![index];
              await firstValueFrom(
                this.observationsService.postPhotoObservation(
                  observationResponse.id,
                  photo.file,
                ),
              );
            }

            for (let index = 0; index < this.photosToDelete!.length; index++) {
              const photoId = this.photosToDelete![index];
              await firstValueFrom(
                this.observationsService.deletePhotoObservation(
                  observationResponse.id,
                  photoId,
                ),
              );
            }
            newObservationLoaderDialogRef.close();
            this.snackBar.open('Observation modifiée', '', {
              duration: 2000,
            });
            this.router.navigate(['/']);
          },
          error: async () => {
            newObservationLoaderDialogRef.close();
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
    } else {
      this.observationsService.postObservation(observation).subscribe({
        next: async (observationResponse: any) => {
          for (
            let index = 0;
            index < this.photoForm.value.photos!.length;
            index++
          ) {
            const photo = this.photoForm.value.photos![index];
            await firstValueFrom(
              this.observationsService.postPhotoObservation(
                observationResponse.id,
                photo.file,
              ),
            );
          }
          newObservationLoaderDialogRef.close();
          this.snackBar.open('Observation transférée', '', { duration: 2000 });
          this.router.navigate(['/']);
        },
        error: async () => {
          newObservationLoaderDialogRef.close();
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

  deletePhoto(selectedPhoto: any) {
    this.photoForm.value.photos!.splice(
      this.photoForm.value.photos!.findIndex((photo) => {
        if (photo.file && selectedPhoto.file) {
          return photo.file?.name === selectedPhoto.file.name;
        } else {
          this.photosToDelete.push(selectedPhoto.uuid);
          return photo.uuid === selectedPhoto.uuid;
        }
      }),
      1,
    );
  }

  async initIcons() {
    const icons = await this.offlineService.getAllDataInStore('icons');
    this.icons = icons.map((icon) => ({
      ...icon,
      objectUrl: URL.createObjectURL(icon.file),
    }));
  }

  getIconFromStorage(iconId: number) {
    return this.icons.find((icon) => icon.id === iconId)!.objectUrl;
  }

  selectedStepperIndexChange(stepperIndex: number) {
    if (stepperIndex === 4) {
      this.observationIsInvalid =
        this.typeForm.invalid || this.moreDataForm.invalid;
    }
  }
}
