import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { USER_ROLES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        @if (isAdmin()) {
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Panel General</span>
          </a>
        }

        @if (isAdmin()) {
          <div class="nav-group">
            <a (click)="toggleSubscribers()" class="nav-item nav-parent" [class.expanded]="subscribersExpanded()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Suscriptores</span>
              <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <div class="nav-submenu" [class.expanded]="subscribersExpanded()">
              <a routerLink="/subscribers" routerLinkActive="active" class="nav-subitem">Ver todos</a>
              <a routerLink="/subscribers/import" routerLinkActive="active" class="nav-subitem disabled" style="pointer-events: none; opacity: 0.5; cursor: not-allowed;" (click)="$event.preventDefault()">Importar de CSV</a>
            </div>
          </div>
        }

        <a routerLink="/campaigns" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 7v13h18V7"></path>
            <path d="M3 7l9-4 9 4"></path>
            <line x1="12" y1="3" x2="12" y2="20"></line>
          </svg>
          <span>Campañas</span>
        </a>

        @if (!isAdmin()) {
          <a routerLink="/subscription" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span>Suscripción</span>
          </a>
        }

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
          </svg>
          <span>Configuración</span>
        </a>
      </nav>
    </aside>
  `,
  styles: []
})
export class SidebarComponent {
  private authService = inject(AuthService);

  subscribersExpanded = signal(false);

  // Expose constants to template
  readonly USER_ROLES = USER_ROLES;

  // Computed for admin check
  isAdmin = computed(() => this.authService.currentUser()?.role === USER_ROLES.ADMIN);

  toggleSubscribers() {
    this.subscribersExpanded.update(v => !v);
  }
}
