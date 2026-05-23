import { Component, OnInit, signal, inject, ViewChild, TemplateRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { ModalService } from '../../../services/modal/modal.service';
import { ToastService } from '../../../services/toast/toast.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ConfirmDeleteComponent } from '../../../shared/components/ui/confirm-delete/confirm-delete.component';
import { DrawerComponent } from '../../../shared/components/ui/drawer/drawer.component';
import { ResidentProfileService } from '../../../services/resident-profile/resident-profile.service';
import { ResidentProfile } from '../../../services/resident-profile/resident-profile.types';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { GET_ZONES } from '../../../services/zone/zone.gql';
import { Zone } from '../../../services/zone/zone.types';

// Angular Material Imports
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-resident-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    HasPermissionDirective,
    ConfirmDeleteComponent,
    DrawerComponent,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './resident-profile.component.html',
  styleUrl: './resident-profile.component.css'
})
export class ResidentProfileComponent implements OnInit {
  @ViewChild('residentModal') residentModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;

  residentToDelete = signal<ResidentProfile | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly residentService = inject(ResidentProfileService);
  private readonly gql = inject(GraphqlService);
  public readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  residents = signal<ResidentProfile[]>([]);
  zones = signal<Zone[]>([]);
  
  searchTerm = signal('');
  selectedZoneId = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  isLoading = signal(false);
  isDrawerOpen = signal(false);
  modalMode = signal<'add' | 'edit' | 'view'>('add');
  residentForm: FormGroup;
  selectedResidentId = signal<string | null>(null);
  originalFormValue: any = null;

  filteredResidents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const zoneId = this.selectedZoneId();
    const statusVal = this.selectedStatus().toLowerCase();

