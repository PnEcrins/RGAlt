import { Component, NgZone, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import slugify from 'slugify';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialog } from './dialogs/filter-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import moment from 'moment';

import evenementsRemarquables from './evenements_remarquables.json';

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
  readonly dialog = inject(MatDialog);
  filter: {
    observationTypes: any[];
    observationDates: { start: any; end: any };
  } = { observationTypes: [], observationDates: { start: null, end: null } };

  L: any;
  map: any;
  observationsFeatureCollection = evenementsRemarquables;
  currentObservationsFeatureCollection = evenementsRemarquables;
  observationsFeatureCollectionFiltered = evenementsRemarquables;

  observationsLayer: any;
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
          layer.once('click', async () => {
            const imgSrc = geoJsonPoint.properties.picture_path;
            const observationDeparturePopup =
              this.L.default.DomUtil.create('div');
            observationDeparturePopup.className = 'observation-departure-popup';
            if (Boolean(imgSrc)) {
              const observationImg = this.L.default.DomUtil.create('img');
              observationImg.src = imgSrc;
              observationDeparturePopup.appendChild(observationImg);
            }
            const observationName = this.L.default.DomUtil.create('div');
            observationName.innerHTML = geoJsonPoint.properties.name_event;
            observationName.className = 'observation-name';
            observationDeparturePopup.appendChild(observationName);

            const observationButton = this.L.default.DomUtil.create('button');
            observationButton.innerHTML = 'Afficher le détail';
            observationButton.className = 'observation-button';
            observationButton.onclick = () => {
              const slug = slugify(
                `${geoJsonPoint.properties.id_event}-${geoJsonPoint.properties.name_event}`,
              );
              this.router.navigate(['/detail-d-une-observation', slug]);
            };
            observationDeparturePopup.appendChild(observationButton);
            layer
              .bindPopup(observationDeparturePopup, {
                interactive: true,
                autoPan: false,
                closeButton: false,
              } as any)
              .openPopup();
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
        (result.filter.observationTypes ||
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
            this.observationsFeatureCollection.features.filter((feature) =>
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
              (observationFeature) =>
                moment(observationFeature.properties.date_create).isBetween(
                  result.filter.observationDates.start,
                  result.filter.observationDates.end,
                  null,
                  '[]',
                ),
            );
          } else {
            observationFeatures =
              this.observationsFeatureCollection.features.filter(
                (observationFeature) =>
                  moment(observationFeature.properties.date_create).isBetween(
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

  expansionPanelAfterCollapse() {
    this.map.invalidateSize();
  }

  expansionPanelAfterExpand() {
    this.map.invalidateSize();
  }

  fitToCurrentObservations() {
    if (this.observationsFeatureCollectionFiltered.features.length > 0) {
      this.bounds = this.L.default.latLngBounds(
        this.observationsFeatureCollectionFiltered.features.map((feature) => [
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0],
        ]),
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
  }

  updateMap() {
    this.observationsLayer.clearLayers();
    this.observationsLayer.addData(this.observationsFeatureCollectionFiltered);
    this.observationsClusterGroup.clearLayers();
    this.observationsClusterGroup.addLayer(this.observationsLayer);
  }
}
