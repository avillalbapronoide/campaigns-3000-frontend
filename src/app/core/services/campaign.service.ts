import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Campaign } from '../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<Campaign[]>('/api/campaigns');
  }

  getById(id: number) {
    return this.http.get<Campaign>(`/api/campaigns/${id}`);
  }

  create(data: Partial<Campaign>) {
    return this.http.post<Campaign>('/api/campaigns', data);
  }

  update(id: number, data: Partial<Campaign>) {
    return this.http.put<Campaign>(`/api/campaigns/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`/api/campaigns/${id}`);
  }

  getStats(id: number) {
    return this.http.get(`/api/campaigns/${id}/stats`);
  }

  trackOpen(campaignId: number, subscriberId: number) {
    return this.http.post(`/api/campaigns/${campaignId}/track-open`, { subscriber_id: subscriberId });
  }
}
