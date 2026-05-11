import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-zinc-100">Welcome back, {{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</h1>
            <p class="text-zinc-400">Barangay Management System - Admin Dashboard</p>
          </div>
          <button
            (click)="logout()"
            class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700"
          >
            Sign Out
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <h3 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Total Residents</h3>
            <p class="text-2xl font-bold text-zinc-100">1,248</p>
          </div>
          <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <h3 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Active Requests</h3>
            <p class="text-2xl font-bold text-zinc-100">14</p>
          </div>
          <div class="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <h3 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Announcements</h3>
            <p class="text-2xl font-bold text-zinc-100">3</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
