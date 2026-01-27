import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card card">
        <h1 style="text-align: center; margin-bottom: 0.5rem;">Newsletter 3000</h1>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">Crea tu cuenta de administrador</p>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input
              class="form-input"
              id="username"
              type="text"
              formControlName="username"
              placeholder="Mínimo 3 caracteres"
            />
            @if (registerForm.get('username')?.invalid && registerForm.get('username')?.touched) {
              <span class="error-text">Usuario requerido (mínimo 3 caracteres)</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              class="form-input"
              id="email"
              type="email"
              formControlName="email"
              placeholder="tu@email.com"
            />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-text">Email inválido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input
              class="form-input"
              id="password"
              type="password"
              formControlName="password"
              placeholder="Mínimo 6 caracteres"
            />
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-text">Contraseña requerida (mínimo 6 caracteres)</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirmar Contraseña</label>
            <input
              class="form-input"
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Repite tu contraseña"
            />
            @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
              <span class="error-text">Las contraseñas no coinciden</span>
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
            [disabled]="registerForm.invalid || loading()"
            style="width: 100%; text-align: center; justify-content: center;"
          >
            {{ loading() ? 'Registrando...' : 'Registrarse' }}
          </button>

          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">¿Ya tienes cuenta? </span>
            <a routerLink="/login" style="color: var(--primary); text-decoration: none; font-weight: 600; cursor: pointer;">Inicia sesión aquí</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .register-card {
      max-width: 450px;
      width: 100%;
    }

    .error-text {
      color: var(--danger);
      font-size: 0.85rem;
      display: block;
      margin-top: 0.25rem;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const { username, email, password } = this.registerForm.value;

      this.authService.register({
        username: username!,
        email: email!,
        password: password!
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Error al registrar usuario');
        }
      });
    }
  }
}
