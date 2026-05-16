import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <div
      class="border-l border-zinc-100 bg-white transition-all duration-300 ease-in-out flex flex-col h-full relative z-[60]"
      [class.w-0]="!isOpen"
      [class.w-[450px]]="isOpen"
      [class.opacity-0]="!isOpen"
      [class.opacity-100]="isOpen"
      [class.border-l-0]="!isOpen"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0 min-w-[450px]">
        <h2 class="text-xl font-bold text-zinc-900 truncate tracking-tight">{{ title }}</h2>
        <button (click)="onClose()" class="group p-2 hover:bg-red-50 rounded-full transition-all active:scale-95">
          <ng-icon name="heroXMark" class="h-6 w-6 text-zinc-400 group-hover:text-red-500 transition-colors" strokeWidth="2.5"></ng-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto bg-zinc-50/30 p-6 min-w-[450px]">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div *ngIf="showFooter" class="p-6 border-t border-zinc-100 bg-white shrink-0 min-w-[450px]">
        <ng-content select="[drawerFooter]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
