import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'subscribers',
        loadChildren: () => import('./features/subscribers/subscribers.routes').then(m => m.routes),
        canActivate: [adminGuard]
      },
      {
        path: 'campaigns',
        loadChildren: () => import('./features/campaigns/campaigns.routes').then(m => m.routes)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: '',
        redirectTo: 'campaigns',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'campaigns'
  }
];
