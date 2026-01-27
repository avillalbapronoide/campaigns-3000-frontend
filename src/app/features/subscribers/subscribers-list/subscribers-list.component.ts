import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { SubscriberService } from '../../../core/services/subscriber.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscriber } from '../../../core/models/subscriber.model';
import { SUBSCRIBER_STATUS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-subscribers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="subscribers-page">
      <h1 style="font-size: 1.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2rem;">Suscriptores</h1>

      <div class="filters" style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="search">Buscar</label>
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              id="search"
              class="search-input"
              type="search"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Buscar por nombre o email..."
            />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="status">Estado</label>
          <select id="status" class="form-select" [(ngModel)]="selectedStatus" (change)="loadSubscribers()">
            <option value="">Todos</option>
            <option value="suscrito">Suscritos</option>
            <option value="pendiente">Pendientes</option>
            <option value="baja">De baja</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="role">Rol</label>
          <select id="role" class="form-select" [(ngModel)]="selectedRole" (change)="loadSubscribers()">
            <option value="">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Usuario</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando suscriptores...</p>
        </div>
      } @else if (error()) {
        <div class="empty-state">
          <p class="empty-state-title">{{ error() }}</p>
        </div>
      } @else {
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Intereses</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (subscriber of filteredSubscribers(); track subscriber.id) {
                <tr>
                  <td>{{ subscriber.id }}</td>
                  <td>{{ subscriber.name }}</td>
                  <td>
                    @if (subscriber.status === SUBSCRIBER_STATUS.SUSCRITO) {
                      <span class="badge badge-success">Suscrito</span>
                    } @else if (subscriber.status === SUBSCRIBER_STATUS.PENDIENTE) {
                      <span class="badge badge-warning">Pendiente</span>
                    } @else {
                      <span class="badge badge-danger">{{ subscriber.status }}</span>
                    }
                  </td>
                  <td>
                    <div class="category-tags">
                      @for (interest of subscriber.interests; track interest) {
                        <span class="category-tag">{{ interest }}</span>
                      }
                      @empty {
                        <span class="badge badge-secondary">Sin intereses</span>
                      }
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="editSubscriber(subscriber)">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                      @if (subscriber.status === SUBSCRIBER_STATUS.BAJA) {
                        <button class="btn btn-sm btn-success" (click)="confirmReactivate(subscriber)">
                          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" y1="12" x2="3" y2="12"></line>
                          </svg>
                          Dar de alta
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-danger" (click)="confirmUnsubscribe(subscriber)">
                          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Dar de baja
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">
                      <p class="empty-state-title">No hay suscriptores</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal for editing subscriber -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Editar Suscriptor</h2>
            <button class="modal-close" (click)="closeModal()">×</button>
          </div>
          <form [formGroup]="editForm" (ngSubmit)="saveSubscriber()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="edit_name">Nombre</label>
                <input
                  id="edit_name"
                  class="form-input"
                  type="text"
                  formControlName="name"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="edit_email">Email</label>
                <input
                  id="edit_email"
                  class="form-input"
                  type="email"
                  formControlName="email"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Categorías de Interés</label>
                <div class="form-checkbox-group">
                  @for (cat of categories; track cat) {
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        [value]="cat"
                        [checked]="selectedInterests().includes(cat)"
                        (change)="toggleInterest(cat, $event)"
                      />
                      <span>{{ cat }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || saving()">
                {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal for unsubscribe confirmation -->
    @if (showUnsubscribeModal()) {
      <div class="modal-overlay" (click)="closeUnsubscribeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Confirmar baja</h2>
            <button class="modal-close" (click)="closeUnsubscribeModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              ¿Está seguro de que desea dar de baja a <strong style="color: var(--text-primary);">{{ subscriberToUnsubscribe()?.email }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeUnsubscribeModal()">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="handleUnsubscribe()" [disabled]="unsubscribing()">
              {{ unsubscribing() ? 'Procesando...' : 'Dar de baja' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal for reactivate confirmation -->
    @if (showReactivateModal()) {
      <div class="modal-overlay" (click)="closeReactivateModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Dar de alta</h2>
            <button class="modal-close" (click)="closeReactivateModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              ¿Desea dar de alta a <strong style="color: var(--text-primary);">{{ subscriberToReactivate()?.email }}</strong>?
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeReactivateModal()">Cancelar</button>
            <button type="button" class="btn btn-success" (click)="handleReactivate()" [disabled]="reactivating()">
              {{ reactivating() ? 'Procesando...' : 'Dar de alta' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class SubscribersListComponent implements OnInit {
  private subscriberService = inject(SubscriberService);
  private notificationService = inject(NotificationService);

  // Signals
  subscribers = signal<Subscriber[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  selectedStatus = signal('');
  selectedRole = signal('');

  showModal = signal(false);
  selectedSubscriber = signal<Subscriber | null>(null);
  selectedInterests = signal<string[]>([]);
  saving = signal(false);

  // Unsubscribe modal signals
  showUnsubscribeModal = signal(false);
  subscriberToUnsubscribe = signal<Subscriber | null>(null);
  unsubscribing = signal(false);

  // Reactivate modal signals
  showReactivateModal = signal(false);
  subscriberToReactivate = signal<Subscriber | null>(null);
  reactivating = signal(false);

  // Expose constants to template
  readonly SUBSCRIBER_STATUS = SUBSCRIBER_STATUS;

  categories = ['tecnología', 'programación', 'ia', 'negocios', 'marketing', 'diseño', 'blockchain', 'datos'];

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  // Computed signal para filtrado
  filteredSubscribers = computed(() => {
    let result = this.subscribers();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const role = this.selectedRole();

    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      );
    }

    if (status) {
      result = result.filter(s => s.status === status);
    }

    if (role) {
      result = result.filter(s => s.role === role);
    }

    return result;
  });

  ngOnInit() {
    this.loadSubscribers();
  }

  loadSubscribers() {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedStatus()) filters.status = this.selectedStatus();
    if (this.selectedRole()) filters.role = this.selectedRole();

    this.subscriberService.getAll(filters).subscribe({
      next: (data: any) => {
        this.subscribers.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar suscriptores');
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    // El filtrado es automático gracias a computed()
  }

  editSubscriber(subscriber: Subscriber) {
    this.selectedSubscriber.set(subscriber);
    this.selectedInterests.set(subscriber.interests ? [...subscriber.interests] : []);
    this.editForm.patchValue({
      name: subscriber.name,
      email: subscriber.email
    });
    this.showModal.set(true);
  }

  toggleInterest(category: string, event: any) {
    const current = this.selectedInterests();
    if (event.target.checked) {
      this.selectedInterests.set([...current, category]);
    } else {
      this.selectedInterests.set(current.filter(c => c !== category));
    }
  }

  saveSubscriber() {
    if (this.editForm.valid && this.selectedSubscriber()) {
      this.saving.set(true);
      const subscriber = this.selectedSubscriber()!;

      const data = {
        name: this.editForm.value.name!,
        email: this.editForm.value.email!,
        interests: this.selectedInterests()
      };

      this.subscriberService.update(subscriber.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.notificationService.success(`${subscriber.email} ha sido actualizado correctamente`);
          this.loadSubscribers();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.notificationService.error('Error al actualizar suscriptor');
        }
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedSubscriber.set(null);
    this.selectedInterests.set([]);
    this.editForm.reset();
  }

  // Unsubscribe methods
  confirmUnsubscribe(subscriber: Subscriber) {
    this.subscriberToUnsubscribe.set(subscriber);
    this.showUnsubscribeModal.set(true);
  }

  closeUnsubscribeModal() {
    this.showUnsubscribeModal.set(false);
    this.subscriberToUnsubscribe.set(null);
  }

  handleUnsubscribe() {
    const subscriber = this.subscriberToUnsubscribe();
    if (subscriber) {
      this.unsubscribing.set(true);
      this.subscriberService.unsubscribe(subscriber.id).subscribe({
        next: () => {
          this.unsubscribing.set(false);
          this.closeUnsubscribeModal();
          this.notificationService.success(`${subscriber.email} ha sido dado de baja correctamente`);
          this.loadSubscribers();
        },
        error: (err: any) => {
          this.unsubscribing.set(false);
          this.notificationService.error('Error al dar de baja');
        }
      });
    }
  }

  // Reactivate methods
  confirmReactivate(subscriber: Subscriber) {
    this.subscriberToReactivate.set(subscriber);
    this.showReactivateModal.set(true);
  }

  closeReactivateModal() {
    this.showReactivateModal.set(false);
    this.subscriberToReactivate.set(null);
  }

  handleReactivate() {
    const subscriber = this.subscriberToReactivate();
    if (subscriber) {
      this.reactivating.set(true);
      this.subscriberService.update(subscriber.id, { status: 'suscrito' }).subscribe({
        next: () => {
          this.reactivating.set(false);
          this.closeReactivateModal();
          this.notificationService.success(`${subscriber.email} ha sido dado de alta correctamente`);
          this.loadSubscribers();
        },
        error: (err: any) => {
          this.reactivating.set(false);
          this.notificationService.error('Error al dar de alta');
        }
      });
    }
  }
}
