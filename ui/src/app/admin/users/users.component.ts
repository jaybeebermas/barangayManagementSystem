import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../../services/User/user.gql';
import { User } from '../../services/User/user.types';
import { CreateUserInput, UpdateUserInput } from '../../services/User/user.input';


import { UserManagementLayoutComponent } from '../../shared/components/admin/user-management-layout/user-management-layout.component';
import { PageHeaderComponent } from '../../shared/components/admin/page-header/page-header.component';
import { SearchFiltersComponent } from '../../shared/components/admin/search-filters/search-filters.component';
import { UserTableComponent } from '../../shared/components/admin/user-table/user-table.component';
import { TablePaginationComponent } from '../../shared/components/admin/table-pagination/table-pagination.component';
import { DrawerComponent } from '../../shared/components/ui/drawer/drawer.component';
import { computed } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    UserManagementLayoutComponent,
    PageHeaderComponent,
    SearchFiltersComponent,
    UserTableComponent,
    TablePaginationComponent,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    NgIconComponent,
    DrawerComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  public readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);

  users = signal<User[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  isDrawerOpen = signal(false);
  modalMode = signal<'add' | 'edit' | 'view'>('add');
  userForm: FormGroup;
  selectedUserId = signal<string | null>(null);
  roles = signal<string[]>(['admin', 'super_admin']);

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u => 
      u.first_name.toLowerCase().includes(term) || 
      u.last_name.toLowerCase().includes(term) || 
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      confirm_password: ['', [this.confirmPasswordValidator.bind(this)]],
      role: ['admin', [Validators.required]],
    });
  }

  confirmPasswordValidator(control: import('@angular/forms').AbstractControl): import('@angular/forms').ValidationErrors | null {
    if (!control.parent) return null;
    const password = control.parent.get('password')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.loadUsers();
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      this.userForm.get('confirm_password')?.updateValueAndValidity();
    });
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.gql.request<{ users: User[] }>(GET_USERS);
      console.log('Users loaded:', response);
      this.users.set(response.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  handleSearch(term: string): void {
    this.searchTerm.set(term);
  }

  handlePageSearch(index: number): void {
    console.log('Page changed to:', index);
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.userForm.reset();
    this.userForm.get('role')?.setValue('admin');
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isDrawerOpen.set(true);
  }

  async openEditModal(user: User): Promise<void> {
    this.modalMode.set('edit');
    this.selectedUserId.set(user.id);
    this.userForm.patchValue({ ...user, password: '', confirm_password: '' });
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isDrawerOpen.set(true);
  }

  openViewModal(user: User): void {
    this.modalMode.set('view');
    this.userForm.patchValue(user);
    this.userForm.disable();
    this.isDrawerOpen.set(true);
  }

  closeModal(): void {
    this.isDrawerOpen.set(false);
    this.userForm.enable();
    this.selectedUserId.set(null);
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) return;

    this.isLoading.set(true);
    try {
      if (this.modalMode() === 'add') {
        const input: CreateUserInput = this.userForm.value;
        delete (input as any).confirm_password;
        await this.gql.request(CREATE_USER, { input });
      } else {
        const input: UpdateUserInput = { ...this.userForm.value, id: this.selectedUserId() };
        delete (input as any).confirm_password;
        if (!input.password) delete input.password;
        await this.gql.request(UPDATE_USER, { input });
      }
      await this.loadUsers();
      this.closeModal();
      this.toastService.show(this.modalMode() === 'add' ? 'User registered successfully!' : 'Account updated successfully!', 'success');
    } catch (error) {
      console.error('Operation failed', error);
      this.toastService.show('Operation failed. Please try again.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteUser(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.isLoading.set(true);
    try {
      await this.gql.request(DELETE_USER, { id });
      await this.loadUsers();
      this.toastService.show('User deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete failed', error);
      this.toastService.show('Failed to delete user.', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
}
