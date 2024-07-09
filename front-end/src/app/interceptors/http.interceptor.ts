import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';

const TOKEN_HEADER_KEY = 'Authorization';
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  isRefreshing = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  authService = inject(AuthService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (req.url.includes('account') && !req.url.includes('sign-up')) {
      const token = this.authService.getToken();
      if (token) {
        req = this.addTokenHeader(req, token);
      }
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => new Error('Erreur'));
      }),
    );
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;
            this.authService.saveToken(token.accessToken);

            return next.handle(this.addTokenHeader(req, token.accessToken));
          }),
          catchError(() => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => new Error('Erreur'));
          }),
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(req, token))),
    );
  }

  addTokenHeader(req: HttpRequest<any>, token: string) {
    return req.clone({
      headers: req.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`),
    });
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