    return this.residents().filter(r => {
      const nameMatch = !term || 
        r.first_name.toLowerCase().includes(term) || 
        r.last_name.toLowerCase().includes(term);
      const zoneMatch = !zoneId || r.zone_id === zoneId;
      const statusMatch = !statusVal || r.status.toLowerCase() === statusVal;

      return nameMatch && zoneMatch && statusMatch;
    });
  });

  paginatedResidents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredResidents().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredResidents().length / this.pageSize()) || 1;
  });

  constructor() {
    this.residentForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      birthdate: ['', [Validators.required]],
      age: [0],
      email: ['', [Validators.email]],
      status: ['Active', [Validators.required]],
      zone_id: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadResidents();
    this.loadZones();
    
    this.residentForm.valueChanges.subscribe(() => {
      this.syncModalConfirmState();
    });
  }

  async loadZones(): Promise<void> {
    try {
      const response = await this.gql.request<{ zones: Zone[] }>(GET_ZONES);
      this.zones.set(response.zones || []);
    } catch (error) {
      console.error('Failed to load zones:', error);
    }
  }

  async loadResidents(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.residentService.getAll();
      this.residents.set(data || []);
    } catch (error) {
      console.error('Failed to load residents:', error);
      this.toastService.show('Failed to load resident profiles.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value || '');
    this.currentPage.set(1);
  }

  handlePageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value) || 10);
    this.currentPage.set(1);
  }

  getPaginationRangeText(): string {
    const total = this.filteredResidents().length;
    if (total === 0) return '0-0 of 0';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return `${start}-${end} of ${total}`;
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  hasChanges(): boolean {
    if (!this.originalFormValue) return false;
    const current = this.residentForm.value;
    const original = this.originalFormValue;
    
    // Custom check handling native Date differences
    for (const key of Object.keys(current)) {
      const curVal = current[key];
      const origVal = original[key];
      if (key === 'birthdate') {
        const curDate = curVal ? new Date(curVal).getTime() : 0;
        const origDate = origVal ? new Date(origVal).getTime() : 0;
        if (curDate !== origDate) return true;
        continue;
      }
      if (curVal !== origVal) return true;
    }
    return false;
  }

  syncModalConfirmState(): void {
    const isFormInvalid = this.residentForm.invalid;
    const hasNoChanges = !this.hasChanges();
    this.modalService.setConfirmDisabled(isFormInvalid || hasNoChanges);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.residentForm.enable();
    this.residentForm.reset({
      status: 'Active',
      zone_id: null,
      age: 0
    });

    this.modalService.open(this.residentModalTemplate, {
      title: 'Add New Resident Profile',
      subtitle: 'Resident Personal Information',
      confirmLabel: 'Register Resident'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.residentForm.value;
    this.syncModalConfirmState();
    this.isDrawerOpen.set(false);
  }

  openEditModal(resident: ResidentProfile): void {
    this.modalMode.set('edit');
    this.residentForm.enable();
    this.selectedResidentId.set(resident.id);
    this.residentForm.patchValue({
      first_name: resident.first_name,
      last_name: resident.last_name,
      birthdate: resident.birthdate ? new Date(resident.birthdate) : null,
      age: resident.age,
      email: resident.email,
      status: resident.status,
      zone_id: resident.zone_id
    });

    this.modalService.open(this.residentModalTemplate, {
      title: 'Edit Resident Profile',
      subtitle: 'Modify resident details',
      confirmLabel: 'Update Profile'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.residentForm.value;
    this.syncModalConfirmState();
    this.isDrawerOpen.set(false);
  }

  openViewModal(resident: ResidentProfile): void {
    this.modalMode.set('view');
    this.residentForm.patchValue({
      first_name: resident.first_name,
      last_name: resident.last_name,
      birthdate: resident.birthdate ? new Date(resident.birthdate) : null,
      age: resident.age,
      email: resident.email,
      status: resident.status,
      zone_id: resident.zone_id
    });
    this.residentForm.disable();
    this.isDrawerOpen.set(true);
  }

  closeModal(): void {
    this.isDrawerOpen.set(false);
    this.modalService.close();
    this.residentForm.enable();
    this.selectedResidentId.set(null);
  }

  calculateAgeFromBirthdate(): void {
    const birthdateValue = this.residentForm.get('birthdate')?.value;
    if (birthdateValue) {
      const birthdate = new Date(birthdateValue);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
      }
      this.residentForm.get('age')?.setValue(age >= 0 ? age : 0);
    }
  }

  getZoneNameById(id: string): string {
    const zone = this.zones().find(z => z.id === id);
    return zone ? zone.zone_name : 'N/A';
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async handleSubmit(): Promise<void> {
    if (this.residentForm.invalid) return;

    this.modalService.setLoading(true);
    try {
      const formVal = this.residentForm.value;
      const zoneIdValue = formVal.zone_id === 'null' || !formVal.zone_id ? null : formVal.zone_id;

      if (this.modalMode() === 'add') {
        await this.residentService.create({
          first_name: formVal.first_name,
          last_name: formVal.last_name,
          birthdate: this.formatDate(formVal.birthdate),
          age: formVal.age,
          email: formVal.email || null,
          status: formVal.status,
          zone_id: zoneIdValue
        });
        this.toastService.show('Resident profile registered successfully!', 'success');
      } else {
        const id = this.selectedResidentId();
        if (id) {
          await this.residentService.update({
            id,
            first_name: formVal.first_name,
            last_name: formVal.last_name,
            birthdate: this.formatDate(formVal.birthdate),
            age: formVal.age,
            email: formVal.email || null,
            status: formVal.status,
            zone_id: zoneIdValue
          });
          this.toastService.show('Resident profile updated successfully!', 'success');
        }
      }
      await this.loadResidents();
      this.closeModal();
    } catch (error) {
      console.error('Operation failed:', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  async deleteResident(id: string): Promise<void> {
    const resident = this.residents().find(r => r.id === id);
    if (!resident) return;

    this.residentToDelete.set(resident);
    this.modalService.open(this.deleteModalTemplate, {
      title: 'Delete Resident Profile',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      maxWidth: 'max-w-md'
    });
    this.modalService.onConfirm = () => this.confirmDeleteResident();
  }

  async confirmDeleteResident(): Promise<void> {
    const resident = this.residentToDelete();
    if (!resident) return;

    this.modalService.setLoading(true);
    try {
      await this.residentService.delete(resident.id);
      await this.loadResidents();
      this.toastService.show('Resident profile deleted successfully!', 'success');
      this.modalService.close();
    } catch (error) {
      console.error('Delete failed:', error);
      this.toastService.show('Failed to delete resident profile.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }
}
