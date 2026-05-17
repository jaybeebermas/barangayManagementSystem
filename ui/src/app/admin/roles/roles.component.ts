import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/ui/user-management/page-header.component';
import { UserManagementLayoutComponent } from '../../shared/components/ui/user-management/user-management-layout.component';
import { TablePaginationComponent } from '../../shared/components/ui/user-management/table-pagination.component';
import { NgIconComponent } from '@ng-icons/core';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    UserManagementLayoutComponent,
    TablePaginationComponent,
    NgIconComponent,
    MatRippleModule
  ],
  templateUrl: './roles.component.html'
})
export class RolesComponent {
  roles = signal([
    { id: '1', name: 'Super Administrator', description: 'Full access to all system features and settings', usersCount: 2 },
    { id: '2', name: 'Staff Admin', description: 'Limited access for managing standard operations', usersCount: 5 },
    { id: '3', name: 'Viewer', description: 'Read-only access to system records', usersCount: 12 }
  ]);
  
  selectedRole = signal<any>(this.roles()[0]);

  selectRole(role: any) {
    this.selectedRole.set(role);
  }
}
