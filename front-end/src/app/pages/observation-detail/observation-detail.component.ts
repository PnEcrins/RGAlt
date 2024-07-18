import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observation, ObservationType } from '../../types/types';
import { ObservationsService } from '../../services/observations.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-observation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observation-detail.component.html',
  styleUrl: './observation-detail.component.scss',
})
export class ObservationDetailComponent {
  @Input() observation!: string;
  observationData!: { properties: Observation };
  observationType!: ObservationType;

  observationsService = inject(ObservationsService);
  settingsService = inject(SettingsService);

  ngOnInit() {
    const observationId = this.observation.slice(0, 36);
    this.observationsService.getObservation(observationId).subscribe({
      next: (success: any) => {
        this.observationData = success;
        this.observationType = this.getEventType(
          this.observationData!.properties.category,
        )!;
      },
      error: () => {},
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
