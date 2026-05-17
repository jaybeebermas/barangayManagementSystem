import { Component, OnInit, signal, inject, computed, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { GraphqlService } from '../../services/graphql/graphql.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER } from '../../services/User/user.gql';
import { User } from '../../services/User/user.types';
import { CreateUserInput, UpdateUserInput } from '../../services/User/user.input';


import { DrawerComponent } from '../../shared/components/ui/drawer/drawer.component';
import { ModalService } from '../../services/modal/modal.service';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent } from '@ng-icons/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { UserManagementLayoutComponent } from '../../shared/components/ui/user-management/user-management-layout.component';
import { PageHeaderComponent } from '../../shared/components/ui/user-management/page-header.component';
import { SearchFiltersComponent } from '../../shared/components/ui/user-management/search-filters.component';


@Component({
  selector: 'app-user-action-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, NgIconComponent],
  template: `
    <div class="flex items-center justify-end gap-1.5 transition-all">
      <button type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-primary-600 hover:bg-primary-50 transition-colors" (click)="view.emit()" matTooltip="View details">
        <ng-icon name="heroEye" class="text-[17px]"></ng-icon>
      </button>
      <button type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-pink-600 hover:bg-pink-50 transition-colors" (click)="edit.emit()" matTooltip="Edit user">
        <ng-icon name="heroPencil" class="text-[17px]"></ng-icon>
      </button>
      <button type="button" class="flex items-center justify-center w-8 h-8 rounded-full text-red-500 hover:bg-red-50 transition-colors" (click)="delete.emit()" matTooltip="Delete user">
        <ng-icon name="heroTrash" class="text-[17px]"></ng-icon>
      </button>
    </div>
  `
})
export class UserActionMenuComponent {
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, UserActionMenuComponent, NgIconComponent],
  template: `
    <div class="flex-1 flex flex-col min-h-0">
      <div class="hidden md:block overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-zinc-100/50 border-b border-zinc-200/60">
              <th class="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">User Profile</th>
              <th class="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">System Role</th>
              <th class="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address</th>
              <th class="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100/50">
            <tr *ngFor="let user of users" class="hover:bg-zinc-100/30 transition-all group">
              <td class="px-8 py-4">
                <div class="flex items-center gap-4">
                  <div>
                    <span class="block text-sm font-bold text-zinc-900 leading-none mb-1.5">{{ user.first_name }} {{ user.last_name }}</span>
                    <span class="text-[11px] text-zinc-400 font-semibold tracking-tight">@{{ user.username }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-4 text-center">
                <span
                  [class.bg-primary-100]="user.role === 'super_admin'"
                  [class.text-primary-700]="user.role === 'super_admin'"
                  [class.bg-zinc-200/50]="user.role !== 'super_admin'"
                  [class.text-zinc-600]="user.role !== 'super_admin'"
                  class="inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {{ user.role === 'super_admin' ? 'Super Admin' : 'Staff Admin' }}
                </span>
              </td>
              <td class="px-8 py-4 text-xs font-medium text-zinc-500">{{ user.email }}</td>
              <td class="px-8 py-4 text-right whitespace-nowrap">
                <app-user-action-menu
                  (view)="view.emit(user)"
                  (edit)="edit.emit(user)"
                  (delete)="delete.emit(user.id)">
                </app-user-action-menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/30">
        <div *ngFor="let user of users" class="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-4">
              <div class="h-11 w-11 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-600/10">
                {{ user.first_name?.[0] }}{{ user.last_name?.[0] }}
              </div>
              <div>
                <h4 class="font-bold text-zinc-900 text-sm leading-tight">{{ user.first_name }} {{ user.last_name }}</h4>
                <p class="text-[11px] text-zinc-400 font-bold uppercase tracking-tighter mt-0.5">@{{ user.username }}</p>
              </div>
            </div>
            <app-user-action-menu
              (view)="view.emit(user)"
              (edit)="edit.emit(user)"
              (delete)="delete.emit(user.id)">
            </app-user-action-menu>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <span class="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Account Role</span>
              <span
                [class.bg-primary-100]="user.role === 'super_admin'"
                [class.text-primary-700]="user.role === 'super_admin'"
                [class.bg-zinc-100]="user.role !== 'super_admin'"
                [class.text-zinc-600]="user.role !== 'super_admin'"
                class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest w-fit">
                {{ user.role === 'super_admin' ? 'Super Admin' : 'Staff Admin' }}
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">Email Address</span>
              <span class="text-zinc-600 font-bold text-[10px] truncate">{{ user.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="users.length === 0 && !isLoading" class="p-20 text-center">
        <div class="inline-flex items-center justify-center p-6 bg-zinc-100 rounded-xl mb-6 shadow-inner">
          <ng-icon name="heroUsers" class="h-10 w-10 text-zinc-300"></ng-icon>
        </div>
        <h3 class="text-zinc-900 text-xl font-black mb-2 tracking-tight">No records found</h3>
        <p class="text-zinc-500 font-medium max-w-sm mx-auto text-base">It looks like there are no results matching your criteria.</p>
      </div>

      <div *ngIf="isLoading" class="flex flex-col items-center justify-center p-24 gap-4">
        <div class="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full shadow-lg shadow-primary-600/10"></div>
        <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Records...</p>
      </div>
      <ng-content select="app-table-pagination"></ng-content>
    </div>
  `
})
export class UserTableComponent {
  @Input() users: any[] = [];
  @Input() isLoading: boolean = false;
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<string>();
}

import { TablePaginationComponent } from '../../shared/components/ui/user-management/table-pagination.component';

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
  @ViewChild('userModal') userModalTemplate!: TemplateRef<any>;

  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  public readonly auth = inject(AuthService);
  private readonly toastService = inject(ToastService);
  public readonly modalService = inject(ModalService);

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

    // Sync form validity with global modal confirm button
    this.userForm.statusChanges.subscribe(status => {
      this.modalService.setConfirmDisabled(status === 'INVALID');
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
    this.userForm.enable();
    this.userForm.reset();
    this.userForm.get('role')?.setValue('admin');
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.modalService.open(this.userModalTemplate, {
      title: 'Add New System User',
      subtitle: 'Personnel Information',
      confirmLabel: 'Register User'
    });
    this.isDrawerOpen.set(false);
    this.modalService.onConfirm = () => this.handleSubmit();
  }

  async openEditModal(user: User): Promise<void> {
    this.modalMode.set('edit');
    this.userForm.enable();
    this.selectedUserId.set(user.id);
    this.userForm.patchValue({ ...user, password: '', confirm_password: '' });
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.modalService.open(this.userModalTemplate, {
      title: 'Edit System User',
      subtitle: 'Personnel Information',
      confirmLabel: 'Update Account'
    });
    this.isDrawerOpen.set(false);
    this.modalService.onConfirm = () => this.handleSubmit();
  }

  openViewModal(user: User): void {
    this.modalMode.set('view');
    this.userForm.patchValue(user);
    this.userForm.disable();
    this.isDrawerOpen.set(true);
  }

  closeModal(): void {
    this.isDrawerOpen.set(false);
    this.modalService.close();
    this.userForm.enable();
    this.selectedUserId.set(null);
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) return;

    this.modalService.setLoading(true);
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
      this.modalService.setLoading(false);
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
