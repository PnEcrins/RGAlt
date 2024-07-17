import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ObservationFeature } from '../types/types';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept-Language': 'fr-FR',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ObservationsService {
  httpClient = inject(HttpClient);

  constructor() {}

  getObservations(
    observationTypesId?: number[],
    startDate?: string,
    endDate?: string,
  ) {
    let url = `${environment.apiUrl}/api/observations/`;
    if (observationTypesId) {
      for (let index = 0; index < observationTypesId.length; index++) {
        const observationTypeId = observationTypesId[index];
        url = url.concat(
          `${index === 0 ? '?' : '&'}categories=${observationTypeId}`,
        );
      }
    }
    if (startDate && endDate) {
      url = url.concat(
        `${observationTypesId ? '&' : '?'}event_date_after=${startDate}&event_date_before=${endDate}`,
      );
    }
    return this.httpClient.get(`${url}`, httpOptions);
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
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'image');
    return this.httpClient.post(
      `${environment.apiUrl}/api/accounts/me/observations/${observationId}/medias/`,
      formData,
    );
  }
}
