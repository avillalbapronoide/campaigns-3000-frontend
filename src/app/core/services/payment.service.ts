import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);

  create(data: { subscriber_id: number; amount: number; card_last4: string }) {
    return this.http.post('/api/payments', data);
  }

  getBySubscriber(subscriberId: number) {
    return this.http.get(`/api/payments/subscriber/${subscriberId}`);
  }

  getSavedCard(subscriberId: number) {
    return this.http.get<{ last4: string } | null>(`/api/payments/subscriber/${subscriberId}/card`);
  }
}
