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
import { MatCardModule } from '@angular/material/card';

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
    MatCardModule,
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

  @ViewChild('sidenavMenu') private sidenavMenu!: MatSidenav;
  @ViewChild('sidenavAccount') private sidenavAccount!: MatSidenav;

  sideNavAccountItems = [
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
      text: 'Me déconnecter',
      routerLink: null,
      authenficated: true,
      click: () => {
        this.authService.logout();
        this.sidenavAccount.close();
        this.snackBar.open('Vous êtes déconnecté', '', { duration: 2000 });
        this.router.navigate(['..']);
      },
      observationsPending: false,
    },
  ];

  sideNavMenuItems = [
    {
      id: 1,
      text: 'Saisir une nouvelle observation',
      routerLink: null,
      authenficated: null,
      click: () => {
        this.sidenavMenu.close();
        this.router.navigate([
          this.authService.isAuth.value
            ? '/nouvelle-observation'
            : '/se-connecter',
        ]);
      },
      observationsPending: false,
    },
    {
      id: 2,
      text: 'Interface de synthèse',
      routerLink: 'interface-de-synthese',
      authenficated: null,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 3,
      text: 'Mes observations',
      routerLink: 'mes-observations',
      authenficated: true,
      click: () => null,
      observationsPending: true,
    },
    {
      id: 4,
      text: 'Fonds de carte hors ligne',
      routerLink: 'fonds-de-carte-hors-ligne',
      authenficated: true,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 5,
      text: 'En savoir plus',
      routerLink: 'en-savoir-plus',
      authenficated: null,
      click: () => null,
      observationsPending: false,
    },
    {
      id: 6,
      text: 'Mentions légales',
      routerLink: 'legal-notice',
      authenficated: null,
      click: () => null,
      observationsPending: false,
    },
  ];

  currentSideNavMenuItems: any[] = [];
  currentSideNavAccountItems: any[] = [];

  platform = inject(Platform);
  platformId = inject(PLATFORM_ID);

  handleAuthentification(value: any) {
    this.currentSideNavMenuItems = this.sideNavMenuItems.filter(
      (sideNavMenuItem) =>
        sideNavMenuItem.authenficated === value ||
        sideNavMenuItem.authenficated === null,
    );
    this.currentSideNavAccountItems = this.sideNavAccountItems.filter(
      (sideNavAccountItem) =>
        sideNavAccountItem.authenficated === value ||
        sideNavAccountItem.authenficated === null,
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

    this.router.events.subscribe((event) => {
      if (event instanceof ActivationEnd) {
        if (this.sidenavAccount.opened) {
          this.sidenavAccount.close();
        }
        if (this.sidenavMenu.opened) {
          this.sidenavMenu.close();
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

  handleSideNavMenu() {
    if (this.sidenavAccount.opened) {
      this.sidenavAccount.close();
    }
    this.sidenavMenu.toggle();
  }

  handleSideNavAccount() {
    if (this.sidenavMenu.opened) {
      this.sidenavMenu.close();
    }
    this.sidenavAccount.toggle();
  }
}
