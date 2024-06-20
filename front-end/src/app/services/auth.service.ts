import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(HttpClient);
  isAuth = new BehaviorSubject<boolean>(false);

  checkAuth() {
    this.isAuth.next(localStorage.getItem('token') !== null);
  }

  login() {
    localStorage.setItem('token', 'token');
    this.checkAuth();
  }

  logout() {
    localStorage.removeItem('token');
    this.checkAuth();
  }
}
