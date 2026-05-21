import { Component, OnInit, signal, inject, ViewChild, TemplateRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserManagementLayoutComponent } from '../../../shared/components/ui/user-management/user-management-layout.component';
import { TablePaginationComponent } from '../../../shared/components/ui/user-management/table-pagination.component';
import { NgIconComponent } from '@ng-icons/core';
import { MatRippleModule } from '@angular/material/core';
import { ModalService } from '../../../services/modal/modal.service';
import { ToastService } from '../../../services/toast/toast.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ConfirmDeleteComponent } from '../../../shared/components/ui/confirm-delete/confirm-delete.component';
import { ZoneService, Zone } from '../../../services/zone/zone.service';

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserManagementLayoutComponent,
    TablePaginationComponent,
    NgIconComponent,
    MatRippleModule,
    HasPermissionDirective,
    ConfirmDeleteComponent
  ],
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.css'
})
export class ZoneComponent implements OnInit {
  @ViewChild('zoneModal') zoneModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;

  zoneToDelete = signal<Zone | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly zoneService = inject(ZoneService);
  public readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  zones = signal<Zone[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  filteredZones = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.zones();
    return this.zones().filter((z: Zone) =>
      z.zone_code.toLowerCase().includes(term) ||
      z.zone_name.toLowerCase().includes(term) ||
      (z.leader && z.leader.toLowerCase().includes(term))
    );
  });

  paginatedZones = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredZones().slice(start, end);
  });

  selectedZone = signal<Zone | null>(null);
  isLoading = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  zoneForm: FormGroup;
  originalFormValue: any = null;

  constructor() {
    this.zoneForm = this.fb.group({
      zone_code: ['', [Validators.required]],
      zone_name: ['', [Validators.required]],
      leader: [''],
      status: [true]
    });
  }

  hasChanges(): boolean {
    if (!this.originalFormValue) return false;
    const current: Record<string, any> = this.zoneForm.value;
    const original: Record<string, any> = this.originalFormValue;
    for (const key of Object.keys(current)) {
      if (current[key] !== original[key]) return true;
    }
    return false;
  }

  syncModalConfirmState(): void {
    const isFormInvalid = this.zoneForm.invalid;
    const hasNoChanges = !this.hasChanges();
    this.modalService.setConfirmDisabled(isFormInvalid || hasNoChanges);
  }

  ngOnInit(): void {
    this.loadZones();
    this.zoneForm.valueChanges.subscribe(() => {
      this.syncModalConfirmState();
    });
  }

  async loadZones(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.zoneService.getAll();
      this.zones.set(response || []);
      const currentSelected = this.selectedZone();
      if (currentSelected) {
        const updated = response.find(z => z.id === currentSelected.id);
        this.selectedZone.set(updated || null);
      }
    } catch (error) {
      console.error('Failed to load zones:', error);
      this.toastService.show('Failed to load zones from backend.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectZone(zone: Zone): void {
    this.selectedZone.set(zone);
  }

  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value || '');
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.zoneForm.reset({ status: true });

    this.modalService.open(this.zoneModalTemplate, {
      title: 'Register New Zone',
      subtitle: 'Enter zone details and assign a leader',
      confirmLabel: 'Register Zone'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.zoneForm.value;
    this.syncModalConfirmState();
  }

  openEditModal(): void {
    const zone = this.selectedZone();
    if (!zone) return;

    this.modalMode.set('edit');
    this.zoneForm.patchValue({
      zone_code: zone.zone_code,
      zone_name: zone.zone_name,
      leader: zone.leader || '',
      status: zone.status
    });

    this.modalService.open(this.zoneModalTemplate, {
      title: 'Edit Zone Details',
      subtitle: 'Modify zone information',
      confirmLabel: 'Update Zone'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.zoneForm.value;
    this.syncModalConfirmState();
  }

  closeModal(): void {
    this.modalService.close();
  }

  async handleSubmit(): Promise<void> {
    if (this.zoneForm.invalid) return;

    this.modalService.setLoading(true);
    try {
      const input = {
        zone_code: this.zoneForm.value.zone_code,
        zone_name: this.zoneForm.value.zone_name,
        leader: this.zoneForm.value.leader || null,
        status: this.zoneForm.value.status ?? true
      };

      if (this.modalMode() === 'create') {
        await this.zoneService.create(input);
        this.toastService.show('Zone registered successfully!', 'success');
      } else {
        const id = this.selectedZone()?.id;
        if (id) {
          await this.zoneService.update(id, input);
          this.toastService.show('Zone updated successfully!', 'success');
        }
      }
      await this.loadZones();
      this.closeModal();
    } catch (error) {
      console.error('Operation failed', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  async deleteZone(id: string): Promise<void> {
    const zone = this.zones().find(z => z.id === id);
    if (!zone) return;

    this.zoneToDelete.set(zone);
    this.modalService.open(this.deleteModalTemplate, {
      title: 'Delete Zone',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      maxWidth: 'max-w-md'
    });
    this.modalService.onConfirm = () => this.confirmDeleteZone();
  }

  async confirmDeleteZone(): Promise<void> {
    const zone = this.zoneToDelete();
    if (!zone) return;

    this.modalService.setLoading(true);
    try {
      await this.zoneService.delete(zone.id);
      if (this.selectedZone()?.id === zone.id) {
        this.selectedZone.set(null);
      }
      await this.loadZones();
      this.toastService.show('Zone deleted successfully!', 'success');
      this.modalService.close();
    } catch (error) {
      console.error('Delete failed', error);
      this.toastService.show('Failed to delete zone.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }
}
