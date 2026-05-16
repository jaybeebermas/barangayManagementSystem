import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-[#fbfcfd] text-zinc-900">
      <app-sidebar 
        [isOpen]="sidebarOpen" 
        [navItems]="navItems">
      </app-sidebar>

      <div class="flex flex-1 flex-col overflow-hidden relative">
        <app-header 
          [sidebarOpen]="sidebarOpen"
          (toggleSidebar)="toggleSidebar.emit()">
        </app-header>

        <main class="flex-1 overflow-y-auto scroll-smooth">
          <div class="p-6 md:p-8 animate-fade-in-up">
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
