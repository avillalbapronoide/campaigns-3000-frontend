import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '@env/environment'

export interface SavedCard {
  id: number
  user_id: number
  card_number: string
  card_last4: string
  expiry: string
  is_default: boolean
  created_at: number
}

@Injectable({
  providedIn: 'root'
})
export class SavedCardService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = environment.apiUrl

  getAll() {
    return this.http.get<SavedCard[]>(`${this.apiUrl}/saved-cards`)
  }

  create(data: { card_number: string; expiry: string; cvv: string; is_default?: boolean }) {
    return this.http.post<SavedCard>(`${this.apiUrl}/saved-cards`, data)
  }

  setDefault(id: number) {
    return this.http.patch(`${this.apiUrl}/saved-cards/${id}/default`, {})
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/saved-cards/${id}`)
  }

  getFullCard(id: number) {
    return this.http.get<{ card_number: string; expiry: string; cvv: string }>(`${this.apiUrl}/saved-cards/${id}/full`)
  }
}
