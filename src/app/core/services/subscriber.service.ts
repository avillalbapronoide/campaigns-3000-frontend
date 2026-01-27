import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscriber } from '../models/subscriber.model';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(filters?: { status?: string; role?: string; interests?: string[] }) {
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.role) params.role = filters.role;

    return this.http.get<Subscriber[]>(`${this.apiUrl}/subscribers`, { params });
  }

  getById(id: number) {
    return this.http.get<Subscriber>(`${this.apiUrl}/subscribers/${id}`);
  }

  create(data: { name: string; email: string; interests?: string[]; user_id?: number }) {
    return this.http.post<Subscriber>(`${this.apiUrl}/subscribers`, data);
  }

  update(id: number, data: Partial<Subscriber>) {
    return this.http.patch<Subscriber>(`${this.apiUrl}/subscribers/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/subscribers/${id}`);
  }

  unsubscribe(id: number) {
    return this.http.patch<Subscriber>(`${this.apiUrl}/subscribers/${id}`, { status: 'baja' })
  }

  cancel(id: number) {
    return this.http.put<Subscriber>(`${this.apiUrl}/subscribers/${id}/cancel`, {})
  }

  getByUserId(userId: number) {
    return this.http.get<Subscriber>(`${this.apiUrl}/subscribers/user/${userId}`)
  }
}
