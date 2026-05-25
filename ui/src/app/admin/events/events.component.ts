import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { ToastService } from '../../services/toast/toast.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ModalComponent } from '../../shared/components/ui/modal/modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ZoneService } from '../../services/zone/zone.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgIconComponent, HasPermissionDirective, ModalComponent, MatAutocompleteModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatDatepickerModule],
    templateUrl: './events.component.html',
    styleUrl: './events.component.css',
    providers: [provideNativeDateAdapter()],
})
export class EventsComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly gql = inject(GraphqlService);
    private readonly toastService = inject(ToastService);
    private readonly zoneService = inject(ZoneService);

    events = signal<any[]>([]);
    zones = signal<any[]>([]);
    isLoading = signal(true);
    isSaving = signal(false);
    isDeleting = signal(false);
    showForm = signal(false);
    isDeleteModalOpen = signal(false);
    eventToDelete = signal<string | null>(null);
    eventToEdit = signal<any | null>(null);

    eventForm!: FormGroup;

    statuses = [
        { name: 'Draft', value: 'DRAFT' },
        { name: 'Published', value: 'PUBLISHED' },
        { name: 'Cancelled', value: 'CANCELLED' }
    ];

    displayStatusFn = (statusValue: string): string => {
        if (!statusValue) return '';
        const matched = this.statuses.find(s => s.value === statusValue);
        return matched ? matched.name : statusValue;
    };

    toggleStatusPanel(event: Event, trigger: any) {
        event.stopPropagation();
        if (trigger.panelOpen) {
            trigger.closePanel();
        } else {
            trigger.openPanel();
        }
    }

    displayZoneFn = (zoneId: string): string => {
        if (!zoneId) return '';
        const matched = this.zones().find(z => z.id === zoneId);
        return matched ? matched.zone_name : zoneId;
    };

    toggleZonePanel(event: Event, trigger: any) {
        event.stopPropagation();
        if (trigger.panelOpen) {
            trigger.closePanel();
        } else {
            trigger.openPanel();
        }
    }

    ngOnInit(): void {
        this.initForm();
        this.loadEvents();
        this.loadZones();
    }

    // Add this date formatter inside the class
    formatDate(dateVal: any): string {
        if (!dateVal) return '';
        const date = new Date(dateVal);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`;
    }

    private initForm(): void {
        this.eventForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            start_date: ['', Validators.required], // Retained as the single Date field
            location: [''],
            zone_id: ['', Validators.required],
            status: ['PUBLISHED', Validators.required]
        });
    }


    async loadZones() {
        try {
            const zonesList = await this.zoneService.getAll();
            this.zones.set(zonesList || []);
        } catch (err: any) {
            this.toastService.show('Failed to load zones', 'error');
        }
    }

    async loadEvents() {
        this.isLoading.set(true);
        try {
            const res = await this.gql.requestFromFile<any>('event', 'get-events.gql', { first: 100 });
            this.events.set(res.events.data);
        } catch (err: any) {
            this.toastService.show(err.message || 'Failed to load events', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }

    editEvent(event: any) {
        this.eventToEdit.set(event);
        this.eventForm.patchValue({
            title: event.title,
            description: event.description,
            // Convert database string to native Date object for the datepicker
            start_date: event.start_date ? new Date(event.start_date) : null,
            location: event.location,
            zone_id: event.zone_id ? String(event.zone_id) : '',
            status: event.status
        });
        this.showForm.set(true);
    }

    cancelForm() {
        this.showForm.set(false);
        this.eventToEdit.set(null);
        this.eventForm.reset({ status: 'PUBLISHED', zone_id: '' });
    }

    async saveEvent() {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            return;
        }

        const formVal = this.eventForm.value;
        const formattedDate = this.formatDate(formVal.start_date);
        const editId = this.eventToEdit()?.id;

        // Construct input payload mapping start_date value to both columns
        const input = {
            title: formVal.title,
            description: formVal.description,
            start_date: formattedDate,
            end_date: formattedDate, // Both start and end columns get the same date
            zone_id: formVal.zone_id,
            location: formVal.location,
            status: formVal.status
        };

        this.isSaving.set(true);
        try {
            if (editId) {
                await this.gql.requestFromFile<any>('event', 'update-event.gql', {
                    input: { id: editId, ...input }
                });
                this.toastService.show('Event updated successfully!', 'success');
            } else {
                await this.gql.requestFromFile<any>('event', 'create-event.gql', {
                    input
                });
                this.toastService.show('Event created successfully!', 'success');
            }
            this.showForm.set(false);
            this.eventToEdit.set(null);
            this.eventForm.reset({ status: 'PUBLISHED', zone_id: '' });
            await this.loadEvents();
        } catch (err: any) {
            this.toastService.show(err.message || 'Failed to save event', 'error');
        } finally {
            this.isSaving.set(false);
        }
    }

    openDeleteModal(id: string) {
        this.eventToDelete.set(id);
        this.isDeleteModalOpen.set(true);
    }

    async confirmDelete() {
        const id = this.eventToDelete();
        if (!id) return;

        this.isDeleting.set(true);
        try {
            await this.gql.requestFromFile<any>('event', 'delete-event.gql', { id });
            this.toastService.show('Event deleted!', 'success');
            this.isDeleteModalOpen.set(false);
            await this.loadEvents();
        } catch (err: any) {
            this.toastService.show('Failed to delete event', 'error');
        } finally {
            this.isDeleting.set(false);
            this.eventToDelete.set(null);
        }
    }

}
