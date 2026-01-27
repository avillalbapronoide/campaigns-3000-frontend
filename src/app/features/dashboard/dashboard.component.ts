import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { StatsService } from '../../core/services/stats.service';
import { SubscriberService } from '../../core/services/subscriber.service';
import { CampaignService } from '../../core/services/campaign.service';
import { NotificationService } from '../../core/services/notification.service';
import { SUBSCRIBER_STATUS } from '../../core/constants/app.constants';
import { DashboardStats } from '../../core/models/stats.model';
import { Subscriber } from '../../core/models/subscriber.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard">
      <h1 style="font-size: 1.75rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2rem;">Panel General</h1>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando...</p>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Suscriptores Activos</div>
            <div class="stat-value">{{ stats()?.active_subscribers || 0 }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Campañas Enviadas</div>
            <div class="stat-value">{{ stats()?.sent_campaigns || 0 }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Tasa de Apertura</div>
            <div class="stat-value">{{ (stats()?.average_open_rate || 0).toFixed(1) }}%</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total Campañas</div>
            <div class="stat-value">{{ stats()?.total_campaigns || 0 }}</div>
          </div>
        </div>

        <!-- Recent Subscribers -->
        <div class="card" style="margin-top: 2rem;">
          <div class="card-header">
            <h2 class="card-title">Últimos Suscriptores</h2>
          </div>

          @if (loadingSubscribers()) {
            <div class="loading">
              <div class="spinner"></div>
            </div>
          } @else if (recentSubscribers().length === 0) {
            <div class="empty-state">
              <p>No hay suscriptores recientes</p>
            </div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Categorías</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (sub of recentSubscribers(); track sub.id) {
                  <tr>
                    <td>{{ sub.id }}</td>
                    <td>{{ sub.name }}</td>
                    <td>{{ sub.email }}</td>
                    <td>
                      <div class="category-tags">
                        @for (interest of sub.interests?.slice(0, 3); track interest) {
                          <span class="category-tag">{{ interest }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (sub.status === SUBSCRIBER_STATUS.SUSCRITO) {
                        <span class="badge badge-success">Suscrito</span>
                      } @else if (sub.status === SUBSCRIBER_STATUS.PENDIENTE) {
                        <span class="badge badge-warning">Pendiente</span>
                      } @else {
                        <span class="badge badge-danger">{{ sub.status }}</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- New Campaign Form -->
        <div class="card" style="margin-top: 2rem;">
          <div class="card-header">
            <h2 class="card-title">Enviar Nueva Campaña</h2>
          </div>

          <form [formGroup]="campaignForm" (ngSubmit)="createCampaign()">
            <div class="form-group">
              <label class="form-label" for="name">Nombre</label>
              <input
                id="name"
                class="form-input"
                type="text"
                formControlName="name"
                placeholder="Nombre de la campaña"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="subject">Asunto</label>
              <input
                id="subject"
                class="form-input"
                type="text"
                formControlName="subject"
                placeholder="Asunto de la campaña"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="content">Contenido</label>
              <textarea
                id="content"
                class="form-textarea"
                formControlName="content"
                placeholder="Contenido del email"
                rows="5"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Categorías de Interés</label>
              <div class="form-checkbox-group">
                @for (cat of categories; track cat) {
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [value]="cat"
                      [checked]="selectedCategories.includes(cat)"
                      (change)="toggleCategory(cat, $event)"
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
                      [checked]="showSchedule()"
                      (change)="toggleSchedule($event)"
                    />
                    <span>Programar envío</span>
                  </label>
                  @if (showSchedule()) {
                    <input
                      id="scheduled_date"
                      class="form-input datepicker-dark"
                      type="datetime-local"
                      formControlName="scheduled_date"
                      style="max-width: 250px; margin: 0;"
                    />
                  }
                </div>
              </div>
            </div>

            @if (campaignError()) {
              <div class="badge badge-danger" style="width: 100%; margin-bottom: 1rem;">
                {{ campaignError() }}
              </div>
            }

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-outline"
                (click)="resetForm()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                (click)="saveDraft()"
                [disabled]="campaignForm.invalid || creatingCampaign()"
              >
                Guardar como borrador
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="campaignForm.invalid || creatingCampaign() || selectedCategories.length === 0"
              >
                @if (creatingCampaign()) {
                  {{ showSchedule() ? 'Programando...' : 'Enviando...' }}
                } @else {
                  {{ showSchedule() ? 'Programar' : 'Enviar' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private subscriberService = inject(SubscriberService);
  private campaignService = inject(CampaignService);
  private notificationService = inject(NotificationService);

  // Signals para el estado
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  recentSubscribers = signal<any[]>([]);
  loadingSubscribers = signal(true);
  recentCampaigns = signal<any[]>([]);

  creatingCampaign = signal(false);
  campaignError = signal('');
  showSchedule = signal(false);

  // Expose constants to template
  readonly SUBSCRIBER_STATUS = SUBSCRIBER_STATUS;

  categories = ['tecnología', 'programación', 'ia', 'negocios', 'marketing', 'diseño', 'blockchain', 'datos'];
  selectedCategories: string[] = [];

  campaignForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    subject: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required]),
    track_clicks: new FormControl(false),
    scheduled_date: new FormControl('')
  });

  ngOnInit() {
    this.loadStats();
    this.loadRecentSubscribers();
  }

  private loadStats() {
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar estadísticas');
        this.loading.set(false);
      }
    });
  }

  private loadRecentSubscribers() {
    this.subscriberService.getAll().subscribe({
      next: (data: any) => {
        // Tomar solo los últimos 5
        const recent = data.slice(0, 5);
        this.recentSubscribers.set(recent);
        this.loadingSubscribers.set(false);
      },
      error: (err: any) => {
        this.loadingSubscribers.set(false);
      }
    });
  }

  toggleCategory(category: string, event: any) {
    if (event.target.checked) {
      this.selectedCategories.push(category);
    } else {
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      }
    }
  }

  toggleSchedule(event: any) {
    this.showSchedule.set(event.target.checked);
    if (!event.target.checked) {
      this.campaignForm.patchValue({ scheduled_date: '' });
    }
  }

  // Convert datetime-local value to timestamp number
  toTimestamp(dateTimeLocal: string): number {
    const d = new Date(dateTimeLocal);
    return d.getTime();
  }

  createCampaign() {
    if (this.campaignForm.valid && this.selectedCategories.length > 0) {
      this.creatingCampaign.set(true);
      this.campaignError.set('');

      const campaignData: any = {
        name: this.campaignForm.value.name!,
        subject: this.campaignForm.value.subject!,
        content: this.campaignForm.value.content!,
        categories: this.selectedCategories,
        track_clicks: this.campaignForm.value.track_clicks || false,
        status: this.showSchedule() ? ('programada' as const) : ('enviada' as const)
      };

      if (this.showSchedule() && this.campaignForm.value.scheduled_date) {
        campaignData.scheduled_date = this.toTimestamp(this.campaignForm.value.scheduled_date);
      }

      this.campaignService.create(campaignData).subscribe({
        next: () => {
          this.creatingCampaign.set(false);
          this.notificationService.success(this.showSchedule() ? 'Campaña programada exitosamente' : 'Campaña enviada exitosamente');
          this.resetForm();
          this.loadStats();
        },
        error: (err: any) => {
          this.creatingCampaign.set(false);
          this.notificationService.error(this.showSchedule() ? 'Error al programar campaña' : 'Error al enviar campaña');
        }
      });
    } else if (this.selectedCategories.length === 0) {
      this.campaignError.set('Selecciona al menos una categoría');
    }
  }

  saveDraft() {
    if (this.campaignForm.valid && this.selectedCategories.length > 0) {
      this.creatingCampaign.set(true);
      this.campaignError.set('');

      const campaignData: any = {
        name: this.campaignForm.value.name!,
        subject: this.campaignForm.value.subject!,
        content: this.campaignForm.value.content!,
        categories: this.selectedCategories,
        track_clicks: this.campaignForm.value.track_clicks || false,
        status: 'borrador' as const
      };

      this.campaignService.create(campaignData).subscribe({
        next: () => {
          this.creatingCampaign.set(false);
          this.notificationService.success('Borrador guardado exitosamente');
          this.resetForm();
          this.loadStats();
        },
        error: (err: any) => {
          this.creatingCampaign.set(false);
          this.notificationService.error('Error al guardar borrador');
        }
      });
    } else if (this.selectedCategories.length === 0) {
      this.campaignError.set('Selecciona al menos una categoría');
    }
  }

  resetForm() {
    this.campaignForm.reset({
      name: '',
      subject: '',
      content: '',
      track_clicks: false,
      scheduled_date: ''
    });
    this.selectedCategories = [];
    this.showSchedule.set(false);
    this.campaignError.set('');
  }
}
