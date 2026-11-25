import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  {
    path: 'productos',
    title: 'Productos · Collectiverse',
    loadComponent: () => import('./pages/productos/productos').then(m => m.ProductosPage),
  },
  {
    path: 'productos/:id',
    title: 'Detalle de producto · Collectiverse',
    loadComponent: () => import('./pages/producto-detalle/producto-detalle').then(m => m.ProductoDetallePage),
  },
  {
    path: 'publicaciones',
    title: 'Publicaciones · Collectiverse',
    loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.PublicacionesPage),
  },
  {
    path: 'categorias',
    title: 'Categorías y colecciones · Collectiverse',
    canActivate: [authGuard], // hace falta indicar un usuario (se envía como createdBy)
    loadComponent: () => import('./pages/categorias/categorias').then(m => m.CategoriasPage),
  },
  {
    path: 'login',
    title: 'Ingresar · Collectiverse',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage),
  },
  { path: '**', redirectTo: 'productos' },
];
