import {
  Component,
  inject,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

import { Observation, ObservationType } from '../../types/types';
import { ObservationsService } from '../../services/observations.service';
import { SettingsService } from '../../services/settings.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-observation-detail',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './observation-detail.component.html',
  styleUrl: './observation-detail.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ObservationDetailComponent implements OnInit {
  route = inject(ActivatedRoute);

  @Input() observation!: string;
  observationData!: { properties: Observation };
  observationType!: ObservationType | undefined;

  observationsService = inject(ObservationsService);
  settingsService = inject(SettingsService);

  L: any;
  map: any;
  observationLayer: L.GeoJSON<any> | null = null;

  routeDataSubscription: Subscription | null = null;

  ngOnInit() {
    this.routeDataSubscription = this.route.data.subscribe((data) => {
      const resolvedData = data['resolvedData'];
      this.observationData = resolvedData.observationData;
      this.observationType = this.getEventType(
        this.observationData!.properties.category,
      );
    });
  }

  ngOnDestroy() {
    this.routeDataSubscription?.unsubscribe();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  async initMap() {
    this.L = await import('leaflet');
    await import('leaflet.locatecontrol');
    await import('leaflet.offline');

    this.map = this.L.default.map('map', {
      zoom: environment.baseMaps.zoom,
      center: environment.baseMaps.center,
    });

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

    this.L.default.control
      .locate({ setView: 'once', showPopup: false })
      .addTo(this.map);
    this.observationLayer = this.L.default.geoJSON(this.observationData, {
      pointToLayer: (geoJsonPoint: any, latlng: any) => {
        const icon = this.observationType;
        return this.L.default.marker(latlng, {
          icon: this.L.default.divIcon({
            html:
              icon && icon.pictogram
                ? `<div class="observation-marker-container">
                <img src="${icon.pictogram}"/>
                </div>`
                : `<div class="observation-marker-container">
                </div>`,
            className: 'observation-marker',
            iconSize: 32,
            iconAnchor: [18, 28],
          } as any),
          autoPanOnFocus: false,
        } as any);
      },
    });
    this.map.addLayer(this.observationLayer);
    this.map.fitBounds(this.observationLayer!.getBounds());
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
