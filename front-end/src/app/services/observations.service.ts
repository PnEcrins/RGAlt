import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observation } from '../types/types';

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

  sendObservation(observation: Observation) {
    console.log('sendObservation');
  }
}
