import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscriber } from '../models/subscriber.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {
  private readonly http = inject(HttpClient);

  getAll(filters?: { status?: string; role?: string; interests?: string[] }) {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.role) params.role = filters.role;

    return this.http.get<Subscriber[]>('/api/subscribers', { params });
  }

  getById(id: number) {
    return this.http.get<Subscriber>(`/api/subscribers/${id}`);
  }

  create(data: { name: string; email: string; interests?: string[]; user_id?: number }) {
    return this.http.post<Subscriber>('/api/subscribers', data);
  }

  update(id: number, data: Partial<Subscriber>) {
    return this.http.patch<Subscriber>(`/api/subscribers/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`/api/subscribers/${id}`);
  }

  unsubscribe(id: number) {
    return this.http.patch<Subscriber>(`/api/subscribers/${id}`, { status: 'baja' })
  }

  cancel(id: number) {
    return this.http.put<Subscriber>(`/api/subscribers/${id}/cancel`, {})
  }

  getByUserId(userId: number) {
    return this.http.get<Subscriber>(`/api/subscribers/user/${userId}`)
  }
}
