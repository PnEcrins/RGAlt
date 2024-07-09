import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
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

  getObservation(observationId: number) {
    return this.httpClient.get(
      `${environment.apiUrl}/api/observations/${observationId}/`,
      httpOptions,
    );
  }
}
