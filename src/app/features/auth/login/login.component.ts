import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card card">
        <h1 style="text-align: center; margin-bottom: 2rem;">Newsletter 3000</h1>
        <h2 style="text-align: center; margin-bottom: 2rem;">Iniciar Sesión</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input
              class="form-input"
              id="username"
              type="text"
              formControlName="username"
              placeholder="Ingresa tu usuario"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <span style="color: var(--danger); font-size: 0.85rem; display: block; margin-top: 0.25rem;">Usuario requerido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input
              class="form-input"
              id="password"
              type="password"
              formControlName="password"
              placeholder="Ingresa tu contraseña"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span style="color: var(--danger); font-size: 0.85rem; display: block; margin-top: 0.25rem;">Contraseña requerida</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="badge badge-danger" style="width: 100%; margin-bottom: 1rem;">
              {{ errorMessage() }}
            </div>
          }

          <button
            class="btn btn-primary"
            type="submit"
            [disabled]="loginForm.invalid || loading()"
            style="width: 100%; text-align: center; justify-content: center;"
          >
            {{ loading() ? 'Cargando...' : 'Iniciar Sesión' }}
          </button>

          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">¿No tienes cuenta? </span>
            <a routerLink="/register" style="color: var(--primary); text-decoration: none; font-weight: 600; cursor: pointer;">Regístrate aquí</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const credentials = {
        username: this.loginForm.value.username!,
        password: this.loginForm.value.password!
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Error al iniciar sesión');
        }
      });
    }
  }
}
