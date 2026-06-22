import { Routes } from '@angular/router';
import { Auth } from './module/components/auth/auth';

export const routes: Routes = [
  { path: 'login', component: Auth, data: { mode: 'login' } },
  { path: 'signup', component: Auth, data: { mode: 'signup' } },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
