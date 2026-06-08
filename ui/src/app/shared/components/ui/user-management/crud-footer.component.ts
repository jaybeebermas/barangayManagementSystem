import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crud-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-zinc-100 rounded-b-2xl text-xs font-semibold text-zinc-500 select-none">
      
      <!-- Record Counter: Shows the calculated range of visible records -->
      <div class="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
        <span>Showing</span>
        <span class="text-zinc-800 font-black">{{ startItem }}</span>
        <span>to</span>
        <span class="text-zinc-800 font-black">{{ endItem }}</span>
        <span>of</span>
        <span class="text-zinc-800 font-black">{{ totalItems }}</span>
        <span>records</span>
      </div>

      <!-- Controls: Items per page selector and manual page navigation -->
      <div class="flex flex-wrap items-center justify-center gap-6">
        
        <!-- Page Size (Items Per Page) Selector -->
        <div class="flex items-center gap-2">
          <span class="text-zinc-400 font-bold uppercase tracking-wider text-[9px] whitespace-nowrap">Items per page</span>
          <div class="relative min-w-[70px]">
            <select 
              [value]="pageSize" 
              (change)="onPageSizeChange($event)"
              class="w-full pl-3 pr-8 py-1.5 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 rounded-xl text-zinc-800 font-bold text-xs appearance-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer">
              <option *ngFor="let size of [5, 10, 25, 50, 100]" [value]="size">{{ size }}</option>
            </select>
            <!-- Custom chevron dropdown arrow icon -->
            <span class="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
            </span>
          </div>
        </div>

        <!-- Custom Styled Page Links -->
        <div class="flex items-center gap-1">
          <!-- Previous Button: disabled on the first page -->
          <button 
            (click)="changePage(currentPage - 1)" 
            [disabled]="currentPage === 1"
            class="flex items-center justify-center w-8 h-8 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>

          <!-- Dynamic Page Buttons list with ellipses -->
          <ng-container *ngFor="let page of visiblePages">
            <!-- Ellipses indicator -->
            <span 
              *ngIf="page === -1" 
              class="flex items-center justify-center w-8 h-8 text-zinc-400 font-bold text-xs select-none">
              ...
            </span>

            <!-- Page Number Button -->
            <button 
              *ngIf="page !== -1"
              (click)="changePage(page)" 
              class="flex items-center justify-center w-8 h-8 rounded-xl border font-bold text-xs transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
              [ngClass]="page === currentPage 
                ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/20' 
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'">
              {{ page }}
            </button>
          </ng-container>

          <!-- Next Button: disabled on the last page -->
          <button 
            (click)="changePage(currentPage + 1)" 
            [disabled]="currentPage === totalPages"
            class="flex items-center justify-center w-8 h-8 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

      </div>
    </div>
  `
})
export class CrudFooterComponent {
  @Input() currentPage: number = 1;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  /**
   * Calculates the total number of pages based on total records and page size.
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  /**
   * Calculates the starting item number on the current page.
   */
  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  /**
   * Calculates the ending item number on the current page.
   */
  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  /**
   * Generates an array of page numbers to render.
   * If total pages exceed 5, it includes ellipses (-1) to represent condensed ranges.
   * Example output: [1, -1, 4, 5, 6, -1, 12]
   */
  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // Represents ellipses '...'
      }

      // Middle range around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (pages.indexOf(i) === -1) {
          pages.push(i);
        }
      }

      if (current < total - 2) {
        pages.push(-1); // Represents ellipses '...'
      }

      // Always show last page
      if (pages.indexOf(total) === -1) {
        pages.push(total);
      }
    }

    return pages;
  }

  /**
   * Navigates to a specific page if it falls within valid bounds.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Handles items-per-page dropdown value changes.
   */
  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = parseInt(selectElement.value, 10);
    this.pageSizeChange.emit(newSize);
  }
}
