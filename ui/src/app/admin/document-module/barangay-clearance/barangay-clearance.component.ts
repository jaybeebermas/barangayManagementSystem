import { Component, OnInit, signal, inject, ViewChild, TemplateRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { ModalService } from '../../../services/modal/modal.service';
import { ToastService } from '../../../services/toast/toast.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ConfirmDeleteComponent } from '../../../shared/components/ui/confirm-delete/confirm-delete.component';
import { DrawerComponent } from '../../../shared/components/ui/drawer/drawer.component';
import { BarangayClearanceService } from '../../../services/barangay-clearance/barangay-clearance.service';
import { BarangayClearance } from '../../../services/barangay-clearance/barangay-clearance.types';
import { ResidentProfileService } from '../../../services/resident-profile/resident-profile.service';
import { ResidentProfile } from '../../../services/resident-profile/resident-profile.types';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { TablePaginationComponent } from '../../../shared/components/ui/user-management/table-pagination.component';

// Angular Material Imports
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-barangay-clearance',
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
    MatDatepickerModule,
    TablePaginationComponent
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './barangay-clearance.component.html',
  styleUrl: './barangay-clearance.component.css'
})
export class BarangayClearanceComponent implements OnInit {
  @ViewChild('clearanceModal') clearanceModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;

  clearanceToDelete = signal<BarangayClearance | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly clearanceService = inject(BarangayClearanceService);
  private readonly residentService = inject(ResidentProfileService);
  private readonly gql = inject(GraphqlService);
  public readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  clearances = signal<BarangayClearance[]>([]);
  residents = signal<ResidentProfile[]>([]);

  searchTerm = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  isLoading = signal(false);
  isPdfLoading = signal<string | null>(null);
  isDrawerOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedClearanceId = signal<string | null>(null);
  selectedViewClearance = signal<BarangayClearance | null>(null);
  originalFormValue: any = null;

  clearanceForm: FormGroup;

  filteredClearances = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const statusVal = this.selectedStatus().toLowerCase();

