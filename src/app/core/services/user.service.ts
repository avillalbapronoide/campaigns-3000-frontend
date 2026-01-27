import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AuthService } from './auth.service'
import { tap } from 'rxjs/operators'
import { environment } from '@env/environment'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService)
  private readonly apiUrl = environment.apiUrl

  updateProfile(id: number, data: { username: string }) {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}`, data).pipe(
      tap(updatedUser => {
        // Update localStorage and current user signal
        const token = localStorage.getItem('token')
        if (token) {
          const currentUser = this.authService.currentUser()
          if (currentUser) {
            const newUser = { ...currentUser, ...updatedUser }
            localStorage.setItem('user', JSON.stringify(newUser))
            this.authService.currentUser.set(newUser)
          }
        }
      })
    )
  }

  changePassword(id: number, data: { currentPassword: string; newPassword: string }) {
    return this.http.patch(`${this.apiUrl}/users/${id}/password`, data)
  }
}
