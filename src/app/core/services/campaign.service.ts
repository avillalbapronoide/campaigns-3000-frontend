import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campaign } from '../models/campaign.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll() {
    return this.http.get<Campaign[]>(`${this.apiUrl}/campaigns`);
  }

  getById(id: number) {
    return this.http.get<Campaign>(`${this.apiUrl}/campaigns/${id}`);
  }

  create(data: Partial<Campaign>) {
    return this.http.post<Campaign>(`${this.apiUrl}/campaigns`, data);
  }

  update(id: number, data: Partial<Campaign>) {
    return this.http.put<Campaign>(`${this.apiUrl}/campaigns/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/campaigns/${id}`);
  }

  getStats(id: number) {
    return this.http.get(`${this.apiUrl}/campaigns/${id}/stats`);
  }

  trackOpen(campaignId: number, subscriberId: number) {
    return this.http.post(`${this.apiUrl}/campaigns/${campaignId}/track-open`, { subscriber_id: subscriberId });
  }
}
