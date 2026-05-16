import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-action-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
      <button mat-icon-button color="primary" (click)="view.emit()" matTooltip="View details">
        <mat-icon>visibility</mat-icon>
      </button>
      <button mat-icon-button color="accent" (click)="edit.emit()" matTooltip="Edit user">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="delete.emit()" matTooltip="Delete user">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  `
})
export class UserActionMenuComponent {
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
