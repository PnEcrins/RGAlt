import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import {
  CurrentFilters,
  CurrentMap,
  Settings,
  Statistics,
} from '../types/types';
import { OfflineService } from './offline.service';
import { isPlatformBrowser } from '@angular/common';
import { LatLngBounds } from 'leaflet';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept-Language': 'fr-FR',
  }),
};

const httpIconOptions = {
  headers: new HttpHeaders({ Accept: 'image/svg+xml' }),
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  apiUrl = (import.meta as any).env.NG_APP_API_URL;
  httpClient = inject(HttpClient);
  settings = new BehaviorSubject<Settings | null>(null);
  offlineService = inject(OfflineService);
  platformId = inject(PLATFORM_ID);
  platformIsBrowser: boolean;

  currentMap: CurrentMap | undefined;
  currentFilters: CurrentFilters = {
    observationTypes: [],
    observationDates: { start: null, end: null },
  };
  currentFiltersNumber: number = 0;

  constructor() {
    this.platformIsBrowser = isPlatformBrowser(this.platformId);
  }

  getSettings() {
    return this.httpClient.get(`${this.apiUrl}/api/settings/`, httpOptions);
  }

  async setSettings(settings: Settings) {
    if (this.platformIsBrowser) {
      await this.offlineService.writeOrUpdateDataInStore('settings', [
        {
          id: 1,
          settings,
        },
      ]);
      for (let index = 0; index < settings.categories.length; index++) {
        const category = settings.categories[index];
        if (
          Boolean(category.pictogram) &&
          !(await this.offlineService.getDataInStore('icons', category.id))
        ) {
          const file: any = await firstValueFrom(
            this.getIcon(category.pictogram),
          );
          await this.offlineService.writeOrUpdateDataInStore('icons', [
            { id: category.id, pictogram: category.pictogram, file },
          ]);
        }

        for (let index = 0; index < category.children.length; index++) {
          const subCategory = category.children[index];
          if (
            Boolean(subCategory.pictogram) &&
            !(await this.offlineService.getDataInStore('icons', subCategory.id))
          ) {
            const file: any = await firstValueFrom(
              this.getIcon(subCategory.pictogram),
            );
            await this.offlineService.writeOrUpdateDataInStore('icons', [
              {
                id: subCategory.id,
                pictogram: subCategory.pictogram,
                file,
              },
            ]);
          }
        }
      }
    }
    this.settings.next(settings);
  }

  async useOfflineSettings() {
    if (this.platformIsBrowser) {
      const { settings } = await this.offlineService.getDataInStore(
        'settings',
        1,
      );
      this.settings.next(settings);
    }
  }

  getIcon(url: any) {
    return this.httpClient.get(url, {
      ...httpIconOptions,
      responseType: 'blob',
    });
  }

  getCurrentMap(): CurrentMap | undefined {
    return this.currentMap;
  }

  setCurrentMap(currentMapBounds: LatLngBounds | undefined) {
    this.currentMap = { bounds: currentMapBounds };
  }

  getCurrentFilters(): CurrentFilters {
    return this.currentFilters;
  }

  setCurrentFilters(currentFilters: CurrentFilters) {
    this.currentFilters = currentFilters;
  }

  getCurrentFiltersNumber(): number {
    return (
      (this.currentFilters.observationDates.start &&
      this.currentFilters.observationDates.end
        ? 1
        : 0) +
      (this.currentFilters.observationTypes
        ? this.currentFilters.observationTypes.length
        : 0)
    );
  }

  resetCurrentMap() {
    this.currentMap = undefined;
  }

  resetCurrentFilters() {
    this.currentFilters = {
      observationTypes: [],
      observationDates: { start: null, end: null },
    };
  }

  getStatistics(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/api/stats/`, httpOptions);
  }
}
