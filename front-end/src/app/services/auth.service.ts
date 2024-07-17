import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../types/types';
import { OfflineService } from './offline.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept-Language': 'fr-FR',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(HttpClient);
  offlineService = inject(OfflineService);

  isAuth = new BehaviorSubject<boolean>(false);
  user = new BehaviorSubject<User | null>(null);

  checkAuth() {
    this.isAuth.next(localStorage.getItem('access_token') !== null);
  }

  getAccount() {
    return this.httpClient.get(
      `${environment.apiUrl}/api/accounts/me/`,
      httpOptions,
    );
  }

  login(account: { email: string; password: string }) {
    return this.httpClient.post(
      `${environment.apiUrl}/api/token/`,
      account,
      httpOptions,
    );
  }

  logout() {
    this.offlineService.resetObservationsPending();
    this.removeToken();
    this.removeRefreshToken();
    this.checkAuth();
  }

  createAccount(account: {
    email: string;
    last_name: string;
    first_name: string;
    password: string;
  }) {
    return this.httpClient.post(
      `${environment.apiUrl}/api/accounts/sign-up/`,
      account,
      httpOptions,
    );
  }

  deleteAccount() {
    return this.httpClient.delete(
      `${environment.apiUrl}/api/accounts/me/`,
      httpOptions,
    );
  }

  changePassword(password: string) {
    return this.httpClient.patch(
      `${environment.apiUrl}/api/accounts/me/`,
      { password },
      httpOptions,
    );
  }

  resetPassword() {}

  refreshToken(refreshRoken: string) {
    return this.httpClient.post(
      `${environment.apiUrl}/api/token/refresh/`,
      {
        refresh: refreshRoken,
      },
      httpOptions,
    );
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  saveRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  removeToken() {
    localStorage.removeItem('access_token');
  }

  removeRefreshToken() {
    localStorage.removeItem('refresh_token');
  }

  setUser(user: User) {
    this.user.next(user);
  }
}
