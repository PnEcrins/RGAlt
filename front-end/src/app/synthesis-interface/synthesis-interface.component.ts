import { Component, afterNextRender, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import slugify from 'slugify';

import evenementsRemarquables from './evenements_remarquables.json';

@Component({
  selector: 'app-synthesis-interface',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './synthesis-interface.component.html',
  styleUrl: './synthesis-interface.component.scss',
})
export class SynthesisInterfaceComponent {
  L: any;
  map: any;
  observationsFeatureCollection = evenementsRemarquables;
  observationsLayer: any;
  observationsClusterGroup: any;
  router = inject(Router);

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  ngOnInit() {}

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
  }
}
