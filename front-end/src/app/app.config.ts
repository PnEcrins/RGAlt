import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { httpInterceptorProviders } from './interceptors/http.interceptor';
import { SettingsService } from './services/settings.service';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    provideAnimationsAsync('animations'),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    provideMomentDateAdapter({
      parse: {
        dateInput: 'DD/MM/YYYY',
      },
      display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      },
    }),
    httpInterceptorProviders,
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: (settingsService: SettingsService) => async () => {
        return new Promise(async (resolve) => {
          settingsService.getSettings().subscribe({
            next: async (settings: any) => {
              await settingsService.setSettings(settings);
              resolve(true);
            },
            error: async () => {
              await settingsService.useOfflineSettings();
              resolve(true);
            },
          });
        });
      },
      deps: [SettingsService],
      multi: true,
    },
  ],
};
