import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'

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

  getAll() {
    return this.http.get<SavedCard[]>('/api/saved-cards')
  }

  create(data: { card_number: string; expiry: string; cvv: string; is_default?: boolean }) {
    return this.http.post<SavedCard>('/api/saved-cards', data)
  }

  setDefault(id: number) {
    return this.http.patch(`/api/saved-cards/${id}/default`, {})
  }

  delete(id: number) {
    return this.http.delete(`/api/saved-cards/${id}`)
  }

  getFullCard(id: number) {
    return this.http.get<{ card_number: string; expiry: string; cvv: string }>(`/api/saved-cards/${id}/full`)
  }
}
