import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SubscriberService } from '../../../core/services/subscriber.service';
import { Campaign } from '../../../core/models/campaign.model';
import { USER_ROLES, CAMPAIGN_STATUS, VALID_CATEGORIES } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-campaigns-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="campaigns-page">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="font-size: 1.75rem; font-weight: 600; color: var(--text-primary); margin: 0;">Campañas</h1>
        <!-- Botón de importar JSON ocultado
        @if (isAdmin()) {
          <button class="btn btn-primary" (click)="showImportModal()">
            📤 Importar desde JSON
          </button>
        }
        -->
      </div>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando campañas...</p>
        </div>
      } @else if (error()) {
        <div class="empty-state">
          <p class="empty-state-title">{{ error() }}</p>
        </div>
      } @else if (responseStatus() === 'no_subscription') {
        <div class="empty-state">
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
            <p class="empty-state-title" style="margin-bottom: 1rem;">Debes suscribirte para ver las campañas</p>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Suscríbete a las categorías que te interesen para recibir nuestras newsletters.</p>
            <a routerLink="/subscription" class="btn btn-primary">Ir a Suscripción</a>
          </div>
        </div>
      } @else if (responseStatus() === 'no_campaigns') {
        <div class="empty-state">
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
            <p class="empty-state-title">No hay campañas disponibles para tus categorías suscritas</p>
            <p style="color: var(--text-secondary);">Todavía no se han enviado campañas para las categorías a las que estás suscrito.</p>
          </div>
        </div>
      } @else if (campaigns().length === 0) {
        <div class="empty-state">
          <p class="empty-state-title">No hay campañas disponibles</p>
        </div>
      } @else {
        <div class="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categorías</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (campaign of campaigns(); track campaign.id) {
                <tr>
                  <td>{{ campaign.id }}</td>
                  <td>{{ campaign.subject }}</td>
                  <td>
                    @if (campaign.categories && campaign.categories.length > 0) {
                      <div class="category-tags">
                        @for (category of campaign.categories; track category) {
                          <span class="category-tag">{{ category }}</span>
                        }
                      </div>
                    } @else {
                      <span>N/A</span>
                    }
                  </td>
                  <td>
                    @if (campaign.status === CAMPAIGN_STATUS.ENVIADA) {
                      <span class="badge badge-success">Enviada</span>
                    } @else if (campaign.status === CAMPAIGN_STATUS.PROGRAMADA) {
                      <span class="badge badge-warning">Programada</span>
                    } @else if (campaign.status === CAMPAIGN_STATUS.BORRADOR) {
                      <span class="badge badge-secondary">Borrador</span>
                    }
                  </td>
                  <td>{{ getCampaignDate(campaign) }}</td>
                  <td>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                      @if (campaign.status === CAMPAIGN_STATUS.ENVIADA) {
                        <button class="btn btn-sm btn-outline" (click)="viewCampaign(campaign)">
                          Ver contenido
                        </button>
                      }
                      @if (isAdmin() && campaign.status === CAMPAIGN_STATUS.ENVIADA) {
                        <button class="btn btn-sm btn-primary" (click)="viewReport(campaign)">
                          Ver informe
                        </button>
                      }
                      @if (isAdmin() && campaign.status === CAMPAIGN_STATUS.BORRADOR) {
                        <button class="btn btn-sm btn-outline" (click)="editCampaign(campaign)">
                          Editar
                        </button>
                        <button class="btn btn-sm btn-primary" (click)="confirmSend(campaign)">
                          Enviar
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="confirmDelete(campaign)">
                          Eliminar
                        </button>
                      }
                      @if (isAdmin() && campaign.status === CAMPAIGN_STATUS.PROGRAMADA) {
                        <button class="btn btn-sm btn-outline" (click)="editCampaign(campaign)">
                          Editar
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="confirmDelete(campaign)">
                          Eliminar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal for campaign details -->
    @if (showDetailsModal()) {
      <div class="modal-overlay" (click)="closeDetailsModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">{{ selectedCampaign()?.subject }}</h2>
            <button class="modal-close" (click)="closeDetailsModal()">×</button>
          </div>
          <div class="modal-body">
            @if (selectedCampaign(); as campaign) {
              <div class="form-group">
                <label class="form-label">Categorías</label>
                <div class="category-tags">
                  @if (campaign.categories && campaign.categories.length > 0) {
                    @for (category of campaign.categories; track category) {
                      <span class="category-tag">{{ category }}</span>
                    }
                  } @else {
                    <span>N/A</span>
                  }
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <div>
                  @if (campaign.status === CAMPAIGN_STATUS.ENVIADA) {
                    <span class="badge badge-success">Enviada</span>
                  } @else if (campaign.status === CAMPAIGN_STATUS.PROGRAMADA) {
                    <span class="badge badge-warning">Programada</span>
                  } @else if (campaign.status === CAMPAIGN_STATUS.BORRADOR) {
                    <span class="badge badge-secondary">Borrador</span>
                  }
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Asunto</label>
                <p>{{ campaign.subject }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">Contenido</label>
                <p style="white-space: pre-wrap;">{{ campaign.content }}</p>
              </div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeDetailsModal()">Cerrar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal for campaign report -->
    @if (showReportModal()) {
      <div class="modal-overlay" (click)="closeReportModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">📊 Informe de {{ selectedCampaign()?.subject }}</h2>
            <button class="modal-close" (click)="closeReportModal()">×</button>
          </div>
          <div class="modal-body">
            @if (loadingStats()) {
              <div class="loading">
                <div class="spinner"></div>
                <p>Cargando informe...</p>
              </div>
            } @else if (campaignStats(); as stats) {
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.25rem; border-radius: 8px; color: white; grid-column: span 2;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total de Destinatarios</div>
                  <div style="font-size: 2rem; font-weight: 600;">{{ stats.total_recipients || 0 }}</div>
                </div>

                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.25rem; border-radius: 8px; color: white;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total de Aperturas</div>
                  <div style="font-size: 2rem; font-weight: 600;">{{ stats.total_opens || 0 }}</div>
                </div>

                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.25rem; border-radius: 8px; color: white;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Tasa de Apertura</div>
                  <div style="font-size: 2rem; font-weight: 600;">{{ stats.open_rate || 0 }}%</div>
                </div>

                @if (stats.track_clicks) {
                  <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 1.25rem; border-radius: 8px; color: white;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total de Clicks</div>
                    <div style="font-size: 2rem; font-weight: 600;">{{ stats.total_clicks || 0 }}</div>
                  </div>

                  <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 1.25rem; border-radius: 8px; color: white;">
                    <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Tasa de Clicks</div>
                    <div style="font-size: 2rem; font-weight: 600;">{{ stats.click_rate || 0 }}%</div>
                  </div>
                }
              </div>

              <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">Fecha de Envío</div>
                <div style="color: var(--text-primary); font-weight: 500;">{{ formatDate(stats.sent_date || selectedCampaign()?.created_at) }}</div>
              </div>

              @if (!stats.track_clicks) {
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--accent-color);">
                  <div style="color: var(--text-secondary); font-size: 0.875rem;">
                    ℹ️ El rastreo de clicks no está habilitado para esta campaña
                  </div>
                </div>
              }
            }
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeReportModal()">Cerrar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal for import campaigns -->
    @if (showImport()) {
      <div class="modal-overlay" (click)="closeImportModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width: 600px;">
          <div class="modal-header">
            <h2 class="modal-title">📤 Importar Campañas desde JSON</h2>
            <button class="modal-close" (click)="closeImportModal()">×</button>
          </div>
          <div class="modal-body">
            @if (importStep() === 'upload') {
              <div class="form-group">
                <label class="form-label">Seleccionar archivo JSON</label>
                <input
                  type="file"
                  accept=".json"
                  class="form-input"
                  style="padding: 0.5rem;"
                  (change)="onFileSelected($event)"
                />
              </div>

              <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid var(--accent-color);">
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                  <strong style="color: var(--text-primary);">Formato esperado:</strong>
                </p>
                <pre style="color: var(--text-primary); font-size: 0.75rem; overflow-x: auto; background: var(--bg-card); padding: 0.75rem; border-radius: 4px; margin: 0;">{{ '{' }}
  "campaigns": [
    {{ '{' }}
      "name": "Nombre de la campaña",
      "subject": "Asunto del email",
      "content": "Contenido del mensaje",
      "categories": ["tecnología", "programación"],
      "track_clicks": true,
      "scheduled_date": "2025-01-15T10:00:00.000Z"
    {{ '}' }}
  ]
{{ '}' }}</pre>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem; margin-bottom: 0;">
                  Categorías válidas: tecnología, programación, ia, negocios, marketing, diseño, blockchain, datos
                </p>
              </div>
            } @else if (importStep() === 'processing') {
              <div style="padding: 2rem; text-align: center;">
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--text-secondary);">Validando y creando campañas...</p>
              </div>
            } @else if (importStep() === 'results') {
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 8px; color: white; text-align: center;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">Total</div>
                  <div style="font-size: 1.75rem; font-weight: 600;">{{ importResults().total }}</div>
                </div>
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 1rem; border-radius: 8px; color: white; text-align: center;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">Exitosas</div>
                  <div style="font-size: 1.75rem; font-weight: 600;">{{ importResults().successful.length }}</div>
                </div>
                <div style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 1rem; border-radius: 8px; color: white; text-align: center;">
                  <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.25rem;">Fallidas</div>
                  <div style="font-size: 1.75rem; font-weight: 600;">{{ importResults().failed.length }}</div>
                </div>
              </div>

              @if (importResults().successful.length > 0) {
                <div style="margin-bottom: 1.5rem;">
                  <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.75rem;">✅ Campañas importadas correctamente:</h4>
                  <div style="max-height: 200px; overflow-y: auto; background: var(--bg-secondary); padding: 0.75rem; border-radius: 6px;">
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.875rem;">
                      @for (camp of importResults().successful; track camp.name) {
                        <li><strong style="color: var(--text-primary);">{{ camp.name }}</strong> - {{ formatDate(camp.scheduled_date) }}</li>
                      }
                    </ul>
                  </div>
                </div>
              }

              @if (importResults().failed.length > 0) {
                <div>
                  <h4 style="color: var(--text-primary); font-size: 1rem; margin-bottom: 0.75rem;">❌ Campañas con errores:</h4>
                  <div style="max-height: 200px; overflow-y: auto; background: var(--bg-secondary); padding: 0.75rem; border-radius: 6px;">
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.875rem;">
                      @for (camp of importResults().failed; track camp.index) {
                        <li><strong style="color: var(--text-primary);">Campaña #{{ camp.index }} ({{ camp.name }}):</strong> {{ camp.error }}</li>
                      }
                    </ul>
                  </div>
                </div>
              }
            } @else if (importStep() === 'error') {
              <p style="color: var(--text-secondary); margin-bottom: 1.5rem; white-space: pre-wrap;">
                {{ importError() }}
              </p>
            }
          </div>
          <div class="modal-footer">
            @if (importStep() === 'upload') {
              <button class="btn btn-outline" (click)="closeImportModal()">Cancelar</button>
              <button class="btn btn-primary" (click)="processImport()" [disabled]="!selectedFile()">Importar Campañas</button>
            } @else if (importStep() === 'results' || importStep() === 'error') {
              <button class="btn btn-primary" (click)="closeImportModal()">Cerrar</button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Modal for delete confirmation -->
    @if (showDeleteModal()) {
      <div class="modal-overlay" (click)="closeDeleteModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Confirmar eliminación</h2>
            <button class="modal-close" (click)="closeDeleteModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              ¿Estás seguro de que deseas eliminar la campaña <strong style="color: var(--text-primary);">"{{ campaignToDelete()?.subject }}"</strong>?
            </p>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeDeleteModal()">Cancelar</button>
            <button type="button" class="btn btn-danger" (click)="handleDelete()" [disabled]="deleting()">
              {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal for edit campaign -->
    @if (showEditModal()) {
      <div class="modal-overlay" (click)="closeEditModal()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width: 600px;">
          <div class="modal-header">
            <h2 class="modal-title">Editar Campaña</h2>
            <button class="modal-close" (click)="closeEditModal()">×</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="editForm">
              <div class="form-group">
                <label class="form-label" for="edit-name">Nombre</label>
                <input
                  id="edit-name"
                  class="form-input"
                  type="text"
                  formControlName="name"
                  placeholder="Nombre de la campaña"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-subject">Asunto</label>
                <input
                  id="edit-subject"
                  class="form-input"
                  type="text"
                  formControlName="subject"
                  placeholder="Asunto de la campaña"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-content">Contenido</label>
                <textarea
                  id="edit-content"
                  class="form-textarea"
                  formControlName="content"
                  placeholder="Contenido del email"
                  rows="5"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Categorías</label>
                <div class="form-checkbox-group">
                  @for (cat of validCategories; track cat) {
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        [checked]="editSelectedCategories.includes(cat)"
                        (change)="toggleEditCategory(cat, $event)"
                      />
                      <span>{{ cat }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Opciones</label>
                <div class="form-checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      formControlName="track_clicks"
                    />
                    <span>Rastrear clicks</span>
                  </label>
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <label class="checkbox-label" style="margin: 0;">
                      <input
                        type="checkbox"
                        [checked]="showEditSchedule()"
                        (change)="toggleEditSchedule($event)"
                      />
                      <span>Programar envío</span>
                    </label>
                    @if (showEditSchedule()) {
                      <input
                        class="form-input datepicker-dark"
                        type="datetime-local"
                        formControlName="scheduled_date"
                        style="max-width: 250px; margin: 0;"
                      />
                    }
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeEditModal()">Cancelar</button>
            <button type="button" class="btn btn-secondary" (click)="saveEditCampaign()" [disabled]="editForm.invalid || saving() || editSelectedCategories.length === 0">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
            @if (!showEditSchedule()) {
              <button type="button" class="btn btn-primary" (click)="sendFromEdit()" [disabled]="editForm.invalid || saving() || editSelectedCategories.length === 0">
                {{ saving() ? 'Enviando...' : 'Enviar ahora' }}
              </button>
            } @else {
              <button type="button" class="btn btn-primary" (click)="scheduleFromEdit()" [disabled]="editForm.invalid || saving() || editSelectedCategories.length === 0 || !editForm.value.scheduled_date">
                {{ saving() ? 'Programando...' : 'Programar' }}
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- Modal for send confirmation -->
    @if (showSendModal()) {
      <div class="modal-overlay" (click)="closeSendModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2 class="modal-title">Confirmar envío</h2>
            <button class="modal-close" (click)="closeSendModal()">×</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
              ¿Estás seguro de que deseas enviar la campaña <strong style="color: var(--text-primary);">"{{ campaignToSend()?.subject }}"</strong>?
            </p>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">
              La campaña se enviará inmediatamente a todos los suscriptores de las categorías seleccionadas.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="closeSendModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="handleSend()" [disabled]="sending()">
              {{ sending() ? 'Enviando...' : 'Enviar ahora' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class CampaignsListComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private subscriberService = inject(SubscriberService);

  campaigns = signal<Campaign[]>([]);
  loading = signal(true);
  error = signal('');
  responseStatus = signal<'ok' | 'no_subscription' | 'no_campaigns'>('ok');
  currentSubscriberId = signal<number | null>(null);

  showDetailsModal = signal(false);
  showReportModal = signal(false);
  selectedCampaign = signal<Campaign | null>(null);
  campaignStats = signal<any>(null);
  loadingStats = signal(false);

  showImport = signal(false);
  importStep = signal<'upload' | 'processing' | 'results' | 'error'>('upload');
  selectedFile = signal<File | null>(null);
  importError = signal('');
  importResults = signal<any>({ total: 0, successful: [], failed: [] });

  // Delete modal signals
  showDeleteModal = signal(false);
  campaignToDelete = signal<Campaign | null>(null);
  deleting = signal(false);

  // Edit modal signals
  showEditModal = signal(false);
  campaignToEdit = signal<Campaign | null>(null);
  saving = signal(false);
  showEditSchedule = signal(false);
  editSelectedCategories: string[] = [];

  // Send modal signals
  showSendModal = signal(false);
  campaignToSend = signal<Campaign | null>(null);
  sending = signal(false);

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    subject: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    track_clicks: new FormControl(false),
    scheduled_date: new FormControl('')
  });

  isAdmin = signal(false);
  validCategories = [...VALID_CATEGORIES];

  // Expose constants to template
  readonly CAMPAIGN_STATUS = CAMPAIGN_STATUS;

  ngOnInit() {
    const user = this.authService.currentUser();
    this.isAdmin.set(user?.role === USER_ROLES.ADMIN);
    this.loadCampaigns();

    // Load subscriber ID for non-admin users to track opens
    if (user && user.role !== USER_ROLES.ADMIN) {
      this.subscriberService.getByUserId(user.id).subscribe({
        next: (subscriber) => {
          if (subscriber) {
            this.currentSubscriberId.set(subscriber.id);
          }
        },
        error: () => {
          // Subscriber not found, ignore
        }
      });
    }
  }

  loadCampaigns() {
    this.loading.set(true);
    this.campaignService.getAll().subscribe({
      next: (response: any) => {
        // Handle new response format with status
        if (response.status && response.campaigns) {
          this.responseStatus.set(response.status);
          this.campaigns.set(response.campaigns);
        } else {
          // Fallback for old format (array directly)
          this.responseStatus.set('ok');
          this.campaigns.set(response);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar las campañas');
        this.loading.set(false);
      }
    });
  }

  getCampaignDate(campaign: Campaign): string {
    const date = campaign.sent_date || campaign.scheduled_date || campaign.created_at;
    return this.formatDate(date);
  }

  formatDate(date: number | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Convert datetime-local value to timestamp number
  toTimestamp(dateTimeLocal: string): number {
    // datetime-local format: YYYY-MM-DDTHH:MM
    // Convert to Date object and then to timestamp
    const d = new Date(dateTimeLocal);
    return d.getTime();
  }

  viewCampaign(campaign: Campaign) {
    this.selectedCampaign.set(campaign);
    this.showDetailsModal.set(true);

    // Track open for non-admin users
    const subscriberId = this.currentSubscriberId();
    if (!this.isAdmin() && subscriberId) {
      this.campaignService.trackOpen(campaign.id, subscriberId).subscribe({
        next: () => {
          // Open tracked successfully
        },
        error: (err) => {
          console.error('Error tracking open:', err);
        }
      });
    }
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedCampaign.set(null);
  }

  viewReport(campaign: Campaign) {
    this.selectedCampaign.set(campaign);
    this.showReportModal.set(true);
    this.loadCampaignStats(campaign.id);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedCampaign.set(null);
    this.campaignStats.set(null);
  }

  loadCampaignStats(id: number) {
    this.loadingStats.set(true);
    this.campaignService.getStats(id).subscribe({
      next: (stats: any) => {
        this.campaignStats.set(stats);
        this.loadingStats.set(false);
      },
      error: (err: any) => {
        console.error('Error loading stats:', err);
        this.loadingStats.set(false);
      }
    });
  }

  // Delete modal methods
  confirmDelete(campaign: Campaign) {
    this.campaignToDelete.set(campaign);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.campaignToDelete.set(null);
  }

  handleDelete() {
    const campaign = this.campaignToDelete();
    if (campaign) {
      this.deleting.set(true);
      this.campaignService.delete(campaign.id).subscribe({
        next: () => {
          this.deleting.set(false);
          this.closeDeleteModal();
          this.notificationService.success(`Campaña "${campaign.subject}" eliminada correctamente`);
          this.loadCampaigns();
        },
        error: (err: any) => {
          this.deleting.set(false);
          this.notificationService.error('Error al eliminar campaña');
        }
      });
    }
  }

  showImportModal() {
    this.showImport.set(true);
    this.importStep.set('upload');
    this.selectedFile.set(null);
    this.importError.set('');
  }

  closeImportModal() {
    this.showImport.set(false);
    if (this.importResults().successful.length > 0) {
      this.loadCampaigns();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  async processImport() {
    const file = this.selectedFile();
    if (!file) return;

    try {
      this.importStep.set('processing');

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.campaigns || !Array.isArray(data.campaigns)) {
        throw new Error('JSON inválido: debe contener un array "campaigns"');
      }

      if (data.campaigns.length === 0) {
        throw new Error('No hay campañas para importar');
      }

      const allErrors: string[] = [];
      data.campaigns.forEach((campaign: any, index: number) => {
        const errors = this.validateCampaign(campaign, index);
        allErrors.push(...errors);
      });

      if (allErrors.length > 0) {
        this.importError.set(allErrors.join('\n'));
        this.importStep.set('error');
        return;
      }

      await this.importCampaigns(data.campaigns);

    } catch (error: any) {
      if (error instanceof SyntaxError) {
        this.importError.set('El archivo no es un JSON válido');
      } else {
        this.importError.set(error.message || 'Error desconocido');
      }
      this.importStep.set('error');
    }
  }

  validateCampaign(campaign: any, index: number): string[] {
    const errors: string[] = [];

    if (!campaign.name || campaign.name.trim().length === 0) {
      errors.push(`Campaña #${index + 1}: "name" es requerido`);
    }

    if (!campaign.subject || campaign.subject.trim().length === 0) {
      errors.push(`Campaña #${index + 1}: "subject" es requerido`);
    }

    if (!campaign.content || campaign.content.trim().length === 0) {
      errors.push(`Campaña #${index + 1}: "content" es requerido`);
    }

    if (!campaign.categories || !Array.isArray(campaign.categories) || campaign.categories.length === 0) {
      errors.push(`Campaña #${index + 1}: "categories" debe ser un array con al menos una categoría`);
    } else {
      const invalidCategories = campaign.categories.filter((cat: string) => !(this.validCategories as readonly string[]).includes(cat));
      if (invalidCategories.length > 0) {
        errors.push(`Campaña #${index + 1}: categorías inválidas: ${invalidCategories.join(', ')}`);
      }
    }

    if (!campaign.scheduled_date) {
      errors.push(`Campaña #${index + 1}: "scheduled_date" es requerido`);
    } else {
      const scheduledDate = new Date(campaign.scheduled_date);
      if (isNaN(scheduledDate.getTime())) {
        errors.push(`Campaña #${index + 1}: "scheduled_date" no es una fecha válida`);
      } else if (scheduledDate <= new Date()) {
        errors.push(`Campaña #${index + 1}: "scheduled_date" debe ser una fecha futura`);
      }
    }

    if (campaign.track_clicks !== undefined && typeof campaign.track_clicks !== 'boolean') {
      errors.push(`Campaña #${index + 1}: "track_clicks" debe ser true o false`);
    }

    return errors;
  }

  async importCampaigns(campaigns: any[]) {
    const results = {
      total: campaigns.length,
      successful: [] as any[],
      failed: [] as any[]
    };

    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];

      try {
        await new Promise<void>((resolve, reject) => {
          this.campaignService.create({
            name: campaign.name,
            subject: campaign.subject,
            content: campaign.content,
            categories: campaign.categories,
            track_clicks: campaign.track_clicks || false,
            status: CAMPAIGN_STATUS.PROGRAMADA,
            scheduled_date: campaign.scheduled_date
          }).subscribe({
            next: () => {
              results.successful.push({
                index: i + 1,
                name: campaign.name,
                scheduled_date: campaign.scheduled_date
              });
              resolve();
            },
            error: (err: any) => {
              results.failed.push({
                index: i + 1,
                name: campaign.name,
                error: err.error?.message || 'Error desconocido'
              });
              resolve();
            }
          });
        });
      } catch (error: any) {
        results.failed.push({
          index: i + 1,
          name: campaign.name,
          error: error.message
        });
      }
    }

    this.importResults.set(results);
    this.importStep.set('results');
  }

  // Convert timestamp to YYYY-MM-DDTHH:MM for datetime-local input
  toLocalInputString(timestamp: number): string {
    const d = new Date(timestamp);
    // Adjust for timezone offset to get local time components in ISO format
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  }

  // Edit modal methods
  editCampaign(campaign: Campaign) {
    this.campaignToEdit.set(campaign);
    this.editForm.patchValue({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      track_clicks: campaign.track_clicks || false,
      scheduled_date: campaign.scheduled_date ? this.toLocalInputString(campaign.scheduled_date) : ''
    });
    this.editSelectedCategories = campaign.categories ? [...campaign.categories] : [];
    this.showEditSchedule.set(campaign.status === CAMPAIGN_STATUS.PROGRAMADA && !!campaign.scheduled_date);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.campaignToEdit.set(null);
    this.editForm.reset();
    this.editSelectedCategories = [];
    this.showEditSchedule.set(false);
  }

  toggleEditCategory(category: string, event: any) {
    if (event.target.checked) {
      this.editSelectedCategories.push(category);
    } else {
      const index = this.editSelectedCategories.indexOf(category);
      if (index > -1) {
        this.editSelectedCategories.splice(index, 1);
      }
    }
  }

  toggleEditSchedule(event: any) {
    this.showEditSchedule.set(event.target.checked);
    if (!event.target.checked) {
      this.editForm.patchValue({ scheduled_date: '' });
    }
  }

  saveEditCampaign() {
    const campaign = this.campaignToEdit();
    if (campaign && this.editForm.valid && this.editSelectedCategories.length > 0) {
      this.saving.set(true);

      const updateData: any = {
        name: this.editForm.value.name!,
        subject: this.editForm.value.subject!,
        content: this.editForm.value.content!,
        categories: this.editSelectedCategories,
        track_clicks: this.editForm.value.track_clicks || false
      };

      // Update status based on schedule
      if (this.showEditSchedule() && this.editForm.value.scheduled_date) {
        updateData.status = 'programada';
        updateData.scheduled_date = this.toTimestamp(this.editForm.value.scheduled_date);
      } else if (campaign.status === CAMPAIGN_STATUS.PROGRAMADA) {
        // If was scheduled but now not, keep as draft
        updateData.status = 'borrador';
        updateData.scheduled_date = null;
      }

      this.campaignService.update(campaign.id, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.notificationService.success(`Campaña "${campaign.subject}" actualizada correctamente`);
          this.loadCampaigns();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.notificationService.error('Error al actualizar campaña');
        }
      });
    }
  }

  // Send modal methods
  confirmSend(campaign: Campaign) {
    this.campaignToSend.set(campaign);
    this.showSendModal.set(true);
  }

  closeSendModal() {
    this.showSendModal.set(false);
    this.campaignToSend.set(null);
  }

  handleSend() {
    const campaign = this.campaignToSend();
    if (campaign) {
      this.sending.set(true);
      this.campaignService.update(campaign.id, { status: 'enviada' }).subscribe({
        next: () => {
          this.sending.set(false);
          this.closeSendModal();
          this.notificationService.success(`Campaña "${campaign.subject}" enviada correctamente`);
          this.loadCampaigns();
        },
        error: (err: any) => {
          this.sending.set(false);
          this.notificationService.error('Error al enviar campaña');
        }
      });
    }
  }

  // Send/schedule from edit modal
  sendFromEdit() {
    const campaign = this.campaignToEdit();
    if (campaign && this.editForm.valid && this.editSelectedCategories.length > 0) {
      this.saving.set(true);

      const updateData: any = {
        name: this.editForm.value.name!,
        subject: this.editForm.value.subject!,
        content: this.editForm.value.content!,
        categories: this.editSelectedCategories,
        track_clicks: this.editForm.value.track_clicks || false,
        status: 'enviada'
      };

      this.campaignService.update(campaign.id, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.notificationService.success(`Campaña "${campaign.subject}" enviada correctamente`);
          this.loadCampaigns();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.notificationService.error('Error al enviar campaña');
        }
      });
    }
  }

  scheduleFromEdit() {
    const campaign = this.campaignToEdit();
    if (campaign && this.editForm.valid && this.editSelectedCategories.length > 0 && this.editForm.value.scheduled_date) {
      this.saving.set(true);

      const updateData: any = {
        name: this.editForm.value.name!,
        subject: this.editForm.value.subject!,
        content: this.editForm.value.content!,
        categories: this.editSelectedCategories,
        track_clicks: this.editForm.value.track_clicks || false,
        status: 'programada',
        scheduled_date: this.toTimestamp(this.editForm.value.scheduled_date)
      };

      this.campaignService.update(campaign.id, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.notificationService.success(`Campaña "${campaign.subject}" programada correctamente`);
          this.loadCampaigns();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.notificationService.error('Error al programar campaña');
        }
      });
    }
  }
}
