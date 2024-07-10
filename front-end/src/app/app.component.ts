import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  ActivationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Location } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Platform } from '@angular/cdk/platform';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { OfflineService } from './services/offline.service';
import { AuthService } from './services/auth.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = '';
  backButton = false;
  accountButton = true;
  initialRoute = true;

  router = inject(Router);
  location = inject(Location);
  authService = inject(AuthService);
  settingsService = inject(SettingsService);

  offlineService = inject(OfflineService);
  snackBar = inject(MatSnackBar);

  @ViewChild('sidenav') private sidenav!: MatSidenav;

  sideNavItems = [
    {
      id: 1,
      text: 'Se connecter',
      routerLink: 'se-connecter',
      authenficated: false,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 2,
      text: 'Mon compte',
      routerLink: 'mon-compte',
      authenficated: true,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 3,
      text: 'Saisir une nouvelle observation',
      routerLink: 'nouvelle-observation',
      authenficated: true,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 4,
      text: 'Interface de synthèse',
      routerLink: 'interface-de-synthese',
      authenficated: null,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 5,
      text: 'Mes observations',
      routerLink: 'mes-observations',
      authenficated: true,
      click: () => null,
      observationsPending: true,
    },
    {
      id: 6,
      text: 'Fonds de carte hors ligne',
      routerLink: 'fonds-de-carte-hors-ligne',
      authenficated: true,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 7,
      text: 'Me déconnecter',
      routerLink: null,
      authenficated: true,
      click: () => {
        this.authService.logout();
        this.sidenav.close();
        this.snackBar.open('Vous êtes déconnecté', '', { duration: 2000 });
        this.router.navigate(['..']);
      },
      observationsPending: false,
    },
  ];

  currentSideNavItems: any[] = [];

  platform = inject(Platform);
  platformId = inject(PLATFORM_ID);

  handleAuthentification(value: any) {
    this.currentSideNavItems = this.sideNavItems.filter(
      (sideNavItem) =>
        sideNavItem.authenficated === value ||
        sideNavItem.authenficated === null,
    );
  }

  isPlatformBrowser: boolean = false;

  constructor() {
    this.isPlatformBrowser = isPlatformBrowser(this.platformId);
    if (this.isPlatformBrowser) {
      this.authService.checkAuth();
    }
    afterNextRender(() => {
      if (this.authService.isAuth) {
        this.offlineService.handleObservationsPending();
      }
    });
  }

  ngOnInit() {
    this.authService.isAuth.subscribe((value) => {
      if (value) {
        this.authService.getAccount().subscribe((account: any) => {
          this.authService.setUser(account);
        });
      }
      this.handleAuthentification(value);
    });

    this.settingsService.getSettings().subscribe((settings: any) => {
      this.settingsService.setSettings(settings);
    });

    this.router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        if (this.sidenav.opened) {
          this.sidenav.close();
        }
        this.title = event.snapshot.data['title'];
        this.backButton = event.snapshot.data['backButton'];
        this.accountButton = event.snapshot.data['accountButton'];
        this.initialRoute =
          !this.router.getCurrentNavigation()?.previousNavigation;
      }
    });
  }

  handleBackButton() {
    if (!this.initialRoute) {
      this.location.back();
    } else {
      this.router.navigate(['..']);
    }
  }
}
