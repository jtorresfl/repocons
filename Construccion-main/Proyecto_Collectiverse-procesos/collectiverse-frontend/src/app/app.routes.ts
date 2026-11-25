import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'publicaciones' },
  {
    path: 'publicaciones',
    title: 'Publicaciones · Collectiverse',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.PublicacionesPage),
  },
  {
    path: 'cuenta',
    title: 'Mi cuenta · Collectiverse',
    loadComponent: () => import('./pages/cuenta/cuenta').then(m => m.CuentaPage),
  },
  {
    path: 'publicar',
    title: 'Publicar · Collectiverse',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/publicar/publicar').then(m => m.PublicarPage),
  },
  { path: '**', redirectTo: 'publicaciones' },
];