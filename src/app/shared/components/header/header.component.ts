import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/constants/app.constants';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
    <header class="top-nav">
      <div class="top-nav-left">
        <h1 class="app-title">Newsletter 3000</h1>
      </div>

      <div class="top-nav-right">
        <button class="btn-theme-toggle" (click)="themeService.toggleTheme()" aria-label="Toggle theme">
          @if (themeService.currentTheme() === 'dark') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          }
        </button>

        @if (authService.currentUser(); as user) {
          <div class="user-info">
            <div class="user-avatar">{{ user.username.substring(0, 2).toUpperCase() }}</div>
            <div>
              <span class="user-name">{{ user.username }}</span>
              <span
                class="badge"
                [style.background]="user.role === USER_ROLES.ADMIN ? '#6366f1' : '#10b981'"
                style="font-size: 0.75rem; padding: 0.125rem 0.5rem; color: white; border-radius: 4px; margin-left: 0.5rem;"
              >
                {{ user.role }}
              </span>
            </div>
          </div>
          <button class="btn-logout" (click)="authService.logout()">Salir</button>
        }
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  // Expose constants to template
  readonly USER_ROLES = USER_ROLES;
}
