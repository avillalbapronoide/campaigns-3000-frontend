import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AuthService } from './auth.service'
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService)

  updateProfile(id: number, data: { username: string }) {
    return this.http.patch<any>(`/api/users/${id}`, data).pipe(
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
    return this.http.patch(`/api/users/${id}/password`, data)
  }
}
