import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GraphqlService } from '../../services/graphql.service';
import { AuthService } from '../../services/auth.service';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  created_at: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gql = inject(GraphqlService);
  public readonly auth = inject(AuthService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  isModalOpen = signal(false);
  modalMode = signal<'add' | 'edit' | 'view'>('add');
  userForm: FormGroup;
  selectedUserId = signal<string | null>(null);
  roles = signal<string[]>(['admin', 'super_admin']);

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      role: ['admin', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const query = `
        query {
          users {
            id
            username
            first_name
            last_name
            email
            role
            created_at
          }
        }
      `;
      const response = await this.gql.request<{ users: User[] }>(query);
      console.log('Users loaded:', response);
      this.users.set(response.users || []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  openAddModal(): void {
    this.modalMode.set('add');
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.isModalOpen.set(true);
  }

  async openEditModal(user: User): Promise<void> {
    this.modalMode.set('edit');
    this.selectedUserId.set(user.id);
    this.userForm.patchValue(user);
    this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    this.isModalOpen.set(true);
  }

  openViewModal(user: User): void {
    this.modalMode.set('view');
    this.userForm.patchValue(user);
    this.userForm.disable();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.userForm.enable();
    this.selectedUserId.set(null);
  }

  async handleSubmit(): Promise<void> {
    if (this.userForm.invalid) return;

    this.isLoading.set(true);
    try {
      if (this.modalMode() === 'add') {
        const mutation = `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
            }
          }
        `;
        await this.gql.request(mutation, { input: this.userForm.value });
      } else {
        const mutation = `
          mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
              id
            }
          }
        `;
        const input = { ...this.userForm.value, id: this.selectedUserId() };
        if (!input.password) delete input.password;
        await this.gql.request(mutation, { input });
      }
      await this.loadUsers();
      this.closeModal();
    } catch (error) {
      console.error('Operation failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteUser(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.isLoading.set(true);
    try {
      const mutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id) {
            id
          }
        }
      `;
      await this.gql.request(mutation, { id });
      await this.loadUsers();
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
