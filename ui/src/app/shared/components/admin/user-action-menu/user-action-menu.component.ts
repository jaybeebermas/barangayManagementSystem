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
    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
      <button mat-icon-button color="primary" (click)="view.emit()" matTooltip="View details">
        <ng-icon name="heroEye" class="text-lg"></ng-icon>
      </button>
      <button mat-icon-button color="accent" (click)="edit.emit()" matTooltip="Edit user">
        <ng-icon name="heroPencil" class="text-lg"></ng-icon>
      </button>
      <button mat-icon-button color="warn" (click)="delete.emit()" matTooltip="Delete user">
        <ng-icon name="heroTrash" class="text-lg"></ng-icon>
      </button>
    </div>
  `
})
export class UserActionMenuComponent {
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
