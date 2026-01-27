import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  notifications = signal<Notification[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) {
    const id = ++this.counter;
    const notification: Notification = { id, message, type };

    this.notifications.update(current => [...current, notification]);

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }

  dismiss(id: number) {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
