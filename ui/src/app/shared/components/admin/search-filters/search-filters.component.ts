import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
  template: `
    <div class="flex flex-col md:flex-row gap-4 p-1 items-center">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="flex-1 w-full">
        <input 
          matInput
          [(ngModel)]="searchTerm" 
          (ngModelChange)="search.emit($event)"
          [placeholder]="placeholder"
        />
      </mat-form-field>
      <div class="flex gap-3 w-full md:w-auto items-center">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SearchFiltersComponent {
  @Input() placeholder: string = 'Search...';
  @Output() search = new EventEmitter<string>();
  searchTerm: string = '';
}
