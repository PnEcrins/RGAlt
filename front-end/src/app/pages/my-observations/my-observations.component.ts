import { Component, inject } from '@angular/core';
import { Observation, Observations } from '../../types/types';
import { OfflineService } from '../../services/offline.service';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import slugify from 'slugify';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import evenementsRemarquables from '../../../data/evenements_remarquables.json';
import observationTypes from '../../../data/types.json';

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
  myObservations: Observations = evenementsRemarquables.features
    .slice(0, 10)
    .map((feature) => feature.properties as any);

  offlineService = inject(OfflineService);

  slugify = slugify;

  async ngOnInit() {
    await this.getMyOfflineObservations();
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
      ...observationTypes.map((type) => type),
      ...observationTypes.map((type) => type.children).flat(),
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
