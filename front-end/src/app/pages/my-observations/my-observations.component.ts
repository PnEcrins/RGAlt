import { Component, inject } from '@angular/core';
import {
  Observation,
  Observations,
  observationsFeatureCollection,
} from '../../types/types';
import { OfflineService } from '../../services/offline.service';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import slugify from 'slugify';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ObservationsService } from '../../services/observations.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-my-observations',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
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

  slugify = slugify;

  async ngOnInit() {
    await this.getMyOfflineObservations();
    this.observationsService.getMyObservations().subscribe({
      next: (success: any) => {
        console.log('success', success);
        this.myObservations = success;
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  async getMyOfflineObservations() {
    this.myOfflineObservations =
      await this.offlineService.getAllDataInStore('observations');
  }

  async sendObservation(observation: Observation, refreshObservations = true) {
    this.offlineService.deleteDataInStore('observations', [observation.uuid]);
    if (refreshObservations) {
      await this.refreshObservations();
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

  async refreshObservations() {
    this.offlineService.handleObservationsPending();
    await this.getMyOfflineObservations();
  }

  async sendObservations() {
    for (let index = 0; index < this.myOfflineObservations.length; index++) {
      const myOfflineObservation = this.myOfflineObservations[index];
      await this.sendObservation(myOfflineObservation, false);
    }
    await this.refreshObservations();
  }
}
