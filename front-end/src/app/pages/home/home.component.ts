import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { SettingsService } from '../../services/settings.service';
import { finalize, first } from 'rxjs/operators';
import { observationsFeatureCollection, Statistics } from '../../types/types';
import { ObservationsService } from '../../services/observations.service';
import { MatListModule } from '@angular/material/list';
import { ObservationListItemComponent } from '../../components/observation-list-item/observation-list-item.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    MatCardModule,
    MatIcon,
    MatDivider,
    MatListModule,
    ObservationListItemComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  settingsService = inject(SettingsService);
  observationsService = inject(ObservationsService);
  statistics: Statistics | null = null;
  recentObservations: observationsFeatureCollection | null = null;
  isLoadingRecentObservations = true;
  isLoadingStatistics = true;

  ngOnInit() {
    this.settingsService
      .getStatistics()
      .pipe(
        first(),
        finalize(() => (this.isLoadingStatistics = false)),
      )
      .subscribe({
        next: (statistics) => {
          this.statistics = {
            nbObservations: statistics.observations,
            nbObservers: statistics.active_contributors,
          };
        },
      });

    this.observationsService
      .getObservations('geojson', undefined, undefined, undefined, 1, 3)
      .pipe(
        first(),
        finalize(() => (this.isLoadingRecentObservations = false)),
      )
      .subscribe({
        next: (observations) => {
          this.recentObservations = {
            ...observations,
            features: observations.features,
          };
        },
      });
  }
}
