import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full bg-zinc-50 -m-6 md:-m-8 p-4 md:p-8 overflow-y-auto">
      <div class="w-full bg-zinc-50 rounded-2xl border border-zinc-200/50 p-6 md:p-10 shadow-sm flex flex-col gap-6 animate-fade-in-up min-h-[calc(100vh-10rem)]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .shadow-inner-lg { box-shadow: inset 0 2px 15px 0 rgb(0 0 0 / 0.05); }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class UserManagementLayoutComponent {}
