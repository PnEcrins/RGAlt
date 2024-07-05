import {
  Component,
  NgZone,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import slugify from 'slugify';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialog } from './dialogs/filter-dialog';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import moment from 'moment';

import evenementsRemarquables from '../../../data/evenements_remarquables.json';
import { Observations } from '../../types/types';

@Component({
  selector: 'app-synthesis-interface',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
  ],
  templateUrl: './synthesis-interface.component.html',
  styleUrl: './synthesis-interface.component.scss',
})
export class SynthesisInterfaceComponent {
  @ViewChild('expansionPanel') private expansionPanel!: MatExpansionPanel;
  readonly dialog = inject(MatDialog);
  filter: {
    observationTypes: any[];
    observationDates: { start: any; end: any };
  } = { observationTypes: [], observationDates: { start: null, end: null } };

  L: any;
  map: any;
  observationsFeatureCollection: { features: Observations } =
    evenementsRemarquables as any;
  currentObservationsFeatureCollection: any = evenementsRemarquables;
  observationsFeatureCollectionFiltered: any = evenementsRemarquables;

  observationsLayer: L.GeoJSON<any> | null = null;
  observationsClusterGroup: any;
  router = inject(Router);

  expansionPanelIsOpen = false;
  bounds: any;
  private ngZone = inject(NgZone);

  handleObservationsWithinBoundsBind =
    this.handleObservationsWithinBounds.bind(this);

  slugify = slugify;

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  async initMap() {
    this.L = await import('leaflet');
    await import('leaflet.locatecontrol');
    await import('leaflet.markercluster');

    this.map = this.L.default.map('map', { zoom: 4, center: [47, 2] });

    this.L.default
      .tileLayer(
        'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        {
          attribution: "<a target='_blank' href='https://ign.fr/'>IGN</a>",
        },
      )
      .addTo(this.map);

    this.L.default.control
      .locate({ setView: 'once', showPopup: false })
      .addTo(this.map);

    this.observationsLayer = this.L.default.geoJSON(
      this.observationsFeatureCollection,
      {
        pointToLayer: (geoJsonPoint: any, latlng: any) =>
          this.L.default.marker(latlng, {
            icon: this.L.default.divIcon({
              html: `<div class="observation-marker-container">
              <img src="favicon.ico"/>
              </div>`,
              className: 'observation-marker',
              iconSize: 32,
              iconAnchor: [18, 28],
            } as any),
            autoPanOnFocus: false,
          } as any),
        onEachFeature: (geoJsonPoint: any, layer: any) => {
          layer.once('click', () => {
            this.handleObservationPopup(geoJsonPoint, layer);
          });
        },
      },
    );

    this.observationsClusterGroup = this.L.default.markerClusterGroup({
      showCoverageOnHover: false,
      removeOutsideVisibleBounds: false,
      iconCreateFunction: (cluster: any) => {
        return this.L.default.divIcon({
          html:
            '<div class="observations-marker-cluster-group-icon">' +
            cluster.getChildCount() +
            '</div>',
          className: '',
          iconSize: 48,
        } as any);
      },
    });

    this.observationsClusterGroup.addLayer(this.observationsLayer);
    this.map.addLayer(this.observationsClusterGroup);

