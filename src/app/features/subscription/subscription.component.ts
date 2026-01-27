import { Component, signal, inject, OnInit, computed } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'
import { SubscriberService } from '../../core/services/subscriber.service'
import { PaymentService } from '../../core/services/payment.service'
import { SavedCardService, SavedCard } from '../../core/services/saved-card.service'
import { VALID_CATEGORIES } from '../../core/constants/app.constants'

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="subscription">
      <h1 style="font-size: 1.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2rem;">Suscripción a Newsletter</h1>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando...</p>
        </div>
      } @else if (showSubscriptionView()) {
        <!-- Active Subscription View (suscrito OR grace period) -->
        <div class="card" style="max-width: 800px; margin: 0 auto;">
          <div class="card-header">
            <h2 class="card-title">Mi Suscripción</h2>
          </div>

          @if (subscription(); as sub) {
            <div style="padding: 2rem;">
              <!-- Status Banner -->
              @if (isInGracePeriod()) {
                <!-- Grace Period Banner (Orange) -->
                <div style="background: #f59e0b; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                  <svg style="width: 24px; height: 24px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <strong style="display: block; margin-bottom: 0.25rem;">Suscripción Cancelada</strong>
                    <span style="opacity: 0.9;">Tu acceso finaliza el {{ formatActiveUntil(sub.active_until) }}</span>
                  </div>
                </div>
              } @else {
                <!-- Active Subscription Banner (Green) -->
                <div style="background: #10b981; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                  <svg style="width: 24px; height: 24px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <strong style="display: block; margin-bottom: 0.25rem;">Suscripción Activa</strong>
                    <span style="opacity: 0.9;">Tienes acceso completo a todas las newsletters seleccionadas</span>
                  </div>
                </div>
              }

              <!-- Subscription Details -->
              <div style="background: var(--bg-secondary); border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid var(--border-color);">
                <div style="display: grid; gap: 1.5rem;">
                  <!-- Email -->
                  <div>
                    <label style="color: var(--text-secondary); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Email</label>
                    <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 500;">{{ sub.email }}</div>
                  </div>

                  <!-- Categories -->
                  <div>
                    <label style="color: var(--text-secondary); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Categorías Suscritas</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                      @for (interest of sub.interests; track interest) {
                        <span class="badge badge-info" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                          {{ capitalizeFirst(interest) }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Price and Payment Info -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div>
                      <label style="color: var(--text-secondary); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Precio Mensual</label>
                      <div style="color: var(--text-primary); font-size: 1.5rem; font-weight: 600;">€{{ calculateSubscriptionPrice(sub.interests?.length || 0) }}</div>
                      <small style="color: var(--text-muted); font-size: 0.75rem;">EUR por mes</small>
                    </div>

                    <div>
                      @if (isInGracePeriod()) {
                        <label style="color: var(--text-secondary); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Acceso hasta</label>
                        <div style="color: #f59e0b; font-size: 1.125rem; font-weight: 500;">{{ formatActiveUntil(sub.active_until) }}</div>
                        <small style="color: var(--text-muted); font-size: 0.75rem;">Sin renovación</small>
                      } @else {
                        <label style="color: var(--text-secondary); font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Próximo Pago</label>
                        <div style="color: var(--text-primary); font-size: 1.125rem; font-weight: 500;">{{ formatActiveUntil(sub.active_until) }}</div>
                        <small style="color: var(--text-muted); font-size: 0.75rem;">Renovación automática</small>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info Box -->
              <div style="background: var(--bg-darker, var(--bg-secondary)); border-radius: 8px; padding: 1.25rem; margin-bottom: 2rem; border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: start; gap: 1rem;">
                  <svg style="width: 20px; height: 20px; color: #3b82f6; flex-shrink: 0; margin-top: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5;">
                    @if (isInGracePeriod()) {
                      <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Suscripción cancelada</strong>
                      Tu suscripción ha sido cancelada pero mantienes acceso hasta el {{ formatActiveUntil(sub.active_until) }}.
                      Una vez expirada, podrás suscribirte de nuevo con las categorías que desees.
                    } @else {
                      <strong style="color: var(--text-primary); display: block; margin-bottom: 0.25rem;">Información sobre tu suscripción</strong>
                      Tu suscripción se renueva automáticamente cada mes. El cargo se realizará el {{ formatActiveUntil(sub.active_until) }}.
                      Puedes cancelar tu suscripción en cualquier momento y seguirás teniendo acceso hasta el final del período pagado.
                    }
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                <button type="button" class="btn btn-outline" routerLink="/dashboard">Volver al Panel</button>
                @if (!isInGracePeriod()) {
                  <button type="button" class="btn btn-danger" (click)="confirmCancel()">
                    <svg style="width: 18px; height: 18px; margin-right: 0.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    Cancelar Suscripción
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Subscription Form -->
        <div class="card" style="max-width: 800px; margin: 0 auto;">
          <div class="card-header">
            <h2 class="card-title">Nueva Suscripción</h2>
          </div>

          <form [formGroup]="subscriptionForm" (ngSubmit)="submitSubscription()">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="name">Nombre</label>
                <input
                  id="name"
                  class="form-input"
                  type="text"
                  formControlName="name"
                  [readonly]="isLoggedIn()"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="email">Email</label>
                <input
                  id="email"
                  class="form-input"
                  type="email"
                  formControlName="email"
                  [readonly]="isLoggedIn()"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Categorías de Interés</label>
              <div class="form-checkbox-group">
                @for (cat of categories; track cat) {
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [value]="cat"
                      (change)="toggleCategory(cat, $event)"
                    />
                    <span>{{ cat }}</span>
                  </label>
                }
              </div>
              @if (selectedCategories().length > 0) {
                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid var(--primary);">
                  <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Precio calculado</div>
                  <div style="color: var(--primary-light); font-size: 1.5rem; font-weight: 600;">{{ calculatePrice() }}€ / mes</div>
                  <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem;">Base: 4.99€ (1ª cat) + 2€ c/u (2-4 cats) + 1€ c/u (5+ cats)</div>
                </div>
              }
            </div>

            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border: 1px dashed var(--primary);">
                  <h4 style="color: var(--primary); font-size: 0.875rem; margin-bottom: 0.5rem; font-weight: 600;">🛠️ Datos de prueba</h4>
                  <div style="display: grid; gap: 0.5rem; font-family: monospace; font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--success);">Pago Correcto:</span>
                      <span>4242 4242 4242 4242</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--danger);">Tarjeta declinada:</span>
                      <span>4000 0000 0000 0002</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--danger);">Fondos insuficientes:</span>
                      <span>4000 0000 0000 0051</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--danger);">Tarjeta expirada:</span>
                      <span>4000 0000 0000 0069</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--danger);">Error procesamiento:</span>
                      <span>4000 0000 0000 0119</span>
                    </div>
                  </div>
                </div>

              <h3 style="color: var(--text-primary); font-size: 1.1rem; margin-bottom: 1rem;">Datos de Pago</h3>

              <!-- Saved Cards Selector -->
              @if (savedCards().length > 0) {
                <div class="form-group">
                  <label class="form-label">Seleccionar Tarjeta</label>
                  <div class="card-selector">
                    @for (card of savedCards(); track card.id) {
                      <button type="button" class="card-option" [class.selected]="selectedCardId() === card.id" (click)="selectCard(card.id)">
                        <span class="card-option-number">**** {{ card.card_last4 }}</span>
                        <span class="card-option-expiry">{{ card.expiry }}</span>
                        @if (card.is_default) {
                          <span class="card-option-default">Predeterminada</span>
                        }
                      </button>
                    }
                    <button type="button" class="card-option card-option-new" [class.selected]="useManualEntry()" (click)="enableManualEntry()">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span>Usar otra tarjeta</span>
                    </button>
                  </div>
                </div>
              }

              <!-- Manual Card Entry (visible when no saved cards OR useManualEntry) -->
              @if (savedCards().length === 0 || useManualEntry()) {
              <div class="form-group">
                <label class="form-label" for="cardNumber">Número de Tarjeta</label>
                <input
                  id="cardNumber"
                  class="form-input"
                  type="text"
                  formControlName="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  (input)="formatCardNumber($event)"
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="expiry">Fecha de Expiración</label>
                  <input
                    id="expiry"
                    class="form-input"
                    type="text"
                    formControlName="expiry"
                    placeholder="MM/AA"
                    maxlength="5"
                    (input)="formatExpiryDate($event)"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="cvv">CVV</label>
                  <input
                    id="cvv"
                    class="form-input"
                    type="text"
                    formControlName="cvv"
                    placeholder="123"
                    maxlength="3"
                  />
                </div>
              </div>
              }
            </div>

            @if (error()) {
              <div class="error-alert">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <div class="error-content">
                  <strong class="error-title">Error en el pago</strong>
                  <span class="error-message">{{ error() }}</span>
                </div>
              </div>
            }

            <div class="modal-footer">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="subscriptionForm.invalid || selectedCategories().length === 0 || !isPaymentFormValid() || submitting()"
                style="width: 100%; text-align: center; justify-content: center;"
              >
                {{ submitting() ? 'Procesando...' : 'Suscribirse (' + calculatePrice() + '€/mes)' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .btn-primary:disabled {
      background: #6b7280 !important;
      border-color: #6b7280 !important;
      color: #9ca3af !important;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .error-alert {
      display: flex;
      align-items: center;
      position: relative;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-left: 4px solid #ef4444;
      border-radius: 8px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-icon {
      width: 24px;
      height: 24px;
      color: #ef4444;
      flex-shrink: 0;
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
    }

    .error-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      text-align: center;
      padding-left: 2rem;
    }

    .error-title {
      color: #ef4444;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .error-message {
      color: var(--text-secondary, #9ca3af);
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .card-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .card-option {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      padding: 1rem 1.25rem;
      background: var(--bg-tertiary, var(--bg-primary));
      border: 2px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 140px;
    }

    .card-option:hover {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.05);
    }

    .card-option.selected {
      border-color: var(--primary);
      background: rgba(99, 102, 241, 0.1);
    }

    .card-option-number {
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .card-option-expiry {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .card-option-default {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      background: var(--primary);
      color: white;
      border-radius: 10px;
      margin-top: 0.25rem;
    }

    .card-option-new {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
      border-style: dashed;
    }

    .card-option-new svg {
      width: 18px;
      height: 18px;
      stroke-width: 2;
    }
  `]
})
export class SubscriptionComponent implements OnInit {
  private authService = inject(AuthService)
  private subscriberService = inject(SubscriberService)
  private paymentService = inject(PaymentService)
  private savedCardService = inject(SavedCardService)

  loading = signal(true)
  submitting = signal(false)
  error = signal('')
  subscription = signal<any>(null)
  selectedCategories = signal<string[]>([])

  // Card selection
  savedCards = signal<SavedCard[]>([])
  selectedCardId = signal<number | null>(null)
  useManualEntry = signal(false)

  categories = VALID_CATEGORIES as unknown as string[]

  // Computed: Check if subscription is in grace period (status='baja' but active_until > now)
  isInGracePeriod = computed(() => {
    const sub = this.subscription()
    if (!sub || sub.status !== 'baja') return false
    if (!sub.active_until) return false
    const activeUntil = new Date(sub.active_until)
    return activeUntil > new Date()
  })

  // Computed: Show subscription view if suscrito OR in grace period
  showSubscriptionView = computed(() => {
    const sub = this.subscription()
    if (!sub) return false
    if (sub.status === 'suscrito') return true
    return this.isInGracePeriod()
  })

  isLoggedIn = computed(() => !!this.authService.currentUser())
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN')

  // Computed: Check if payment form is complete and valid
  isPaymentFormValid = computed(() => {
    // If a saved card is selected, it's valid
    if (this.selectedCardId() !== null && !this.useManualEntry()) {
      return true
    }
    // Otherwise check manual entry form
    const form = this.subscriptionForm
    const cardNumber = form.get('cardNumber')
    const expiry = form.get('expiry')
    const cvv = form.get('cvv')

    const cardValid = cardNumber?.valid && cardNumber.value && cardNumber.value.length > 0
    const expiryValid = expiry?.valid && expiry.value && expiry.value.length > 0
    const cvvValid = cvv?.valid && cvv.value && cvv.value.length > 0

    return cardValid && expiryValid && cvvValid
  })

  subscriptionForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    cardNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]),
    expiry: new FormControl('', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]),
    cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)])
  })

  ngOnInit() {
    this.loadSubscription()
    this.prefillUserData()
    this.loadSavedCards()
  }

  loadSavedCards() {
    this.savedCardService.getAll().subscribe({
      next: (cards) => {
        this.savedCards.set(cards)
        // Pre-select default card if exists and fill form
        const defaultCard = cards.find(c => c.is_default)
        if (defaultCard) {
          this.selectCard(defaultCard.id)
        }
      }
    })
  }

  selectCard(id: number) {
    this.selectedCardId.set(id)
    this.useManualEntry.set(false)
    // Fetch full card data and fill the form
    this.savedCardService.getFullCard(id).subscribe({
      next: (card) => {
        // Format card number with spaces
        const formattedCardNumber = card.card_number.match(/.{1,4}/g)?.join(' ') || card.card_number
        this.subscriptionForm.patchValue({
          cardNumber: formattedCardNumber,
          expiry: card.expiry,
          cvv: card.cvv
        })
      }
    })
  }

  enableManualEntry() {
    this.selectedCardId.set(null)
    this.useManualEntry.set(true)
    // Clear card fields for manual entry
    this.subscriptionForm.patchValue({
      cardNumber: '',
      expiry: '',
      cvv: ''
    })
  }

  loadSubscription() {
    const user = this.authService.currentUser()
    if (!user) {
      this.loading.set(false)
      return
    }

    const userEmail = user.email || `${user.username}@example.com`

    // Fetch ALL subscriptions (no status filter) to check for grace period
    this.subscriberService.getAll({}).subscribe({
      next: (subscribers: any) => {
        // First try to find by user_id
        let userSubscription = subscribers.find((s: any) => s.user_id === user.id)

        // If not found, try to find by email
        if (!userSubscription) {
          userSubscription = subscribers.find((s: any) => s.email === userEmail)
        }

        this.subscription.set(userSubscription || null)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
      }
    })
  }

  prefillUserData() {
    const user = this.authService.currentUser()
    if (user) {
      this.subscriptionForm.patchValue({
        name: user.username,
        email: user.email || `${user.username}@example.com`
      })
    }
  }

  toggleCategory(category: string, event: any) {
    if (event.target.checked) {
      this.selectedCategories.update(cats => [...cats, category])
    } else {
      this.selectedCategories.update(cats => cats.filter(c => c !== category))
    }
  }

  calculatePrice(): number {
    const categories = this.selectedCategories().length
    if (categories === 0) return 0
    if (categories === 1) return 4.99
    if (categories <= 4) {
      // 4.99€ base + 2€ por cada categoría adicional (2-4)
      return 4.99 + (categories - 1) * 2
    }
    // 5+ categorías: 4.99€ + 6€ (3 categorías a 2€) + 1€ por cada extra
    return 4.99 + 6 + (categories - 4) * 1
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES')
  }

  capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  calculateSubscriptionPrice(categoryCount: number): string {
    let price = 0
    if (categoryCount === 0) {
      price = 0
    } else if (categoryCount === 1) {
      price = 4.99
    } else if (categoryCount <= 4) {
      price = 4.99 + (categoryCount - 1) * 2
    } else {
      price = 4.99 + (3 * 2) + ((categoryCount - 4) * 1)
    }
    return price.toFixed(2)
  }

  formatActiveUntil(activeUntil: string | number): string {
    if (!activeUntil) return '-'
    const date = new Date(activeUntil)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16)
    input = input != '' ? input.match(/.{1,4}/g)?.join(' ') : ''
    this.subscriptionForm.patchValue({ cardNumber: input }, { emitEvent: false })
  }

  formatExpiryDate(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4)
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2)
    }
    this.subscriptionForm.patchValue({ expiry: input }, { emitEvent: false })
  }

  submitSubscription() {
    if (this.selectedCategories().length === 0) return
    if (!this.isPaymentFormValid()) return

    this.submitting.set(true)
    this.error.set('')

    const user = this.authService.currentUser()

    // Get card number - either from saved card or form
    let cardNumberPromise: Promise<string>
    if (this.selectedCardId() !== null && !this.useManualEntry()) {
      // Get full card data from saved card
      cardNumberPromise = new Promise((resolve, reject) => {
        this.savedCardService.getFullCard(this.selectedCardId()!).subscribe({
          next: (card) => resolve(card.card_number),
          error: (err) => reject(err)
        })
      })
    } else {
      cardNumberPromise = Promise.resolve(this.subscriptionForm.value.cardNumber!.replace(/\s/g, ''))
    }

    cardNumberPromise.then(cardNumber => {
      const subscriberData: any = {
        name: this.subscriptionForm.value.name!,
        email: this.subscriptionForm.value.email!,
        interests: this.selectedCategories(),
        cardNumber: cardNumber
      }

      if (user) {
        subscriberData.user_id = user.id
      }

      this.subscriberService.create(subscriberData).subscribe({
        next: (subscriber: any) => {
          this.subscription.set(subscriber)
          this.submitting.set(false)
          this.selectedCategories.set([])
          this.subscriptionForm.reset()
          this.prefillUserData()
        },
        error: (err: any) => {
          this.submitting.set(false)
          this.error.set(err.error?.message || 'Error al procesar la suscripción y el pago')
        }
      })
    }).catch(err => {
      this.submitting.set(false)
      this.error.set('Error al obtener datos de la tarjeta')
    })
  }

  confirmCancel() {
    if (confirm('¿Estás seguro de que deseas cancelar tu suscripción? Mantendrás acceso hasta el final del período pagado.')) {
      this.cancelSubscription()
    }
  }

  cancelSubscription() {
    const sub = this.subscription()
    if (!sub) return

    // Use the cancel endpoint which only changes status to 'baja'
    this.subscriberService.cancel(sub.id).subscribe({
      next: (updatedSub: any) => {
        // Update subscription to show grace period state
        this.subscription.set(updatedSub)
      },
      error: () => {
        alert('Error al cancelar la suscripción')
      }
    })
  }
}
