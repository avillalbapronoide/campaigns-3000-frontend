import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  create(data: { subscriber_id: number; amount: number; card_last4: string }) {
    return this.http.post(`${this.apiUrl}/payments`, data);
  }

  getBySubscriber(subscriberId: number) {
    return this.http.get(`${this.apiUrl}/payments/subscriber/${subscriberId}`);
  }

  getSavedCard(subscriberId: number) {
    return this.http.get<{ last4: string } | null>(`${this.apiUrl}/payments/subscriber/${subscriberId}/card`);
  }
}
