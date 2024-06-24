import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewObservationComponent } from './new-observation/new-observation.component';
import { SynthesisInterfaceComponent } from './synthesis-interface/synthesis-interface.component';
import { MyOfflineDataComponent } from './my-offline-data/my-offline-data.component';
import { MyObservationsComponent } from './my-observations/my-observations.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { authGuard } from './guards/auth.guard';
import { ObservationDetailComponent } from './observation-detail/observation-detail.component';

export const routes: Routes = [
  {
    path: '',
    title: "Regard d'altitude",
    component: HomeComponent,
    data: {
      title: "Regard d'altitude",
      backButton: false,
      accountButton: true,
    },
  },
  {
    path: 'nouvelle-observation',
    title: "Nouvelle observation • Regard d'altitude",
    component: NewObservationComponent,
    data: {
      title: 'Nouvelle observation',
      backButton: true,
      accountButton: false,
    },
    canActivate: [authGuard],
  },
  {
    path: 'detail-d-une-observation/:observation',
    title: "Détail d'une observation • Regard d'altitude",
    component: ObservationDetailComponent,
    data: {
      title: "Détail d'une observation",
      backButton: true,
      accountButton: false,
    },
    canActivate: [authGuard],
  },
  {
    path: 'interface-de-synthese',
    title: "Interface de synthèse • Regard d'altitude",
    component: SynthesisInterfaceComponent,
    data: {
      title: 'Interface de synthèse',
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'creer-un-compte',
    title: 'Créer un compte',
    component: CreateAccountComponent,
    data: {
      title: 'Créer un compte',
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'se-connecter',
    title: "Se connecter • Regard d'altitude",
    component: LoginComponent,
    data: { title: 'Se connecter', backButton: true, accountButton: false },
  },

  {
    path: 'changer-mon-mot-de-passe',
    title: "Changer mon mot de passe • Regard d'altitude",
    component: ChangePasswordComponent,
    data: {
      title: 'Changer mon mot de passe',
      backButton: true,
      accountButton: false,
    },
    canActivate: [authGuard],
  },
  {
    path: 'mot-de-passe-oublie',
    title: "Mot de passe oublié • Regard d'altitude",
    component: ForgetPasswordComponent,
    data: {
      title: 'Mot de passe oublié',
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'mon-compte',
    title: "Mon compte • Regard d'altitude",
    component: MyAccountComponent,
    data: { title: 'Mon compte', backButton: true, accountButton: false },
    canActivate: [authGuard],
  },
  {
    path: 'mes-observations',
    title: "Mes observations • Regard d'altitude",
    component: MyObservationsComponent,
    data: { title: 'Mes observations', backButton: true, accountButton: false },
    canActivate: [authGuard],
  },
  {
    path: 'mes-donnees-hors-ligne',
    title: 'Mes données hors ligne',
    component: MyOfflineDataComponent,
    data: {
      title: 'Mes données hors ligne',
      backButton: true,
      accountButton: false,
    },
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
