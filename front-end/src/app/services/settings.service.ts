import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Settings } from '../types/types';
import { OfflineService } from './offline.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

const httpIconOptions = {
  headers: new HttpHeaders({ Accept: 'image/svg+xml' }),
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  httpClient = inject(HttpClient);
  settings = new BehaviorSubject<Settings | null>(null);
  offlineService = inject(OfflineService);

  constructor() {}

  getSettings() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/settings/`,
      httpOptions,
    );
  }

  async setSettings(settings: Settings) {
    await this.offlineService.writeOrUpdateDataInStore('settings', [
      {
        id: 1,
        settings,
      },
    ]);
    for (let index = 0; index < settings.categories.length; index++) {
      const category = settings.categories[index];
      if (!(await this.offlineService.getDataInStore('icons', category.id))) {
        const file: any = await firstValueFrom(
          this.getIcon(category.pictogram),
        );
        await this.offlineService.writeOrUpdateDataInStore('icons', [
          { id: category.id, pictogram: category.pictogram, file },
        ]);
      }
    }
    console.log(settings);
    this.settings.next(settings);
  }

  async useOfflineSettings() {
    const { settings } = await this.offlineService.getDataInStore(
      'settings',
      1,
    );
    this.settings.next(settings);
  }

  getIcon(url: any) {
    return this.httpClient.get(url, {
      ...httpIconOptions,
      responseType: 'blob',
    });
  }
}
