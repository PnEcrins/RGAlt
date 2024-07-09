import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  httpClient = inject(HttpClient);

  constructor() {}

  getSettings() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/settings/`,
      httpOptions,
    );
  }
}
