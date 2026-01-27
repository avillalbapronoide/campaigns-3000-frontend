import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./subscribers-list/subscribers-list.component').then(m => m.SubscribersListComponent)
  }
];
