import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { ToastService } from '../../services/toast/toast.service';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';

// Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
    selector: 'app-blotter',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgIconComponent,
        ModalComponent,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './blotter.component.html',
    styleUrl: './blotter.component.css'
})
export class BlotterComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly gql = inject(GraphqlService);
    private readonly toastService = inject(ToastService);

    blotters = signal<any[]>([]);
    isLoading = signal(true);
    isSaving = signal(false);
    showForm = signal(false);
    isViewMode = signal(false);
    blotterToEdit = signal<any | null>(null);

    blotterForm!: FormGroup;

    ngOnInit() {
        this.initForm();
        this.loadBlotters();
    }

    initForm() {
        this.blotterForm = this.fb.group({
            case_number: ['', Validators.required],
            complainant_name: ['', Validators.required],
            respondent_name: ['', Validators.required],
            incident_date: ['', Validators.required],
            incident_location: ['', Validators.required],
            complaint_description: ['', Validators.required],
            status: ['Active'],
            resolution_details: ['']
        });
    }

    openNewIncident() {
        this.blotterToEdit.set(null);
        this.isViewMode.set(false);
        this.blotterForm.enable();
        this.blotterForm.reset({
            status: 'Active',
            case_number: this.generateCaseNumber()
        });
        this.blotterForm.get('case_number')?.disable();
        this.showForm.set(true);
    }

    generateCaseNumber(): string {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000); // Generates 4 random digits
        return `BL-${year}-${randomNum}`;
    }


    async loadBlotters() {
        this.isLoading.set(true);
        const query = `
      query {
        blotters(first: 100) {
          data { id case_number complainant_name respondent_name incident_date incident_location complaint_description status resolution_details created_at }
        }
      }
    `;
        try {
            const res = await this.gql.request<any>(query);
            this.blotters.set(res.blotters.data);
        } catch (e: any) {
            this.toastService.show(e.message || 'Error loading blotters', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }

    viewBlotter(blotter: any) {
        this.blotterToEdit.set(blotter);

        // Convert database string to native Date object for the material datepicker
        const dateObj = new Date(blotter.incident_date);

        this.blotterForm.patchValue({
            case_number: blotter.case_number,
            complainant_name: blotter.complainant_name,
            respondent_name: blotter.respondent_name,
            incident_date: dateObj,
            incident_location: blotter.incident_location,
            complaint_description: blotter.complaint_description,
            status: blotter.status,
            resolution_details: blotter.resolution_details
        });
        
        this.isViewMode.set(true);
        this.blotterForm.disable(); // Lock all fields for view mode
        this.showForm.set(true);
    }
    
    enableEditMode() {
        this.isViewMode.set(false);
        this.blotterForm.enable();
        this.blotterForm.get('case_number')?.disable(); // Keep case number locked
    }

    cancelForm() {
        this.showForm.set(false);
        this.blotterToEdit.set(null);
        this.blotterForm.reset({ status: 'Active' });
    }

    // Helper to format date for backend (Y-m-d H:i:s)
    formatDate(dateVal: any): string {
        if (!dateVal) return '';
        const date = new Date(dateVal);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // You can include the actual time if needed, but for simplicity we append 00:00:00 
        // to match the default behavior of the date picker.
        return `${year}-${month}-${day} 00:00:00`;
    }

    async saveBlotter() {
        if (this.blotterForm.invalid) {
            this.blotterForm.markAllAsTouched();
            return;
        }

        this.isSaving.set(true);
        // Use getRawValue() to include disabled fields like case_number
        const val = this.blotterForm.getRawValue();
        const isEdit = !!this.blotterToEdit();

        // Convert native Date object to 'Y-m-d H:i:s' string for backend
        const formattedDate = this.formatDate(val.incident_date);

        const input = {
            case_number: val.case_number,
            complainant_name: val.complainant_name,
            respondent_name: val.respondent_name,
            incident_date: formattedDate,
            incident_location: val.incident_location,
            complaint_description: val.complaint_description,
            ...(isEdit && { status: val.status, resolution_details: val.resolution_details, id: this.blotterToEdit().id })
        };

        const mutation = isEdit ? `
      mutation Update($input: UpdateBlotterInput!) {
        updateBlotter(input: $input) { id }
      }
    ` : `
      mutation Create($input: CreateBlotterInput!) {
        createBlotter(input: $input) { id }
      }
    `;

        try {
            await this.gql.request(mutation, { input });
            this.toastService.show(`Incident ${isEdit ? 'updated' : 'recorded'}!`, 'success');
            this.cancelForm();
            this.loadBlotters();
        } catch (e: any) {
            this.toastService.show(e.message, 'error');
        } finally {
            this.isSaving.set(false);
        }
    }
}
