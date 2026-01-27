import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <app-header />
    <div class="main-layout">
      <app-sidebar />
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: []
})
export class LayoutComponent {}
