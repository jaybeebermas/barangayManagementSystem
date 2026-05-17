import { Component, OnInit, signal, inject, ViewChild, TemplateRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/ui/user-management/page-header.component';
import { UserManagementLayoutComponent } from '../../shared/components/ui/user-management/user-management-layout.component';
import { TablePaginationComponent } from '../../shared/components/ui/user-management/table-pagination.component';
import { NgIconComponent } from '@ng-icons/core';
import { MatRippleModule } from '@angular/material/core';
import { RoleService, Role } from '../../services/role/role.service';
import { PermissionService } from '../../services/permission/permission.service';
import { ModalService } from '../../services/modal/modal.service';
import { ToastService } from '../../services/toast/toast.service';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { ConfirmDeleteComponent } from '../../shared/components/ui/confirm-delete/confirm-delete.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    UserManagementLayoutComponent,
    TablePaginationComponent,
    NgIconComponent,
    MatRippleModule,
    HasPermissionDirective,
    ConfirmDeleteComponent
  ],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  @ViewChild('roleModal') roleModalTemplate!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModalTemplate!: TemplateRef<any>;
  
  roleToDelete = signal<Role | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  public readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  roles = signal<Role[]>([]);
  selectedRole = signal<Role | null>(null);
  isLoading = signal(false);

  availablePermissions = signal<string[]>([]);
  basePermissions = signal<string[]>([]);
  modules = signal<string[]>([]);

  modalMode = signal<'create' | 'edit'>('create');
  modalPermissions = signal<string[]>([]);
  modalSearchTerm = signal('');
  roleForm: FormGroup;
  originalRoleName = '';
  originalPermissions: string[] = [];

  updateModalSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.modalSearchTerm.set(target.value || '');
  }

  clearModalSearch(): void {
    this.modalSearchTerm.set('');
  }

  getFilteredModulePermissions(module: string): string[] {
    const allModulePerms = this.getModulePermissions(module);
    const search = this.modalSearchTerm().toLowerCase().trim();
    if (!search) return allModulePerms;
    return allModulePerms.filter(p => {
      const action = this.getPermissionAction(p).toLowerCase();
      const modLabel = this.getModuleLabel(module).toLowerCase();
      const permName = p.toLowerCase();
      return action.includes(search) || modLabel.includes(search) || permName.includes(search);
    });
  }

  hasVisiblePermissions(module: string): boolean {
    return this.getFilteredModulePermissions(module).length > 0;
  }

  getFilteredPermissions(): string[] {
    const search = this.modalSearchTerm().toLowerCase().trim();
    if (!search) return this.availablePermissions();
    return this.availablePermissions().filter(p => {
      const parts = p.split('.');
      const module = parts[0] || '';
      const action = parts[parts.length - 1] || '';
      const modLabel = this.getModuleLabel(module).toLowerCase();
      const permName = p.toLowerCase();
      return action.includes(search) || modLabel.includes(search) || permName.includes(search);
    });
  }

  areAllFilteredChecked(): boolean {
    const visible = this.getFilteredPermissions();
    if (visible.length === 0) return false;
    const checked = this.modalPermissions();
    return visible.every(p => checked.includes(p));
  }

  toggleSelectAll(): void {
    const visible = this.getFilteredPermissions();
    const checked = this.modalPermissions();
    
    if (this.areAllFilteredChecked()) {
      this.modalPermissions.set(checked.filter(p => !visible.includes(p)));
    } else {
      const union = new Set([...checked, ...visible]);
      this.modalPermissions.set(Array.from(union));
    }
  }

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]]
    });

    // Auto-sync modal state when permissions signal changes
    effect(() => {
      this.modalPermissions();
      this.syncModalConfirmState();
    });
  }

  hasChanges(): boolean {
    if (this.modalMode() === 'create') {
      // For create, check if name is not empty or any permissions are checked
      return !!this.roleForm.value.name?.trim() || this.modalPermissions().length > 0;
    } else {
      // For edit, check if name or permissions are different from the original state
      const nameChanged = (this.roleForm.value.name || '').trim() !== (this.originalRoleName || '').trim();
      const permsChanged = this.arePermissionsDifferent(this.modalPermissions(), this.originalPermissions);
      return nameChanged || permsChanged;
    }
  }

  private arePermissionsDifferent(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return true;
    const set2 = new Set(arr2);
    return arr1.some(p => !set2.has(p));
  }

  syncModalConfirmState(): void {
    const isFormInvalid = this.roleForm.invalid;
    const hasNoChanges = !this.hasChanges();
    this.modalService.setConfirmDisabled(isFormInvalid || hasNoChanges);
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();

    // Listen to form value changes to sync modal confirm state
    this.roleForm.valueChanges.subscribe(() => {
      this.syncModalConfirmState();
    });
  }

  async loadRoles(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.roleService.getAll();
      this.roles.set(response || []);
      
      // Keep selectedRole if it is already selected, otherwise default to null
      const currentSelected = this.selectedRole();
      if (currentSelected) {
        const updated = response.find(r => r.id === currentSelected.id);
        this.selectedRole.set(updated || null);
      } else {
        this.selectedRole.set(null);
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.toastService.show('Failed to load roles from backend.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadPermissions(): Promise<void> {
    try {
      const registry = await this.permissionService.getPermissionRegistry();
      this.availablePermissions.set(registry.availablePermissions || []);
      this.basePermissions.set(registry.basePermissions || []);

      // Extract unique modules from availablePermissions
      // e.g. from 'user.view' extract 'user'
      const extractedModules = new Set<string>();
      registry.availablePermissions.forEach(perm => {
        const parts = perm.split('.');
        if (parts.length > 1) {
          extractedModules.add(parts[0]);
        }
      });
      this.modules.set(Array.from(extractedModules));
    } catch (error) {
      console.error('Failed to load permissions registry:', error);
    }
  }

  selectRole(role: Role): void {
    this.selectedRole.set(role);
  }

  // Permission helpers
  getModulePermissions(module: string): string[] {
    return this.availablePermissions().filter(p => p.startsWith(module + '.'));
  }

  getPermissionAction(perm: string): string {
    const parts = perm.split('.');
    return parts[parts.length - 1];
  }

  getModuleLabel(module: string): string {
    switch (module) {
      case 'sample': return 'Sample Module';
      case 'permission': return 'Permission Management';
      case 'user': return 'User Management';
      case 'barangay': return 'Barangay Management';
      case 'disaster': return 'Disaster Management';
      default: return module.charAt(0).toUpperCase() + module.slice(1) + ' Module';
    }
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'view': return 'View';
      case 'create': return 'Create';
      case 'edit': return 'Edit';
      case 'delete': return 'Delete';
      default: return action.charAt(0).toUpperCase() + action.slice(1);
    }
  }

  getModuleIcon(module: string): string {
    switch (module) {
      case 'sample': return 'heroDocumentText';
      case 'permission': return 'heroShieldCheck';
      case 'user': return 'heroUsers';
      case 'barangay': return 'heroHomeModern';
      case 'disaster': return 'heroExclamationTriangle';
      default: return 'heroShieldCheck';
    }
  }

  hasPermission(role: Role | null, perm: string): boolean {
    if (!role || !role.permissions) return false;
    return role.permissions.some(p => p.name === perm);
  }

  // Modal actions
  openCreateModal(): void {
    this.modalMode.set('create');
    this.roleForm.reset();
    this.modalPermissions.set([]);
    this.modalSearchTerm.set('');
    
    this.originalRoleName = '';
    this.originalPermissions = [];

    this.modalService.open(this.roleModalTemplate, {
      title: 'Create New Role',
      subtitle: 'Specify role name and assign system privileges',
      confirmLabel: 'Register Role'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
  }

  openEditModal(): void {
    const role = this.selectedRole();
    if (!role) return;

    this.modalMode.set('edit');
    this.roleForm.patchValue({
      name: role.name
    });

    const currentPermNames = (role.permissions || []).map(p => p.name);
    this.modalPermissions.set(currentPermNames);
    this.modalSearchTerm.set('');

    this.originalRoleName = role.name;
    this.originalPermissions = [...currentPermNames];

    this.modalService.open(this.roleModalTemplate, {
      title: 'Edit Role Details',
      subtitle: 'Modify name or adjust system permissions',
      confirmLabel: 'Update Role'
    });
    this.modalService.onConfirm = () => this.handleSubmit();
  }

  toggleModalPermission(perm: string) {
    const current = this.modalPermissions();
    if (current.includes(perm)) {
      this.modalPermissions.set(current.filter(p => p !== perm));
    } else {
      this.modalPermissions.set([...current, perm]);
    }
  }

  isModalPermissionChecked(perm: string): boolean {
    return this.modalPermissions().includes(perm);
  }

  closeModal(): void {
    this.modalService.close();
  }

  async handleSubmit(): Promise<void> {
    if (this.roleForm.invalid) return;

    this.modalService.setLoading(true);
    try {
      const input = {
        name: this.roleForm.value.name,
        permissions: this.modalPermissions(),
        guard_name: 'web'
      };

      if (this.modalMode() === 'create') {
        await this.roleService.create(input);
        this.toastService.show('Role registered successfully!', 'success');
      } else {
        const id = this.selectedRole()?.id;
        if (id) {
          await this.roleService.update(id, input);
          this.toastService.show('Role updated successfully!', 'success');
        }
      }
      await this.loadRoles();
      this.closeModal();
    } catch (error) {
      console.error('Operation failed', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }

  async deleteRole(id: string): Promise<void> {
    const role = this.roles().find(r => r.id === id);
    if (!role) return;

    this.roleToDelete.set(role);
    this.modalService.open(this.deleteModalTemplate, {
      title: 'Delete Role',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
      maxWidth: 'max-w-md'
    });
    this.modalService.onConfirm = () => this.confirmDeleteRole();
  }

  async confirmDeleteRole(): Promise<void> {
    const role = this.roleToDelete();
    if (!role) return;

    this.modalService.setLoading(true);
    try {
      await this.roleService.delete(role.id);
      if (this.selectedRole()?.id === role.id) {
        this.selectedRole.set(null);
      }
      await this.loadRoles();
      this.toastService.show('Role deleted successfully!', 'success');
      this.modalService.close();
    } catch (error) {
      console.error('Delete failed', error);
      this.toastService.show('Failed to delete role.', 'error');
    } finally {
      this.modalService.setLoading(false);
    }
  }
}