    this.fitToCurrentObservations();
    this.map.on('moveend', this.handleObservationsWithinBoundsBind);
  }

  handleObservationPopup(geoJsonPoint: any, layer?: any) {
    const imgSrc = geoJsonPoint.properties.picture_path;
    const observationPopup = this.L.default.DomUtil.create('div');
    observationPopup.className = 'observation-popup';
    if (Boolean(imgSrc)) {
      const observationImg = this.L.default.DomUtil.create('img');
      observationImg.src = imgSrc;
      observationPopup.appendChild(observationImg);
    }
    const observationName = this.L.default.DomUtil.create('div');
    observationName.innerHTML = geoJsonPoint.properties.name_event;
    observationName.className = 'observation-name';
    observationPopup.appendChild(observationName);

    const observationDate = this.L.default.DomUtil.create('div');
    observationDate.innerHTML = geoJsonPoint.properties.date_event;
    observationDate.className = 'observation-date';
    observationPopup.appendChild(observationDate);

    const observationButton = this.L.default.DomUtil.create('button');
    observationButton.innerHTML = 'Afficher le détail';
    observationButton.className = 'observation-button';
    observationButton.onclick = () => {
      const slug = slugify(
        `${geoJsonPoint.properties.id_event}-${geoJsonPoint.properties.name_event}`,
      );
      this.router.navigate(['/detail-d-une-observation', slug]);
    };
    observationPopup.appendChild(observationButton);
    if (layer) {
      layer
        .bindPopup(observationPopup, {
          interactive: true,
          autoPan: false,
          closeButton: false,
        } as any)
        .openPopup();
    } else {
      this.map?.openPopup(
        observationPopup,
        this.L.default.latLng(
          geoJsonPoint.geometry.coordinates[1],
          geoJsonPoint.geometry.coordinates[0],
        ),
        { interactive: true, autoPan: false, closeButton: false },
      );
    }
  }

  openFilterDialog() {
    const deleteDialogRef = this.dialog.open(FilterDialog, {
      width: '100%',
      maxWidth: '50vw',
      height: '100%',
      maxHeight: '50vh',
      data: this.filter,
    });

    deleteDialogRef.afterClosed().subscribe((result) => {
      if (
        result &&
        result.filter &&
        ((result.filter.observationTypes &&
          result.filter.observationTypes.length > 0) ||
          (result.filter.observationDates.start &&
            result.filter.observationDates.end))
      ) {
        let observationFeatures = null;

        if (
          Boolean(result.filter.observationTypes) &&
          result.filter.observationTypes.length > 0
        ) {
          this.filter.observationTypes = result.filter.observationTypes;
          observationFeatures =
            this.observationsFeatureCollection.features.filter((feature: any) =>
              result.filter.observationTypes
                .map((observationType: any) => observationType.id)
                .includes(feature.properties.id_event_type),
            );
        }
        if (
          Boolean(
            result.filter.observationDates &&
              result.filter.observationDates.start &&
              result.filter.observationDates.end,
          )
        ) {
          this.filter.observationTypes = result.filter.observationTypes;
          if (observationFeatures) {
            observationFeatures = observationFeatures.filter(
              (observationFeature: any) =>
                moment(observationFeature.properties.date_event).isBetween(
                  result.filter.observationDates.start,
                  result.filter.observationDates.end,
                  null,
                  '[]',
                ),
            );
          } else {
            observationFeatures =
              this.observationsFeatureCollection.features.filter(
                (observationFeature: any) =>
                  moment(observationFeature.properties.date_event).isBetween(
                    result.filter.observationDates.start,
                    result.filter.observationDates.end,
                    null,
                    '[]',
                  ),
              );
          }
        }
        this.observationsFeatureCollectionFiltered = {
          ...this.observationsFeatureCollection,
          features: observationFeatures || [],
        };
      } else {
        this.filter = {
          observationTypes: [],
          observationDates: { start: null, end: null },
        };
        this.observationsFeatureCollectionFiltered =
          this.observationsFeatureCollection;
      }
      if (result && !result.cancel) {
        this.updateMap();
        this.fitToCurrentObservations();
      }
    });
  }

  expansionPanelOpen() {
    this.expansionPanelIsOpen = true;
  }

  expansionPanelClose() {
    this.expansionPanelIsOpen = false;
  }

  fitToCurrentObservations() {
    if (this.observationsFeatureCollectionFiltered.features.length > 0) {
      this.bounds = this.L.default.latLngBounds(
        this.observationsFeatureCollectionFiltered.features.map(
          (feature: any) => [
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
          ],
        ),
      );

      this.bounds && this.map.fitBounds(this.bounds);
    }
  }

  handleObservationsWithinBounds() {
    this.ngZone.run(() => {
      this.currentObservationsFeatureCollection = {
        ...this.currentObservationsFeatureCollection,
        features: this.observationsFeatureCollectionFiltered.features.filter(
          (feature: any) =>
            this.map
              .getBounds()
              .contains(
                this.L.default.latLng(
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ),
              ),
        ),
      };
    });
  }

  handleObservationView(observation: any) {
    this.map.setView(
      [
        observation.geometry.coordinates[1],
        observation.geometry.coordinates[0],
      ],
      19,
    );
    this.handleObservationPopup(observation);
    this.expansionPanel.close();
  }

  updateMap() {
    this.observationsLayer!.clearLayers();
    this.observationsLayer!.addData(this.observationsFeatureCollectionFiltered);
    this.observationsClusterGroup.clearLayers();
    this.observationsClusterGroup.addLayer(this.observationsLayer);
  }
}
