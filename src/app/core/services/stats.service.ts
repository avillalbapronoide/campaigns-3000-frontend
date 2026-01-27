import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardStats } from '../models/stats.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDashboardStats() {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/dashboard`);
  }

  getSubscriberStats() {
    return this.http.get(`${this.apiUrl}/stats/subscribers`);
  }
}
