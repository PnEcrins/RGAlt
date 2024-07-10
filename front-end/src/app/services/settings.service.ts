import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../types/types';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  httpClient = inject(HttpClient);
  settings = new BehaviorSubject<Settings | null>(null);

  constructor() {}

  getSettings() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/settings/`,
      httpOptions,
    );
  }

  setSettings(settings: Settings) {
    console.log('setSettings', settings);
    this.settings.next(settings);
  }
}
