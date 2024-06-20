import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
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
import { AuthService } from './services/auth.service';

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

  @ViewChild('sidenav') private sidenav!: MatSidenav;

  sideNavItems = [
    {
      id: 1,
      text: 'Se connecter',
      routerLink: 'se-connecter',
      authenficated: false,
      click: () => null,
    },
    {
      id: 2,
      text: 'Mon compte',
      routerLink: 'mon-compte',
      authenficated: true,
      click: () => null,
    },
    {
      id: 3,
      text: 'Mes observations',
      routerLink: 'mes-observations',
      authenficated: true,
      click: () => null,
    },
    {
      id: 4,
      text: 'Mes données hors ligne',
      routerLink: 'mes-donnees-hors-ligne',
      authenficated: true,
      click: () => null,
    },
    {
      id: 5,
      text: 'Me déconnecter',
      routerLink: null,
      authenficated: true,
      click: () => {
        this.authService.logout();
        this.sidenav.close();
      },
    },
  ];

  currentSideNavItems: any[] = [];

  handleAuthentification(value: any) {
    this.currentSideNavItems = this.sideNavItems.filter(
      (sideNavItem) => sideNavItem.authenficated === value,
    );
  }

  ngOnInit() {
    this.authService.checkAuth();
    this.authService.isAuth.subscribe((value) => {
      this.handleAuthentification(value);
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
