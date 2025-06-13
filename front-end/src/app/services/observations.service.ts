import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ObservationFeature } from '../types/types';
import { Observable, of } from 'rxjs';

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
    format: string,
    observationTypesId?: number[],
    startDate?: string,
    endDate?: string,
    page?: number,
    page_size?: number,
    fields?: string[],
    in_bbox?: number[],
  ): Observable<any> {
    let url = `${this.apiUrl}/api/observations/?format=${format}`;

    if (observationTypesId) {
      for (let index = 0; index < observationTypesId.length; index++) {
        const observationTypeId = observationTypesId[index];
        url = url.concat(`&categories=${observationTypeId}`);
      }
    }
    if (startDate && endDate) {
      url = url.concat(
        `&event_date_after=${startDate}&event_date_before=${endDate}`,
      );
    }

    if (fields) {
      url = url.concat(`&fields=${fields.join(',')}`);
    }

    if (in_bbox) {
      url = url.concat(`&in_bbox=${in_bbox.join(',')}`);
    }

    if (page && page_size) {
      url = url.concat(`&page=${page}&page_size=${page_size}`);
    }

    return this.httpClient.get(`${url}`, httpOptions);
  }

  getObservation(observationId: string) {
    return this.httpClient.get(
      `${this.apiUrl}/api/observations/${observationId}/?format=geojson`,
      httpOptions,
    );
  }

  getMyObservations() {
    return this.httpClient.get(
      `${this.apiUrl}/api/accounts/me/observations/?format=geojson`,
      httpOptions,
    );
  }

  postObservation(observation: ObservationFeature) {
    return this.httpClient.post(
      `${this.apiUrl}/api/accounts/me/observations/`,
      { ...observation },
      httpOptions,
    );
  }

  putObservation(observationUuid: string, observation: ObservationFeature) {
    return this.httpClient.put(
      `${this.apiUrl}/api/accounts/me/observations/${observationUuid}/`,
      { ...observation },
      httpOptions,
    );
  }

  deleteObservation(observationUuid: string) {
    return this.httpClient.delete(
      `${this.apiUrl}/api/accounts/me/observations/${observationUuid}/`,
      httpOptions,
    );
  }

  postPhotoObservation(observationId: any, file: any) {
    const formData = new FormData();
    formData.append('media_file', file);
    formData.append('media_type', 'image');
    return this.httpClient.post(
      `${this.apiUrl}/api/accounts/me/observations/${observationId}/medias/`,
      formData,
    );
  }

  deletePhotoObservation(observationUuid: string, photoId: string) {
    return this.httpClient.delete(
      `${this.apiUrl}/api/accounts/me/observations/${observationUuid}/medias/${photoId}/`,
      httpOptions,
    );
  }
}
