import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ObservationFeature } from '../types/types';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

const httpMediaOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' }),
};

@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  httpClient = inject(HttpClient);

  constructor() {}

  getObservations() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/observations/`,
      httpOptions,
    );
  }

  getObservation(observationId: string) {
    return this.httpClient.get(
      `${environment.apiUrl}/api/observations/${observationId}/`,
      httpOptions,
    );
  }

  getMyObservations() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/accounts/me/observations/`,
      httpOptions,
    );
  }

  sendObservation(observation: ObservationFeature) {
    return this.httpClient.post(
      `${environment.apiUrl}/api/accounts/me/observations/`,
      { ...observation },
      httpOptions,
    );
  }

  sendPhotoObservation(observationId: any, file: any) {
    console.log('sendPhotoObservation', observationId, file);
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'image');
    return this.httpClient.post(
      `${environment.apiUrl}/api/accounts/me/observations/${observationId}/medias/`,
      formData,
    );
  }
}
