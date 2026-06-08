import { Component, OnInit, signal, inject, ViewChild, TemplateRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { FooterService } from '../../services/footer/footer.service';
import { Footer } from '../../services/footer/footer.types';
import { ToastService } from '../../services/toast/toast.service';
import { ModalService } from '../../services/modal/modal.service';
import { DrawerComponent } from '../../shared/components/ui/drawer/drawer.component';
import { ConfirmDeleteComponent } from '../../shared/components/ui/confirm-delete/confirm-delete.component';
import { TablePaginationComponent } from '../../shared/components/ui/user-management/table-pagination.component';
import { UserManagementLayoutComponent } from '../../shared/components/ui/user-management/user-management-layout.component';
import { PageHeaderComponent } from '../../shared/components/ui/user-management/page-header.component';
import { SearchFiltersComponent } from '../../shared/components/ui/user-management/search-filters.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent } from '@ng-icons/core';

@Component({
    selector: 'app-footer-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        UserManagementLayoutComponent,
        PageHeaderComponent,
        SearchFiltersComponent,
        TablePaginationComponent,
        DrawerComponent,
        ConfirmDeleteComponent,
        HasPermissionDirective,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgIconComponent
    ],
    templateUrl: './footer.component.html'
})
export class FooterManagementComponent implements OnInit {
    @ViewChild('footerModal') footerModalTemplate!: TemplateRef<any>;
    @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;

    private readonly fb = inject(FormBuilder);
    private readonly footerService = inject(FooterService);
    private readonly toastService = inject(ToastService);
    public readonly modalService = inject(ModalService);

    footers = signal<Footer[]>([]);
    searchTerm = signal('');
    currentPage = signal(1);
    pageSize = signal(10);
    isLoading = signal(false);
    isDrawerOpen = signal(false);
    modalMode = signal<'add' | 'edit' | 'view'>('add');
    footerForm: FormGroup;
    selectedFooterId = signal<string | null>(null);
    footerToDelete = signal<Footer | null>(null);

    filteredFooters = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.footers();
        return this.footers().filter(f =>
            f.name.toLowerCase().includes(term) ||
            f.copyright?.toLowerCase().includes(term)
        );
    });

    paginatedFooters = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.filteredFooters().slice(start, end);
    });

    constructor() {
        this.footerForm = this.fb.group({
            name: ['', [Validators.required]],
            copyright: [''],
            address: [''],
            phone: [''],
            email: ['', [Validators.email]],
            status: [true]
        });
    }

    ngOnInit(): void {
        this.loadFooters();
    }

    async loadFooters(): Promise<void> {
        this.isLoading.set(true);
        try {
            const data = await this.footerService.getAll();
            this.footers.set(data);
        } catch (e) {
            console.error(e);
            this.toastService.show('Failed to load footer records.', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }

    openAddModal(): void {
        this.modalMode.set('add');
        this.footerForm.reset({ status: true });
        this.footerForm.enable();

        this.modalService.open(this.footerModalTemplate, {
            title: 'Add New Footer Configuration',
            subtitle: 'Details and Metadata',
            confirmLabel: 'Save Footer'
        });
        this.modalService.onConfirm = () => this.handleSubmit();
    }

    openEditModal(footer: Footer): void {
        this.modalMode.set('edit');
        this.selectedFooterId.set(footer.id);
        this.footerForm.patchValue(footer);
        this.footerForm.enable();

        this.modalService.open(this.footerModalTemplate, {
            title: 'Edit Footer Details',
            subtitle: 'Modify information',
            confirmLabel: 'Update Footer'
        });
        this.modalService.onConfirm = () => this.handleSubmit();
    }

    openViewModal(footer: Footer): void {
        this.modalMode.set('view');
        this.footerForm.patchValue(footer);
        this.footerForm.disable();
        this.isDrawerOpen.set(true);
    }

    closeModal(): void {
        this.isDrawerOpen.set(false);
        this.modalService.close();
        this.selectedFooterId.set(null);
    }

    async handleSubmit(): Promise<void> {
        if (this.footerForm.invalid) return;

        this.modalService.setLoading(true);
        try {
            const formVal = this.footerForm.value;
            if (this.modalMode() === 'add') {
                await this.footerService.create(formVal);
                this.toastService.show('Footer created successfully!', 'success');
            } else {
                await this.footerService.update({ ...formVal, id: this.selectedFooterId() });
                this.toastService.show('Footer updated successfully!', 'success');
            }
            await this.footerService.getActive();
            await this.loadFooters();
            this.closeModal();
        } catch (e) {
            console.error(e);
            this.toastService.show('Submission failed.', 'error');
        } finally {
            this.modalService.setLoading(false);
        }
    }

    async deleteFooter(footer: Footer): Promise<void> {
        this.footerToDelete.set(footer);
        this.modalService.open(this.deleteModalTemplate, {
            title: 'Delete Footer Config',
            confirmLabel: 'Delete',
            type: 'danger',
            maxWidth: 'max-w-md'
        });
        this.modalService.onConfirm = () => this.confirmDelete();
    }

    async confirmDelete(): Promise<void> {
        const f = this.footerToDelete();
        if (!f) return;

        this.modalService.setLoading(true);
        try {
            await this.footerService.delete(f.id);
            this.toastService.show('Footer configuration deleted.', 'success');
            await this.footerService.getActive();
            await this.loadFooters();
            this.modalService.close();
        } catch (e) {
            console.error(e);
            this.toastService.show('Deletion failed.', 'error');
        } finally {
            this.modalService.setLoading(false);
        }
    }

    async activateFooter(footer: Footer): Promise<void> {
        if (footer.status) return;

        this.isLoading.set(true);
        try {
            await this.footerService.update({
                id: footer.id,
                name: footer.name,
                copyright: footer.copyright,
                address: footer.address,
                phone: footer.phone,
                email: footer.email,
                status: true
            });
            this.toastService.show(`Activated footer configuration: ${footer.name}`, 'success');
            await this.footerService.getActive();
            await this.loadFooters();
        } catch (e) {
            console.error(e);
            this.toastService.show('Failed to activate footer configuration.', 'error');
        } finally {
            this.isLoading.set(false);
        }
    }
}
