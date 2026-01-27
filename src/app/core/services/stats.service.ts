import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardStats } from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(HttpClient);

  getDashboardStats() {
    return this.http.get<DashboardStats>('/api/stats/dashboard');
  }

  getSubscriberStats() {
    return this.http.get('/api/stats/subscribers');
  }
}
