import { Component, OnInit, inject, signal, afterRenderEffect, computed, viewChild, viewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../../services/graphql/graphql.service';
import { ToastService } from '../../../services/toast/toast.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map, of } from 'rxjs';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-barangay',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    HasPermissionDirective,
    ModalComponent
  ],
  templateUrl: './barangay.component.html',
  styleUrl: './barangay.component.css',
})
export class BarangayComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  private readonly toastService = inject(ToastService);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false); // Controls edit view state if settings exist
  hasSettings = signal(false); // Tracks if settings exist in database
  isCreating = signal(false); // Tracks if we are in active creation form mode
  isResetModalOpen = signal(false);

  settingsForm!: FormGroup;

  regions = [
    { name: 'National Capital Region (NCR)', value: 'NCR' },
    { name: 'Cordillera Administrative Region (CAR)', value: 'CAR' },
    { name: 'Ilocos Region (Region I)', value: 'Region I' },
    { name: 'Cagayan Valley (Region II)', value: 'Region II' },
    { name: 'Central Luzon (Region III)', value: 'Region III' },
    { name: 'CALABARZON (Region IV-A)', value: 'Region IV-A' },
    { name: 'MIMAROPA (Region IV-B)', value: 'Region IV-B' },
    { name: 'Bicol Region (Region V)', value: 'Region V' },
    { name: 'Western Visayas (Region VI)', value: 'Region VI' },
    { name: 'Central Visayas (Region VII)', value: 'Region VII' },
    { name: 'Eastern Visayas (Region VIII)', value: 'Region VIII' },
    { name: 'Zamboanga Peninsula (Region IX)', value: 'Region IX' },
    { name: 'Northern Mindanao (Region X)', value: 'Region X' },
    { name: 'Davao Region (Region XI)', value: 'Region XI' },
    { name: 'Soccsksargen (Region XII)', value: 'Region XII' },
    { name: 'Caraga Region (Region XIII)', value: 'Region XIII' },
    { name: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)', value: 'BARMM' }
  ];
  timezones = [
    { name: 'Asia/Manila (UTC+8)', value: 'Asia/Manila' },
    { name: 'Asia/Singapore (UTC+8)', value: 'Asia/Singapore' },
    { name: 'Asia/Tokyo (UTC+9)', value: 'Asia/Tokyo' },
    { name: 'UTC (UTC+0)', value: 'UTC' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  displayRegionFn = (regionValue: string): string => {
    if (!regionValue) return '';
    const matched = this.regions.find(r => r.value === regionValue);
    return matched ? matched.name : regionValue;
  };
  displayTimezoneFn = (tzValue: string): string => {
    if (!tzValue) return '';
    const matched = this.timezones.find(t => t.value === tzValue);
    return matched ? matched.name : tzValue;
  };

  toggleTimezonePanel(event: Event, trigger: any) {
    event.stopPropagation();
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
  }

  toggleRegionPanel(event: Event, trigger: any) {
    event.stopPropagation();
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
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

  setUpProfile(): void {
    this.isCreating.set(true);
    this.settingsForm.reset({
      timezone: 'Asia/Manila',
      date_format: 'MM/DD/YYYY'
    });
  }

  cancelCreate(): void {
    this.isCreating.set(false);
    this.settingsForm.reset({
      timezone: 'Asia/Manila',
      date_format: 'MM/DD/YYYY'
    });
  }

  async loadSettings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.gql.requestFromFile<{ barangaySetting: any }>(
        'settings',
        'barangay-setting.gql'
      );
      if (response && response.barangaySetting) {
        this.hasSettings.set(true);
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
      } else {
        this.hasSettings.set(false);
        this.settingsForm.reset({
          timezone: 'Asia/Manila',
          date_format: 'MM/DD/YYYY'
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

      if (this.hasSettings()) {
        await this.gql.requestFromFile<any>(
          'settings',
          'update-barangay-setting.gql',
          { input }
        );
        this.toastService.show('Barangay settings updated successfully!', 'success');
        this.isEditMode.set(false);
      } else {
        await this.gql.requestFromFile<any>(
          'settings',
          'create-barangay-setting.gql',
          { input }
        );
        this.toastService.show('Barangay settings created successfully!', 'success');
        this.hasSettings.set(true);
        this.isCreating.set(false);
      }
      await this.loadSettings();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      this.toastService.show(error.message || 'Failed to save settings.', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  // Rename from resetSettings() to confirmReset()
  async confirmReset(): Promise<void> {
    // We removed the native confirm() check here!

    this.isResetModalOpen.set(false); // Close the modal immediately
    this.isLoading.set(true);
    try {
      await this.gql.requestFromFile<any>(
        'settings',
        'delete-barangay-setting.gql'
      );
      this.toastService.show('Barangay settings reset successfully!', 'success');
      this.hasSettings.set(false);
      this.isCreating.set(false);
      this.isEditMode.set(false);
      this.settingsForm.reset({
        timezone: 'Asia/Manila',
        date_format: 'MM/DD/YYYY'
      });
    } catch (error: any) {
      console.error('Failed to reset settings:', error);
      this.toastService.show(error.message || 'Failed to reset settings.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
}
