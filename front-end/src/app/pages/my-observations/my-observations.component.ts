import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
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

  async ngOnInit() {
    await this.getMyOfflineObservations();
    this.observationsService.getMyObservations().subscribe({
      next: (success: any) => {
        this.myObservations = success;
      },
      error: () => {},
    });
  }

  async getMyOfflineObservations() {
    this.myOfflineObservations =
      await this.offlineService.getAllDataInStore('observations');
  }

  async sendObservation(myOfflineObservation: Observation) {
    const newObservationLoaderDialogRef = this.dialog.open(
      MyObservationLoaderDialog,
      {
        width: '250px',
        data: { title: 'Téléchargement en cours' },
        disableClose: true,
      },
    );

    const observation: ObservationFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: myOfflineObservation.coordinates!,
      },
      properties: {
        comments: myOfflineObservation.comments,
        event_date: myOfflineObservation.event_date,
        category: myOfflineObservation.category,
      },
    };
    if (Boolean(myOfflineObservation.name)) {
      observation.properties.name = myOfflineObservation.name;
    }
    this.observationsService.sendObservation(observation).subscribe({
      next: async (observationResponse: any) => {
        for (
          let index = 0;
          index < myOfflineObservation.files!.length;
          index++
        ) {
          const file = myOfflineObservation.files![index];
          console.log(file);
          await firstValueFrom(
            this.observationsService.sendPhotoObservation(
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
        await this.refreshObservations();
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

  async refreshObservations() {
    this.offlineService.handleObservationsPending();
    await this.getMyOfflineObservations();
  }

  async sendObservations() {
    for (let index = 0; index < this.myOfflineObservations.length; index++) {
      const myOfflineObservation = this.myOfflineObservations[index];
      await this.sendObservation(myOfflineObservation);
    }
  }
}
