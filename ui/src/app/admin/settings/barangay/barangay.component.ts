import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-barangay',
  standalone: true,
  imports: [CommonModule, NgIconComponent, ReactiveFormsModule],
  templateUrl: './barangay.component.html',
  styleUrl: './barangay.component.css',
})
export class BarangayComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  private readonly toastService = inject(ToastService);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false); // Manages read-only vs edit layout state
  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      barangay_name: ['', [Validators.required]],
      municipality: ['', [Validators.required]],
      province: ['', [Validators.required]],
      region: ['', [Validators.required]],
      zip_code: ['', [Validators.required]],
      contact_number: [''],
      email: ['', [Validators.email]],
      logo_path: [''],
      timezone: ['Asia/Manila', [Validators.required]],
      date_format: ['MM/DD/YYYY', [Validators.required]],
    });
  }

  toggleEditMode(): void {
    this.isEditMode.set(!this.isEditMode());
  }

  cancelEdit(): void {
    this.loadSettings(); // Reload last saved data from db
    this.isEditMode.set(false);
  }

  async loadSettings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.gql.requestFromFile<{ barangaySetting: any }>(
        'settings',
        'barangay-setting.gql'
      );
      if (response && response.barangaySetting) {
        this.settingsForm.patchValue({
          barangay_name: response.barangaySetting.barangay_name || '',
          municipality: response.barangaySetting.municipality || '',
          province: response.barangaySetting.province || '',
          region: response.barangaySetting.region || '',
          zip_code: response.barangaySetting.zip_code || '',
          contact_number: response.barangaySetting.contact_number || '',
          email: response.barangaySetting.email || '',
          logo_path: response.barangaySetting.logo_path || '',
          timezone: response.barangaySetting.timezone || 'Asia/Manila',
          date_format: response.barangaySetting.date_format || 'MM/DD/YYYY',
        });
      }
    } catch (error: any) {
      console.error('Failed to load settings:', error);
      this.toastService.show(error.message || 'Failed to load Barangay settings.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.toastService.show('Please fill in all required fields correctly.', 'error');
      return;
    }

    this.isSaving.set(true);
    try {
      const input = {
        barangay_name: this.settingsForm.value.barangay_name,
        municipality: this.settingsForm.value.municipality,
        province: this.settingsForm.value.province,
        region: this.settingsForm.value.region,
        zip_code: this.settingsForm.value.zip_code,
        contact_number: this.settingsForm.value.contact_number || null,
        email: this.settingsForm.value.email || null,
        logo_path: this.settingsForm.value.logo_path || null,
        timezone: this.settingsForm.value.timezone,
        date_format: this.settingsForm.value.date_format,
      };

      await this.gql.requestFromFile<any>(
        'settings',
        'update-barangay-setting.gql',
        { input }
      );
      this.toastService.show('Barangay settings saved successfully!', 'success');
      this.isEditMode.set(false); // Switch back to read-only view state after saving
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      this.toastService.show(error.message || 'Failed to save settings.', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }
}
