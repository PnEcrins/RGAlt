import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
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
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import {
  observationsFeatureCollection,
  ObservationType,
} from '../../types/types';

import { ObservationsService } from '../../services/observations.service';
import { SettingsService } from '../../services/settings.service';
import { environment } from '../../../environments/environment';
import { ObservationListItemComponent } from '../../components/observation-list-item/observation-list-item.component';
import { ExportDialog } from './dialogs/export-dialog';

import { fromEvent } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

interface PaginatedObservationsResponse {
  features: any[];
  next: boolean;
  count: number;
}

@Component({
  selector: 'app-synthesis-interface',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatListModule,
    ObservationListItemComponent,
    MatProgressSpinner,
  ],
  templateUrl: './synthesis-interface.component.html',
  styleUrl: './synthesis-interface.component.scss',
})
export class SynthesisInterfaceComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  readonly dialog = inject(MatDialog);
  readonly cdr = inject(ChangeDetectorRef);

  filter: {
    observationTypes: any[];
    observationDates: { start: any; end: any };
  } = { observationTypes: [], observationDates: { start: null, end: null } };

  L: any;
  map: any;
  observationsFeatureCollection: observationsFeatureCollection | null = null;
  currentObservationsFeatureCollection: observationsFeatureCollection | null =
    null;
  currentObservationsCount = 0;

  observationsFeatureCollectionFiltered: observationsFeatureCollection | null =
    null;
  observationsLayer: L.GeoJSON<any> | null = null;
  observationsClusterGroup: any;
  router = inject(Router);
  observationsService = inject(ObservationsService);
  settingsService = inject(SettingsService);

  bounds: any;
  ngZone = inject(NgZone);

  @ViewChild('listContainer') listContainer!: ElementRef<HTMLDivElement>;
  currentPage = 1;
  itemsPerPage = 20;
  isLoading = false;
  hasMoreData = true;
  scrollSubscription: Subscription | null = null;
  dataSubscription: Subscription | null = null;

  handleObservationsWithinBoundsBind =
    this.handleObservationsWithinBounds.bind(this);

  slugify = slugify;

  currentFiltersNumber = 0;

  showMap = true;
  isInitialFit = true;

  constructor() {
    afterNextRender(() => {
      this.filter = this.settingsService.getCurrentFilters();
      this.currentFiltersNumber =
        this.settingsService.getCurrentFiltersNumber();
      this.initMap();
    });
  }

  async initMap() {
    this.L = await import('leaflet');
    await import('leaflet.locatecontrol');
    await import('leaflet.markercluster');
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

    this.observationsLayer = this.L.default.geoJSON(
      this.observationsFeatureCollection,
      {
        pointToLayer: (geoJsonPoint: any, latlng: any) => {
          const icon = this.getEventType(geoJsonPoint.properties.category);
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

    this.handleFeaturesOnMap();
  }

  handleObservationPopup(geoJsonPoint: any, layer?: any) {
    this.observationsService
      .getObservation(geoJsonPoint.id)
      .pipe(first())
      .subscribe({
        next: (fullObservation: any) => {
          const imgSrc =
            fullObservation.properties.main_picture?.thumbnails.small;
          const observationPopup = this.L.default.DomUtil.create('div');
          observationPopup.className = 'observation-popup';
          if (Boolean(imgSrc)) {
            const observationImg = this.L.default.DomUtil.create('img');
            observationImg.src = imgSrc;
            observationPopup.appendChild(observationImg);
          }
          const observationName = this.L.default.DomUtil.create('div');
          observationName.innerHTML =
            fullObservation.properties.name &&
            fullObservation.properties.name !== ''
              ? fullObservation.properties.name
              : this.getEventType(fullObservation.properties.category)!.label;
          observationName.className = 'observation-name';
          observationPopup.appendChild(observationName);

          const observationDate = this.L.default.DomUtil.create('div');
          observationDate.innerHTML = moment(
            fullObservation.properties.event_date,
          ).format('DD-MM-YYYY');
          observationDate.className = 'observation-date';
          observationPopup.appendChild(observationDate);

          const observationButton = this.L.default.DomUtil.create('button');
          observationButton.innerHTML = 'Afficher le détail';
          observationButton.className = 'observation-button';
          observationButton.onclick = () => {
            const slug = slugify(
              `${fullObservation.id}-${fullObservation.properties.name}`,
            );
            this.router.navigate(['/evenement', slug]);
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
        },
      });
  }

  openFilterDialog() {
    const filterDialogRef = this.dialog.open(FilterDialog, {
      width: '100%',
      maxWidth: '50vw',
      height: '100%',
      maxHeight: '50vh',
      data: this.filter,
    });

    filterDialogRef.afterClosed().subscribe(async (result) => {
      if (result && result.filter) {
        this.initObservationsFeatures();
        this.currentPage = 1;
        this.hasMoreData = true;

        this.filter.observationTypes = result.filter.observationTypes;
        this.filter.observationDates.start =
          result.filter.observationDates.start;
        this.filter.observationDates.end = result.filter.observationDates.end;
        this.currentFiltersNumber =
          this.settingsService.getCurrentFiltersNumber();

        this.handleFeaturesOnMap(true);
        this.settingsService.setCurrentFilters(this.filter);
      }
    });
  }

  fitToCurrentObservations() {
    if (this.currentObservationsFeatureCollection!.features.length > 0) {
      this.bounds = this.L.default.latLngBounds(
        this.isInitialFit && this.settingsService.currentMap?.bounds
          ? this.settingsService.currentMap?.bounds
          : this.currentObservationsFeatureCollection!.features.map(
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
    if (this.isInitialFit) {
      this.isInitialFit = false;
      return;
    }

    this.updateListForCurrentBounds();
    this.scrollToTop();
  }

  updateListForCurrentBounds(resetBounds?: boolean) {
    const mapBounds =
      this.isInitialFit && this.settingsService.currentMap?.bounds
        ? this.settingsService.currentMap?.bounds
        : this.map.getBounds();
    this.settingsService.setCurrentMap(resetBounds ? null : mapBounds);

    this.currentPage = 1;
    this.hasMoreData = true;

    this.observationsFeatureCollectionFiltered = {
      type: 'FeatureCollection',
      features: [],
    };

    this.handleFeaturesOnList();
  }

  handleObservationView(observation: any) {
    this.map.setView(
      [
        observation.geometry.coordinates[1],
        observation.geometry.coordinates[0],
      ],
      environment.baseMaps.zoomTo,
    );
    this.handleObservationPopup(observation);
    this.handleView();
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

  handleView() {
    this.showMap = !this.showMap;
  }

  ngAfterViewInit() {
    this.setupScrollListener();
  }

  loadInitialObservations() {
    this.initObservationsFeatures();
  }

  initObservationsFeatures() {
    this.currentObservationsFeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    this.currentPage = 1;
    this.hasMoreData = true;
    this.observationsFeatureCollectionFiltered = {
      type: 'FeatureCollection',
      features: [],
    };
  }

  setupScrollListener() {
    if (!this.listContainer) return;

    const scrollableElement = this.listContainer.nativeElement;

    this.scrollSubscription = fromEvent(scrollableElement, 'scroll')
      .pipe(
        debounceTime(50),
        filter(() => {
          return !this.isLoading && this.hasMoreData;
        }),
        filter(() => this.isScrolledToBottom(scrollableElement)),
      )
      .subscribe(() => {
        this.handleFeaturesOnList();
      });
  }

  isScrolledToBottom(element: HTMLElement): boolean {
    const threshold = 150;
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;
    return position >= height - threshold;
  }

  ngOnInit() {
    this.loadInitialObservations();
  }

  handleFeaturesOnMap(resetBounds?: boolean) {
    const observationTypes = this.filter.observationTypes
      ? this.filter.observationTypes
          .map((observationType: any) =>
            observationType.children && observationType.children.length > 0
              ? observationType.children.map(
                  (observationTypeChildren: ObservationType) =>
                    observationTypeChildren.id,
                )
              : observationType.id,
          )
          .flat()
      : undefined;

    this.observationsService
      .getObservations(
        'geojson',
        observationTypes,
        this.filter.observationDates.start
          ? moment(this.filter.observationDates.start.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        this.filter.observationDates.end
          ? moment(this.filter.observationDates.end.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        undefined,
        undefined,
        ['location', 'uuid', 'category'],
      )
      .pipe(first())
      .subscribe({
        next: (success: any) => {
          this.observationsFeatureCollection = success;
          this.currentObservationsFeatureCollection = success;

          this.observationsLayer!.clearLayers();
          this.observationsLayer!.addData(
            this.currentObservationsFeatureCollection!,
          );

          this.observationsClusterGroup.clearLayers();
          this.observationsClusterGroup.addLayer(this.observationsLayer);
          this.fitToCurrentObservations();
          this.map.off('moveend', this.handleObservationsWithinBoundsBind);
          this.map.on('moveend', this.handleObservationsWithinBoundsBind);
          this.updateListForCurrentBounds(resetBounds);
        },
      });
  }

  handleFeaturesOnList() {
    if (this.isLoading || !this.hasMoreData) {
      return;
    }

    this.isLoading = true;

    this.dataSubscription?.unsubscribe();

    const observationTypes = this.filter.observationTypes
      ? this.filter.observationTypes
          .map((observationType: any) =>
            observationType.children && observationType.children.length > 0
              ? observationType.children.map(
                  (observationTypeChildren: ObservationType) =>
                    observationTypeChildren.id,
                )
              : observationType.id,
          )
          .flat()
      : undefined;
    let bboxArray: number[] | undefined;
    const currentBounds = this.settingsService.currentMap?.bounds;
    if (currentBounds) {
      bboxArray = [
        currentBounds.getWest(),
        currentBounds.getSouth(),
        currentBounds.getEast(),
        currentBounds.getNorth(),
      ];
    }

    this.dataSubscription = this.observationsService
      .getObservations(
        'geojson',
        observationTypes,
        this.filter.observationDates.start
          ? moment(this.filter.observationDates.start.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        this.filter.observationDates.end
          ? moment(this.filter.observationDates.end.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        this.currentPage,
        this.itemsPerPage,
        ['location', 'uuid', 'category', 'name', 'event_date', 'main_picture'],
        bboxArray,
      )
      .subscribe({
        next: (response: PaginatedObservationsResponse) => {
          if (response && response.features) {
            this.currentObservationsCount = response.count;
            this.observationsFeatureCollectionFiltered!.features = [
              ...this.observationsFeatureCollectionFiltered!.features,
              ...response.features,
            ];
            this.currentPage++;
            this.hasMoreData = response.next;
          } else {
            this.hasMoreData = false;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.hasMoreData = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  exportObservations() {
    const observationTypes = this.filter.observationTypes
      ? this.filter.observationTypes
          .map((observationType: any) =>
            observationType.children && observationType.children.length > 0
              ? observationType.children.map(
                  (observationTypeChildren: ObservationType) =>
                    observationTypeChildren.id,
                )
              : observationType.id,
          )
          .flat()
      : undefined;

    let bboxArray: number[] | undefined;
    const currentBounds = this.settingsService.currentMap?.bounds;
    if (currentBounds) {
      bboxArray = [
        currentBounds.getWest(),
        currentBounds.getSouth(),
        currentBounds.getEast(),
        currentBounds.getNorth(),
      ];
    }

    const downloadObservations: Observable<any> =
      this.observationsService.getObservations(
        'geojson',
        observationTypes,
        this.filter.observationDates.start
          ? moment(this.filter.observationDates.start.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        this.filter.observationDates.end
          ? moment(this.filter.observationDates.end.toDate()).format(
              'YYYY-MM-DD',
            )
          : undefined,
        undefined,
        undefined,
        undefined,
        bboxArray,
      );

    this.dialog.open(ExportDialog, {
      data: {
        nbObservations: this.currentObservationsCount,
        downloadObservations,
      },
    });
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
    this.dataSubscription?.unsubscribe();
    if (this.map) {
      this.map.off('moveend', this.handleObservationsWithinBoundsBind);
    }
  }

  scrollToTop() {
    if (this.listContainer && this.listContainer.nativeElement) {
      this.listContainer.nativeElement.scrollTop = 0;
    }
  }
}
