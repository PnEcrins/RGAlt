import { Component, Input } from '@angular/core';

import evenementsRemarquables from '../../../data/evenements_remarquables.json';
import observationTypes from '../../../data/types.json';
import { Observation, ObservationType } from '../../types/types';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    const observationId = Number(this.observation.split('-')[0]);
    this.observationData = (evenementsRemarquables.features as any).find(
      (feature: any) => feature.properties.uuid === observationId,
    );
    this.observationType = this.getEventType(
      this.observationData!.properties.category,
    )!;
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
}
