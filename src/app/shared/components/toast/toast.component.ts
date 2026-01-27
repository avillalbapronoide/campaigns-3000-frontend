import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="toast toast-{{ notification.type }}"
          (click)="notificationService.dismiss(notification.id)"
        >
          <div class="toast-icon">
            @switch (notification.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </div>
          <div class="toast-message">{{ notification.message }}</div>
          <button class="toast-close" (click)="notificationService.dismiss(notification.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
      color: white;
    }

    .toast-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
      color: white;
    }

    .toast-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
      color: white;
    }

    .toast-info {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(79, 70, 229, 0.95));
      color: white;
    }

    .toast-icon {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 0;
      line-height: 1;
    }

    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
