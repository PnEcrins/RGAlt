import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NewObservationComponent } from './pages/new-observation/new-observation.component';
import { SynthesisInterfaceComponent } from './pages/synthesis-interface/synthesis-interface.component';
import { MyOfflineDataComponent } from './pages/my-offline-data/my-offline-data.component';
import { MyObservationsComponent } from './pages/my-observations/my-observations.component';
import { MyAccountComponent } from './pages/my-account/my-account.component';
import { LoginComponent } from './pages/login/login.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { authGuard } from './guards/auth.guard';
import { ObservationDetailComponent } from './pages/observation-detail/observation-detail.component';
import { LearnMoreComponent } from './pages/learn-more/learn-more.component';
import { LegalNoticeComponent } from './pages/legal-notice/legal-notice.component';

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
      observation: null,
    },
    canActivate: [authGuard],
  },
  {
    path: 'modification-d-une-observation',
    title: "Modification d'une observation • Regard d'altitude",
    component: NewObservationComponent,
    data: {
      title: "Modification d'une observation",
      backButton: true,
      accountButton: false,
      observation: null,
    },
    canActivate: [authGuard],
  },
  {
    path: 'evenement/:observation',
    title: "Détail d'un évènement • Regard d'altitude",
    component: ObservationDetailComponent,
    data: {
      title: "Détail d'un évènement",
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'evenements',
    title: "Les évènements • Regard d'altitude",
    component: SynthesisInterfaceComponent,
    data: {
      title: 'Les évènements',
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
    path: 'fonds-de-carte-hors-ligne',
    title: 'Fonds de carte hors ligne',
    component: MyOfflineDataComponent,
    data: {
      title: 'Fonds de carte hors ligne',
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'a-propos',
    title: 'À propos',
    component: LearnMoreComponent,
    data: {
      title: 'À propos',
      backButton: true,
      accountButton: false,
    },
  },
  {
    path: 'legal-notice',
    title: 'Mentions légales',
    component: LegalNoticeComponent,
    data: {
      title: 'Mentions légales',
      backButton: true,
      accountButton: false,
    },
  },
  { path: '**', redirectTo: '' },
];
