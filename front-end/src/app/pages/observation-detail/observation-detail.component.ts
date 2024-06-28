import { Component, Input } from '@angular/core';

import evenementsRemarquables from '../../../data/evenements_remarquables.json';
import observationTypes from '../../../data/types.json';

@Component({
  selector: 'app-observation-detail',
  standalone: true,
  imports: [],
  templateUrl: './observation-detail.component.html',
  styleUrl: './observation-detail.component.scss',
})
export class ObservationDetailComponent {
  @Input() observation!: string;
  observationData: any;
  observationType: any;

  ngOnInit() {
    const observationId = Number(this.observation.split('-')[0]);
    this.observationData = evenementsRemarquables.features.find(
      (feature) => feature.properties.id_event === observationId,
    );
    this.observationType = observationTypes.find(
      (observationType) =>
        observationType.id === this.observationData.properties.id_event_type,
    );
  }
}
