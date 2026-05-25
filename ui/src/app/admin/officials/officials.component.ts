import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { ToastService } from '../../services/toast/toast.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-officials',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    HasPermissionDirective,
    ModalComponent,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  templateUrl: './officials.component.html',
  styleUrl: './officials.component.css',
  providers: [provideNativeDateAdapter()]
})
export class OfficialsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  private readonly toastService = inject(ToastService);

  activeTab = signal<'BARANGAY' | 'SK'>('BARANGAY');
  officials = signal<any[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  isDeleting = signal(false);
  showForm = signal(false);

  isDeleteModalOpen = signal(false);
  officialToDelete = signal<string | null>(null);
  officialToEdit = signal<any | null>(null);

  officialForm!: FormGroup;

  barangayPositions = ['Barangay Captain', 'Councilor (Kagawad)', 'Secretary', 'Treasurer'];
  skPositions = ['SK Chairperson', 'SK Councilor', 'SK Secretary', 'SK Treasurer'];

  ngOnInit(): void {
    this.initForm();
    this.loadOfficials();
  }

  private initForm(): void {
    this.officialForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      email: ['', [Validators.email]],
      contact_number: [''],
      term_start: [''],
      term_end: [''],
      status: [true, Validators.required]
    });
  }

  setTab(tab: 'BARANGAY' | 'SK'): void {
    this.activeTab.set(tab);
    this.cancelForm();
    this.loadOfficials();
  }

  getAvailablePositions(): string[] {
    return this.activeTab() === 'BARANGAY' ? this.barangayPositions : this.skPositions;
  }

  async loadOfficials(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await this.gql.requestFromFile<any>(
        'officials',
        'get-officials.gql',
        { type: this.activeTab() }
      );
      this.officials.set(res.officials || []);
    } catch (err: any) {
      this.toastService.show(err.message || 'Failed to load officials', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  editOfficial(official: any): void {
    this.officialToEdit.set(official);
    this.officialForm.patchValue({
      name: official.name,
      position: official.position,
      email: official.email,
      contact_number: official.contact_number,
      term_start: official.term_start ? new Date(official.term_start) : null,
      term_end: official.term_end ? new Date(official.term_end) : null,
      status: official.status
    });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.officialToEdit.set(null);
    this.officialForm.reset({ status: true });
  }

  private formatDate(dateVal: any): string | null {
    if (!dateVal) return null;
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async saveOfficial(): Promise<void> {
    if (this.officialForm.invalid) {
      this.officialForm.markAllAsTouched();
      return;
    }

    const formVal = this.officialForm.value;
    const editId = this.officialToEdit()?.id;

    const input = {
      name: formVal.name,
      position: formVal.position,
      type: this.activeTab(),
      email: formVal.email || null,
      contact_number: formVal.contact_number || null,
      term_start: this.formatDate(formVal.term_start),
      term_end: this.formatDate(formVal.term_end),
      status: formVal.status
    };

    this.isSaving.set(true);
    try {
      if (editId) {
        await this.gql.requestFromFile<any>('officials', 'update-official.gql', {
          input: { id: editId, ...input }
        });
        this.toastService.show('Official profile updated successfully!', 'success');
      } else {
        await this.gql.requestFromFile<any>('officials', 'create-official.gql', {
          input
        });
        this.toastService.show('Official registered successfully!', 'success');
      }
      this.showForm.set(false);
      this.officialToEdit.set(null);
      this.officialForm.reset({ status: true });
      this.loadOfficials();
    } catch (err: any) {
      this.toastService.show(err.message || 'Failed to save official profile', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  openDeleteModal(id: string): void {
    this.officialToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const id = this.officialToDelete();
    if (!id) return;

    this.isDeleting.set(true);
    try {
      await this.gql.requestFromFile<any>('officials', 'delete-official.gql', { id });
      this.toastService.show('Official record deleted!', 'success');
      this.isDeleteModalOpen.set(false);
      this.loadOfficials();
    } catch (err: any) {
      this.toastService.show('Failed to delete official profile', 'error');
    } finally {
      this.isDeleting.set(false);
      this.officialToDelete.set(null);
    }
  }
}
