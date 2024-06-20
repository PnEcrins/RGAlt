import { Platform } from '@angular/cdk/platform';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-synthesis-interface',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, RouterLink, MatButtonModule],
  templateUrl: './synthesis-interface.component.html',
  styleUrl: './synthesis-interface.component.scss',
})
export class SynthesisInterfaceComponent {
  isPlatformBrowser: boolean = false;
  L: any;
  map: any;
  marker: any;

  platform = inject(Platform);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    this.initMap();
  }

  async initMap() {
    if (this.isPlatformBrowser) {
      this.L = await import('leaflet');
      await import('leaflet.locatecontrol');

      this.map = this.L.map('map', { zoom: 4, center: [47, 2] });

      this.L.tileLayer(
        'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        {
          attribution: "<a target='_blank' href='https://ign.fr/'>IGN</a>",
        },
      ).addTo(this.map);

      this.L.control
        .locate({ setView: 'once', showPopup: false })
        .addTo(this.map);
    }
  }
}
