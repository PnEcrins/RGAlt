import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import slugify from 'slugify';

import { ObservationFeature, ObservationType } from '../../types/types'; // Assurez-vous que le chemin est correct
import { SettingsService } from '../../services/settings.service'; // Assurez-vous que le chemin est correct

@Component({
  selector: 'app-observation-list-item',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    DatePipe, // Importez DatePipe pour le formatage de la date
  ],
  templateUrl: './observation-list-item.component.html',
  styleUrl: './observation-list-item.component.scss',
})
export class ObservationListItemComponent {
  @Input({ required: true }) observation!: ObservationFeature;
  @Input({ required: false }) withViewObservation = true;
  @Output() viewObservation = new EventEmitter<ObservationFeature>();

  settingsService = inject(SettingsService);

  slugify = slugify;

  getEventType(eventTypeId: number): ObservationType | undefined {
    if (!this.settingsService.settings.value?.categories) {
      return undefined;
    }
    const eventTypes = [
      ...this.settingsService.settings.value.categories,
      ...this.settingsService.settings.value.categories.flatMap(
        (type) => type.children || [],
      ),
    ];
    return eventTypes.find(
      (observationType) => observationType.id === eventTypeId,
    );
  }

  onViewClick(): void {
    this.viewObservation.emit(this.observation);
  }
}
