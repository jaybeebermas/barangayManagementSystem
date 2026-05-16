import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIconComponent } from '@ng-icons/core';

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
