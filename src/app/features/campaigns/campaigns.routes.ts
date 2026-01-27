import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./campaigns-list/campaigns-list.component').then(m => m.CampaignsListComponent)
  }
];
