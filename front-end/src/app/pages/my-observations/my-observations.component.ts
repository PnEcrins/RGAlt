import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink } from '@angular/router';
import slugify from 'slugify';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import 'moment/locale/fr';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  Observation,
  ObservationFeature,
  Observations,
  observationsFeatureCollection,
} from '../../types/types';
import { ObservationsService } from '../../services/observations.service';
import { SettingsService } from '../../services/settings.service';
import { OfflineService } from '../../services/offline.service';
import { firstValueFrom } from 'rxjs';
import { MyObservationLoaderDialog } from './dialogs/my-observation-loader-dialog';
import { MatDialog } from '@angular/material/dialog';
import { DeleteObservationDialog } from './dialogs/delete-observation-dialog';
import { ObservationListItemComponent } from '../../components/observation-list-item/observation-list-item.component';

@Component({
  selector: 'app-my-observations',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatSnackBarModule,
    ObservationListItemComponent,
  ],
  templateUrl: './my-observations.component.html',
  styleUrl: './my-observations.component.scss',
})
export class MyObservationsComponent {
  myOfflineObservations: Observations = [];
  myObservations: observationsFeatureCollection | null = null;

  offlineService = inject(OfflineService);
  observationsService = inject(ObservationsService);
  settingsService = inject(SettingsService);
  snackBar = inject(MatSnackBar);

  slugify = slugify;

  readonly dialog = inject(MatDialog);

  router = inject(Router);

  async ngOnInit() {
    await this.getMyOfflineObservations();
    this.refreshObservations();
  }

  async getMyOfflineObservations() {
    this.myOfflineObservations =
      await this.offlineService.getAllDataInStore('observations');
  }

  transformToObservationFeature(
    offlineObservation: Observation,
  ): ObservationFeature {
    const observationFeature: ObservationFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: offlineObservation.coordinates!,
      },
      properties: {
        comments: offlineObservation.comments,
        event_date: offlineObservation.event_date,
        category: offlineObservation.category,
      },
    };
    if (offlineObservation.name) {
      observationFeature.properties.name = offlineObservation.name;
    }
    return observationFeature;
  }

  async postObservation(
    myOfflineObservation: Observation,
    withRefresh: boolean = true,
  ) {
    const newObservationLoaderDialogRef = this.dialog.open(
      MyObservationLoaderDialog,
      {
        width: '250px',
        data: { title: 'Téléchargement en cours' },
        disableClose: true,
      },
    );
    const observation =
      this.transformToObservationFeature(myOfflineObservation);

    this.observationsService.postObservation(observation).subscribe({
      next: async (observationResponse: any) => {
        for (
          let index = 0;
          index < myOfflineObservation.files!.length;
          index++
        ) {
          const file = myOfflineObservation.files![index];
          await firstValueFrom(
            this.observationsService.postPhotoObservation(
              observationResponse.id,
              file,
            ),
          );
        }
        newObservationLoaderDialogRef.close();
        this.snackBar.open(
          `Observation "${observation.properties.name ? observation.properties.name : this.getEventType(observation.properties.category)?.label}" transférée`,
          '',
          { duration: 2000 },
        );
        this.offlineService.deleteDataInStore('observations', [
          myOfflineObservation.uuid!,
        ]);
        await this.refreshMyOfflineObservations();
        this.refreshObservations();
      },
      error: () => {
        newObservationLoaderDialogRef.close();
        this.snackBar.open(
          `Une erreur est survenue lors du transfert de l'observation "${observation.properties.name ? observation.properties.name : this.getEventType(observation.properties.category)?.label}"`,
          '',
          {
            duration: 2000,
          },
        );
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

  async refreshMyOfflineObservations() {
    this.offlineService.handleObservationsPending();
    await this.getMyOfflineObservations();
  }

  async sendObservations() {
    for (let index = 0; index < this.myOfflineObservations.length; index++) {
      const myOfflineObservation = this.myOfflineObservations[index];
      await this.postObservation(myOfflineObservation, false);
    }
    this.refreshObservations();
  }

  editMyOfflineObservation(observation: any) {
    this.router.navigate(['/nouvel-evenement'], {
      state: { data: observation },
    });
  }

  editObservation(observation: any) {
    this.router.navigate(['/modification-d-un-evenement'], {
      state: { data: observation },
    });
  }

  deleteMyOfflineObservation(observation: any) {
    const deleteObservationDialogRef = this.dialog.open(
      DeleteObservationDialog,
      {
        width: '250px',
        data: {
          title: 'Supprimer un brouillon',
          content: 'Êtes vous-sûr de vouloir ce brouillon ?',
        },
      },
    );

    deleteObservationDialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.deleted) {
        const loaderDialogRef = this.dialog.open(MyObservationLoaderDialog, {
          width: '250px',
          data: { title: 'Suppression en  cours' },
        });
        this.offlineService.deleteDataInStore('observations', [
          observation.uuid!,
        ]);
        this.refreshMyOfflineObservations();
        loaderDialogRef.close();
        this.snackBar.open('Le brouillon est supprimé', '', {
          duration: 2000,
        });
      }
    });
  }

  deleteObservation(observation: any) {
    const deleteObservationDialogRef = this.dialog.open(
      DeleteObservationDialog,
      {
        width: '250px',
        data: {
          title: 'Supprimer une observation',
          content: 'Êtes vous-sûr de vouloir cette observation ?',
        },
      },
    );

    deleteObservationDialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.deleted) {
        const loaderDialogRef = this.dialog.open(MyObservationLoaderDialog, {
          width: '250px',
          data: { title: 'Suppression en  cours' },
        });
        await firstValueFrom(
          this.observationsService.deleteObservation(observation.id!),
        );
        this.refreshObservations();
        loaderDialogRef.close();
        this.snackBar.open("L'observation est supprimée", '', {
          duration: 2000,
        });
      }
    });
  }

  refreshObservations() {
    this.observationsService.getMyObservations().subscribe({
      next: (success: any) => {
        this.myObservations = success;
      },
      error: () => {},
    });
  }
}