    return this.clearances().filter(c => {
      const residentName = `${c.resident?.first_name || ''} ${c.resident?.last_name || ''}`.toLowerCase();
      const nameMatch = !term ||
        residentName.includes(term) ||
        c.clearance_number.toLowerCase().includes(term) ||
        c.purpose.toLowerCase().includes(term);
      const statusMatch = !statusVal || c.status.toLowerCase() === statusVal;

      return nameMatch && statusMatch;
    });
  });

  paginatedClearances = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredClearances().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredClearances().length / this.pageSize()) || 1;
  });

  constructor() {
    this.clearanceForm = this.fb.group({
      resident_id: [null, [Validators.required]],
      purpose: ['', [Validators.required]],
      issued_on: ['', [Validators.required]],
      valid_until: ['', [Validators.required]],
      status: ['pending', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadClearances();
    this.loadResidents();

    this.clearanceForm.valueChanges.subscribe(() => {
      this.syncModalConfirmState();
    });
  }

  async loadClearances(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.clearanceService.getAll();
      this.clearances.set(data || []);
    } catch (error) {
      console.error('Failed to load clearances:', error);
      this.toastService.show('Failed to load barangay clearances.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadResidents(): Promise<void> {
    try {
      const data = await this.residentService.getAll();
      this.residents.set(data || []);
    } catch (error) {
      console.error('Failed to load residents:', error);
    }
  }

  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value || '');
    this.currentPage.set(1);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'released': return 'bg-emerald-100 text-emerald-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-zinc-200/50 text-zinc-500';
    }
  }

  getResidentFullName(clearance: BarangayClearance): string {
    if (clearance.resident) {
      return `${clearance.resident.first_name} ${clearance.resident.last_name}`;
    }
    return 'N/A';
  }

  getIssuerName(clearance: BarangayClearance): string {
    if (clearance.issuer) {
      return `${clearance.issuer.first_name} ${clearance.issuer.last_name}`;
    }
    return 'N/A';
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateVal: any): string {
    if (!dateVal) return 'N/A';
    const date = new Date(dateVal);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasChanges(): boolean {
    if (!this.originalFormValue) return false;
    const current = this.clearanceForm.value;
    const original = this.originalFormValue;

    for (const key of Object.keys(current)) {
      const curVal = current[key];
      const origVal = original[key];
      if (key === 'issued_on' || key === 'valid_until') {
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
    const isFormInvalid = this.clearanceForm.invalid;
    const hasNoChanges = !this.hasChanges();
    this.modalService.setConfirmDisabled(isFormInvalid || hasNoChanges);
  }

  // ─── ADD ────────────────────────────────
  openAddModal(): void {
    this.modalMode.set('add');
    this.clearanceForm.enable();
    this.clearanceForm.reset({
      resident_id: null,
      purpose: '',
      issued_on: new Date(),
      valid_until: '',
      status: 'pending'
    });

    this.modalService.open(this.clearanceModalTemplate, {
      title: 'Issue New Barangay Clearance',
      subtitle: 'Create a clearance record for a resident',
      confirmLabel: 'Issue Clearance'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.clearanceForm.value;
    this.syncModalConfirmState();
    this.isDrawerOpen.set(false);
  }

  // ─── EDIT ───────────────────────────────
  openEditModal(clearance: BarangayClearance): void {
    this.modalMode.set('edit');
    this.selectedClearanceId.set(clearance.id);
    this.clearanceForm.reset({
      resident_id: clearance.resident_id,
      purpose: clearance.purpose,
      issued_on: clearance.issued_on ? new Date(clearance.issued_on) : null,
      valid_until: clearance.valid_until ? new Date(clearance.valid_until) : null,
      status: clearance.status
    });

    // Disable fields that should not be edited
    this.clearanceForm.get('resident_id')?.disable();
    this.clearanceForm.get('issued_on')?.disable();

    this.modalService.open(this.clearanceModalTemplate, {
      title: 'Edit Barangay Clearance',
      subtitle: `Clearance No: ${clearance.clearance_number}`,
      confirmLabel: 'Update Clearance'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
    this.originalFormValue = this.clearanceForm.getRawValue();
    this.syncModalConfirmState();
    this.isDrawerOpen.set(false);
  }

  // ─── VIEW ───────────────────────────────
  openViewDrawer(clearance: BarangayClearance): void {
    this.selectedViewClearance.set(clearance);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedViewClearance.set(null);
  }

  closeModal(): void {
    this.isDrawerOpen.set(false);
    this.modalService.close();
    this.clearanceForm.enable();
    this.selectedClearanceId.set(null);
    this.selectedViewClearance.set(null);
  }

  // ─── SUBMIT ─────────────────────────────
  async handleSubmit(): Promise<void> {
    if (this.clearanceForm.invalid) return;

    this.modalService.setLoading(true);
    try {
      const formVal = this.clearanceForm.getRawValue();

      if (this.modalMode() === 'add') {
        await this.clearanceService.create({
          resident_id: formVal.resident_id,
          purpose: formVal.purpose,
          issued_on: this.formatDate(formVal.issued_on),
          valid_until: this.formatDate(formVal.valid_until),
          status: formVal.status
        });
        this.toastService.show('Barangay clearance issued successfully!', 'success');
      } else {
        const id = this.selectedClearanceId();
        if (id) {
          await this.clearanceService.update({
            id,
            purpose: formVal.purpose,
            valid_until: this.formatDate(formVal.valid_until),
            status: formVal.status
          });
          this.toastService.show('Barangay clearance updated successfully!', 'success');
        }
      }
      await this.loadClearances();
      this.closeModal();
    } catch (error) {
      console.error('Operation failed:', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  // ─── DELETE ─────────────────────────────
  async deleteClearance(id: string): Promise<void> {
    const clearance = this.clearances().find(c => c.id === id);
    if (!clearance) return;

    this.clearanceToDelete.set(clearance);
    this.modalService.open(this.deleteModalTemplate, {
      title: 'Delete Barangay Clearance',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      maxWidth: 'max-w-md'
    });
    this.modalService.onConfirm = () => this.confirmDelete();
  }

  async confirmDelete(): Promise<void> {
    const clearance = this.clearanceToDelete();
    if (!clearance) return;

    this.modalService.setLoading(true);
    try {
      await this.clearanceService.delete(clearance.id);
      await this.loadClearances();
      this.toastService.show('Barangay clearance deleted successfully!', 'success');
      this.modalService.close();
    } catch (error) {
      console.error('Delete failed:', error);
      this.toastService.show('Failed to delete clearance.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  private getRelativeUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        return new URL(url).pathname;
      } catch (e) {
        console.error('Failed to parse URL:', e);
      }
    }
    return url;
  }

  // ─── PDF GENERATION ─────────────────────
  async generatePdf(clearance: BarangayClearance): Promise<void> {
    this.isPdfLoading.set(clearance.id);
    try {
      const absoluteUrl = await this.clearanceService.generatePdf(clearance.id);
      const url = this.getRelativeUrl(absoluteUrl);
      
      // Force download via Blob to prevent opening in a new tab
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch PDF failed with status:', response.status, errorText);
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `clearance_${clearance.clearance_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      this.toastService.show('PDF generated and downloaded successfully!', 'success');
      this.closeDrawer(); // Auto close the preview/drawer
    } catch (error) {
      console.error('PDF generation failed:', error);
      this.toastService.show('Failed to generate PDF.', 'error');
    } finally {
      this.isPdfLoading.set(null);
    }
  }

  // ─── PRINT ──────────────────────────────
  async printClearance(clearance: BarangayClearance): Promise<void> {
    this.isPdfLoading.set(clearance.id);
    try {
      const absoluteUrl = await this.clearanceService.generatePdf(clearance.id);
      const url = this.getRelativeUrl(absoluteUrl);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
      this.toastService.show('Print job initiated!', 'success');
    } catch (error) {
      console.error('Print failed:', error);
      this.toastService.show('Failed to print clearance.', 'error');
    } finally {
      this.isPdfLoading.set(null);
    }
  }
}
