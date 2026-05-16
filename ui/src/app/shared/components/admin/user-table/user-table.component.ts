import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserActionMenuComponent } from '../user-action-menu/user-action-menu.component';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, UserActionMenuComponent, NgIconComponent],
  template: `
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Desktop Table -->
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

      <!-- Mobile Cards -->
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

      <!-- Empty State -->
      <div *ngIf="users.length === 0 && !isLoading" class="p-20 text-center">
        <div class="inline-flex items-center justify-center p-6 bg-zinc-100 rounded-xl mb-6 shadow-inner">
          <ng-icon name="heroUsers" class="h-10 w-10 text-zinc-300"></ng-icon>
        </div>
        <h3 class="text-zinc-900 text-xl font-black mb-2 tracking-tight">No records found</h3>
        <p class="text-zinc-500 font-medium max-w-sm mx-auto text-base">It looks like there are no results matching your criteria.</p>
      </div>

      <!-- Loading State -->
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
