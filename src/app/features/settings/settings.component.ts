import { Component, signal, inject, OnInit, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { AuthService } from '../../core/services/auth.service'
import { UserService } from '../../core/services/user.service'
import { SavedCardService, SavedCard } from '../../core/services/saved-card.service'

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings">
      <h1 class="page-title">Configuración</h1>

      <!-- User Profile Section -->
      <div class="settings-section">
        <button class="section-header" (click)="toggleSection('profile')" [class.expanded]="expandedSection() === 'profile'">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Datos de Usuario</span>
          </div>
          <svg class="chevron-icon" [class.rotated]="expandedSection() === 'profile'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        @if (expandedSection() === 'profile') {
          <div class="section-content">
            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
              <div class="form-group">
                <label class="form-label" for="username">Nombre de usuario</label>
                <input id="username" class="form-input" type="text" formControlName="username" />
              </div>
              <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input id="email" class="form-input" type="email" [value]="currentEmail()" readonly disabled />
                <small class="form-hint">El email no puede ser modificado</small>
              </div>
              @if (profileSuccess()) {
                <div class="alert alert-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>Perfil actualizado correctamente</span>
                </div>
              }
              @if (profileError()) {
                <div class="alert alert-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  <span>{{ profileError() }}</span>
                </div>
              }
              <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || profileSubmitting()">
                {{ profileSubmitting() ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </form>
          </div>
        }
      </div>

      <!-- Change Password Section -->
      <div class="settings-section">
        <button class="section-header" (click)="toggleSection('password')" [class.expanded]="expandedSection() === 'password'">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Cambiar Contraseña</span>
          </div>
          <svg class="chevron-icon" [class.rotated]="expandedSection() === 'password'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        @if (expandedSection() === 'password') {
          <div class="section-content">
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-group">
                <label class="form-label" for="currentPassword">Contraseña Actual</label>
                <input id="currentPassword" class="form-input" type="password" formControlName="currentPassword" />
              </div>
              <div class="form-group">
                <label class="form-label" for="newPassword">Nueva Contraseña</label>
                <input id="newPassword" class="form-input" type="password" formControlName="newPassword" />
                <small class="form-hint">Mínimo 6 caracteres</small>
              </div>
              <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirmar Nueva Contraseña</label>
                <input id="confirmPassword" class="form-input" type="password" formControlName="confirmPassword" />
                @if (passwordMismatch()) {
                  <small class="form-error">Las contraseñas no coinciden</small>
                }
              </div>
              @if (passwordSuccess()) {
                <div class="alert alert-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <span>Contraseña cambiada correctamente</span>
                </div>
              }
              @if (passwordError()) {
                <div class="alert alert-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  <span>{{ passwordError() }}</span>
                </div>
              }
              <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || passwordMismatch() || passwordSubmitting()">
                {{ passwordSubmitting() ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </form>
          </div>
        }
      </div>

      <!-- Credit Card Section -->
      <div class="settings-section">
        <button class="section-header" (click)="toggleSection('card')" [class.expanded]="expandedSection() === 'card'">
          <div class="section-title">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Tarjetas de Crédito</span>
          </div>
          <svg class="chevron-icon" [class.rotated]="expandedSection() === 'card'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        @if (expandedSection() === 'card') {
          <div class="section-content">
            @if (loadingCards()) {
              <div class="loading-card">
                <div class="spinner"></div>
                <span>Cargando tarjetas...</span>
              </div>
            } @else {
              <!-- Card List -->
              @if (savedCards().length > 0) {
                <div class="cards-list">
                  @for (card of savedCards(); track card.id) {
                    <div class="card-item" [class.default]="card.is_default">
                      <div class="card-preview-mini">
                        <svg class="card-chip-mini" viewBox="0 0 40 30">
                          <rect x="5" y="5" width="30" height="20" rx="3" fill="#d4af37"/>
                        </svg>
                        <span class="card-number-mini">**** {{ card.card_last4 }}</span>
                        <span class="card-expiry">{{ card.expiry }}</span>
                      </div>
                      <div class="card-actions">
                        @if (card.is_default) {
                          <span class="default-badge">Predeterminada</span>
                        } @else {
                          <button class="btn-link" (click)="setDefaultCard(card.id)">Predeterminar</button>
                        }
                        <button class="btn-icon btn-danger-icon" (click)="deleteCard(card.id)" title="Eliminar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="no-cards-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <p>No tienes tarjetas guardadas</p>
                </div>
              }
              <button class="btn btn-outline add-card-btn" (click)="openCardModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Añadir Tarjeta
              </button>
            }
          </div>
        }
      </div>
    </div>

    <!-- Card Modal -->
    @if (showCardModal()) {
      <div class="modal-overlay" (click)="closeCardModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Añadir Tarjeta</h2>
            <button class="modal-close" (click)="closeCardModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <form [formGroup]="cardForm" (ngSubmit)="saveCard()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="cardNumber">Número de Tarjeta</label>
                <input id="cardNumber" class="form-input" type="text" formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" (input)="formatCardNumber($event)" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="expiry">Fecha de Expiración</label>
                  <input id="expiry" class="form-input" type="text" formControlName="expiry" placeholder="MM/AA" maxlength="5" (input)="formatExpiryDate($event)" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="cvv">CVV</label>
                  <input id="cvv" class="form-input" type="text" formControlName="cvv" placeholder="123" maxlength="3" />
                </div>
              </div>
              <label class="checkbox-label">
                <input type="checkbox" formControlName="isDefault" />
                <span>Establecer como predeterminada</span>
              </label>
              @if (cardError()) {
                <div class="alert alert-error" style="margin-top: 1rem;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  <span>{{ cardError() }}</span>
                </div>
              }
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeCardModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="cardForm.invalid || cardSubmitting()">
                {{ cardSubmitting() ? 'Guardando...' : 'Guardar Tarjeta' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .settings { max-width: 700px; margin: 0 auto; }
    .page-title { font-size: 1.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2rem; }
    .settings-section { background: var(--bg-secondary); border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color); overflow: hidden; }
    .section-header { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; background: transparent; border: none; cursor: pointer; transition: background 0.2s ease; }
    .section-header:hover { background: var(--bg-hover, rgba(255, 255, 255, 0.05)); }
    .section-header.expanded { border-bottom: 1px solid var(--border-color); }
    .section-title { display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary); font-size: 1.1rem; font-weight: 500; }
    .section-icon { width: 22px; height: 22px; stroke-width: 2; color: var(--primary); }
    .chevron-icon { width: 20px; height: 20px; stroke-width: 2; color: var(--text-secondary); transition: transform 0.3s ease; }
    .chevron-icon.rotated { transform: rotate(180deg); }
    .section-content { padding: 1.5rem; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem; font-weight: 500; }
    .form-input { width: 100%; padding: 0.75rem 1rem; background: var(--bg-tertiary, var(--bg-primary)); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 1rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
    .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
    .form-hint { display: block; margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem; }
    .form-error { display: block; margin-top: 0.5rem; color: #ef4444; font-size: 0.8rem; }
    .alert { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
    .alert svg { width: 20px; height: 20px; flex-shrink: 0; stroke-width: 2; }
    .alert-success { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; }
    .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; border: none; display: inline-flex; align-items: center; gap: 0.5rem; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--primary-dark, #4f46e5); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
    .btn-outline:hover { background: var(--bg-hover, rgba(255,255,255,0.05)); }
    .btn-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.85rem; padding: 0.25rem 0.5rem; }
    .btn-link:hover { text-decoration: underline; }
    .btn-icon { background: none; border: none; padding: 0.5rem; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .btn-icon svg { width: 18px; height: 18px; stroke-width: 2; }
    .btn-danger-icon { color: var(--text-muted); }
    .btn-danger-icon:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
    .loading-card { display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); }
    .spinner { width: 24px; height: 24px; border: 2px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .cards-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .card-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--bg-tertiary, var(--bg-primary)); border: 1px solid var(--border-color); border-radius: 10px; transition: border-color 0.2s; }
    .card-item.default { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
    .card-preview-mini { display: flex; align-items: center; gap: 1rem; }
    .card-chip-mini { width: 30px; height: 22px; }
    .card-number-mini { font-family: 'Courier New', monospace; font-size: 1rem; color: var(--text-primary); letter-spacing: 1px; }
    .card-expiry { color: var(--text-muted); font-size: 0.85rem; }
    .card-actions { display: flex; align-items: center; gap: 0.75rem; }
    .default-badge { font-size: 0.75rem; padding: 0.25rem 0.75rem; background: var(--primary); color: white; border-radius: 20px; }
    .no-cards-info { text-align: center; padding: 2rem; color: var(--text-secondary); }
    .no-cards-info svg { width: 48px; height: 48px; margin-bottom: 1rem; color: var(--text-muted); stroke-width: 1.5; }
    .no-cards-info p { margin: 0; }
    .add-card-btn { width: 100%; justify-content: center; }
    .add-card-btn svg { width: 18px; height: 18px; stroke-width: 2; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal { background: #1f2937; border-radius: 16px; width: 90%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); animation: slideUp 0.3s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
    .modal-header h2 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
    .modal-close { background: none; border: none; padding: 0.5rem; cursor: pointer; color: var(--text-muted); border-radius: 6px; display: flex; }
    .modal-close:hover { background: var(--bg-hover, rgba(255,255,255,0.05)); color: var(--text-primary); }
    .modal-close svg { width: 20px; height: 20px; stroke-width: 2; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid var(--border-color); }
    .checkbox-label { display: flex; align-items: center; gap: 0.75rem; color: var(--text-secondary); cursor: pointer; font-size: 0.9rem; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--primary); }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService)
  private userService = inject(UserService)
  private savedCardService = inject(SavedCardService)

  expandedSection = signal<string | null>('profile')

  // Profile section
  profileSubmitting = signal(false)
  profileSuccess = signal(false)
  profileError = signal('')

  // Password section
  passwordSubmitting = signal(false)
  passwordSuccess = signal(false)
  passwordError = signal('')

  // Card section
  loadingCards = signal(false)
  savedCards = signal<SavedCard[]>([])
  showCardModal = signal(false)
  cardSubmitting = signal(false)
  cardError = signal('')

  currentEmail = computed(() => this.authService.currentUser()?.email || '')
  currentUser = computed(() => this.authService.currentUser())

  passwordMismatch = computed(() => {
    const form = this.passwordForm
    const newPassword = form.get('newPassword')?.value
    const confirmPassword = form.get('confirmPassword')?.value
    return newPassword && confirmPassword && newPassword !== confirmPassword
  })

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)])
  })

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  })

  cardForm = new FormGroup({
    cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]),
    expiry: new FormControl('', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]),
    cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
    isDefault: new FormControl(false)
  })

  ngOnInit() {
    this.loadUserData()
    this.loadSavedCards()
  }

  loadUserData() {
    const user = this.authService.currentUser()
    if (user) {
      this.profileForm.patchValue({ username: user.username })
    }
  }

  loadSavedCards() {
    this.loadingCards.set(true)
    this.savedCardService.getAll().subscribe({
      next: (cards) => {
        this.savedCards.set(cards)
        this.loadingCards.set(false)
      },
      error: () => this.loadingCards.set(false)
    })
  }

  toggleSection(section: string) {
    this.expandedSection.update(current => current === section ? null : section)
    this.profileSuccess.set(false)
    this.profileError.set('')
    this.passwordSuccess.set(false)
    this.passwordError.set('')
  }

  updateProfile() {
    const user = this.currentUser()
    if (!user || this.profileForm.invalid) return
    this.profileSubmitting.set(true)
    this.profileSuccess.set(false)
    this.profileError.set('')
    this.userService.updateProfile(user.id, { username: this.profileForm.value.username! }).subscribe({
      next: () => {
        this.profileSubmitting.set(false)
        this.profileSuccess.set(true)
        setTimeout(() => this.profileSuccess.set(false), 3000)
      },
      error: (err) => {
        this.profileSubmitting.set(false)
        this.profileError.set(err.error?.message || 'Error al actualizar el perfil')
      }
    })
  }

  changePassword() {
    const user = this.currentUser()
    if (!user || this.passwordForm.invalid || this.passwordMismatch()) return
    this.passwordSubmitting.set(true)
    this.passwordSuccess.set(false)
    this.passwordError.set('')
    this.userService.changePassword(user.id, {
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!
    }).subscribe({
      next: () => {
        this.passwordSubmitting.set(false)
        this.passwordSuccess.set(true)
        this.passwordForm.reset()
        setTimeout(() => this.passwordSuccess.set(false), 3000)
      },
      error: (err) => {
        this.passwordSubmitting.set(false)
        this.passwordError.set(err.error?.message || 'Error al cambiar la contraseña')
      }
    })
  }

  openCardModal() {
    this.cardForm.reset({ isDefault: false })
    this.cardError.set('')
    this.showCardModal.set(true)
  }

  closeCardModal() {
    this.showCardModal.set(false)
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16)
    input = input !== '' ? input.match(/.{1,4}/g)?.join(' ') : ''
    this.cardForm.patchValue({ cardNumber: input }, { emitEvent: false })
  }

  formatExpiryDate(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4)
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2)
    }
    this.cardForm.patchValue({ expiry: input }, { emitEvent: false })
  }

  saveCard() {
    if (this.cardForm.invalid) return
    this.cardSubmitting.set(true)
    this.cardError.set('')
    this.savedCardService.create({
      card_number: this.cardForm.value.cardNumber!,
      expiry: this.cardForm.value.expiry!,
      cvv: this.cardForm.value.cvv!,
      is_default: this.cardForm.value.isDefault || false
    }).subscribe({
      next: () => {
        this.cardSubmitting.set(false)
        this.closeCardModal()
        this.loadSavedCards()
      },
      error: (err) => {
        this.cardSubmitting.set(false)
        this.cardError.set(err.error?.message || 'Error al guardar la tarjeta')
      }
    })
  }

  setDefaultCard(id: number) {
    this.savedCardService.setDefault(id).subscribe({
      next: () => this.loadSavedCards()
    })
  }

  deleteCard(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      this.savedCardService.delete(id).subscribe({
        next: () => this.loadSavedCards()
      })
    }
  }
}
