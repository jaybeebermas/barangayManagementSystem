import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, CdkScrollable],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-900 relative">
      <!-- Mobile Backdrop -->
      <div 
        *ngIf="sidebarOpen" 
        (click)="toggleSidebar.emit()"
        class="fixed inset-0 z-[45] bg-zinc-900/10 backdrop-blur-sm lg:hidden transition-all duration-300 animate-in fade-in">
      </div>

      <app-sidebar 
        [isOpen]="sidebarOpen" 
        [navItems]="navItems"
        class="h-full">
      </app-sidebar>

      <div class="flex flex-1 flex-col overflow-hidden relative">
        <app-header 
          [sidebarOpen]="sidebarOpen"
          (toggleSidebar)="toggleSidebar.emit()">
        </app-header>

        <main cdkScrollable class="flex-1 overflow-y-auto scroll-smooth">
          <div class="p-4 md:p-6 lg:p-8 animate-fade-in-up">
            <ng-content></ng-content>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  @Input() sidebarOpen = true;
  @Input() navItems: any[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();
}
