import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
  apiUrl = (import.meta as any).env.NG_APP_API_URL;
  httpClient = inject(HttpClient);

  constructor() {}

  getObservations(
    observationTypesId?: number[],
    startDate?: string,
    endDate?: string,
  ) {
    let url = `${this.apiUrl}/api/observations/`;
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
        `${observationTypesId && observationTypesId.length > 0 ? '&' : '?'}event_date_after=${startDate}&event_date_before=${endDate}`,
      );
    }
    return this.httpClient.get(`${url}`, httpOptions);
  }

  getObservation(observationId: string) {
    return this.httpClient.get(
      `${this.apiUrl}/api/observations/${observationId}/`,
      httpOptions,
    );
  }

  getMyObservations() {
    return this.httpClient.get(
      `${this.apiUrl}/api/accounts/me/observations/`,
      httpOptions,
    );
  }

  sendObservation(observation: ObservationFeature) {
    return this.httpClient.post(
      `${this.apiUrl}/api/accounts/me/observations/`,
      { ...observation },
      httpOptions,
    );
  }

  sendPhotoObservation(observationId: any, file: any) {
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'image');
    return this.httpClient.post(
      `${this.apiUrl}/api/accounts/me/observations/${observationId}/medias/`,
      formData,
    );
  }
}
