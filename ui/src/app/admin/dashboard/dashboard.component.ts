import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  template: `
    <!-- ========== GUEST PENDING APPROVAL SCREEN ========== -->
    <div *ngIf="isGuest()" class="min-h-[80vh] flex items-center justify-center p-6">
      <div class="max-w-lg w-full text-center">
        <!-- Animated Icon -->
        <div class="relative mx-auto mb-8 w-28 h-28">
          <div class="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-20"></div>
          <div class="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <ng-icon name="heroShieldExclamation" class="h-14 w-14 text-amber-500"></ng-icon>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-3xl font-black text-zinc-900 tracking-tight mb-3">Account Pending Approval</h2>
        <p class="text-zinc-500 font-medium text-base max-w-sm mx-auto leading-relaxed mb-10">
          Your account has been created successfully. An administrator needs to assign permissions before you can access the system.
        </p>

        <!-- Info Card -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-lg shadow-zinc-500/5 mb-8">
          <div class="flex items-center gap-4 text-left">
            <div class="h-12 w-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
              <ng-icon name="heroInformationCircle" class="h-6 w-6 text-blue-500"></ng-icon>
            </div>
            <div>
              <h4 class="text-sm font-bold text-zinc-900 mb-0.5">What happens next?</h4>
              <p class="text-xs text-zinc-500 font-medium leading-relaxed">Contact your barangay administrator and ask them to upgrade your account role. Once approved, refresh your status below.</p>
            </div>
          </div>
        </div>

        <!-- User Info Pill -->
        <div class="inline-flex items-center gap-3 bg-zinc-100 rounded-full px-5 py-2.5 mb-8">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary-600/20">
            {{ authService.currentUser()?.first_name?.[0] }}{{ authService.currentUser()?.last_name?.[0] }}
          </div>
          <div class="text-left">
            <p class="text-xs font-bold text-zinc-900 leading-none">{{ authService.currentUser()?.first_name }} {{ authService.currentUser()?.last_name }}</p>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Guest Account</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            (click)="checkStatus()"
            [disabled]="isChecking()"
            class="group relative overflow-hidden rounded-xl bg-primary-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/10 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <div class="flex items-center gap-2">
              <ng-icon *ngIf="!isChecking()" name="heroArrowPath" class="h-4 w-4"></ng-icon>
              <svg *ngIf="isChecking()" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ isChecking() ? 'Checking...' : 'Check Status' }}</span>
            </div>
          </button>

          <button 
            (click)="logout()"
            class="rounded-xl bg-zinc-100 hover:bg-zinc-200 px-8 py-3.5 text-sm font-bold text-zinc-600 transition-all active:scale-[0.98]">
            <div class="flex items-center gap-2">
              <ng-icon name="heroArrowRightOnRectangle" class="h-4 w-4"></ng-icon>
              <span>Sign Out</span>
            </div>
          </button>
        </div>

        <!-- Status Message -->
        <div *ngIf="statusMessage()" class="mt-6 p-3 rounded-xl text-xs font-bold animate-in slide-in-from-bottom-4 duration-300"
          [ngClass]="statusType() === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'">
          {{ statusMessage() }}
        </div>
      </div>
    </div>

    <!-- ========== NORMAL DASHBOARD ========== -->
    <div *ngIf="!isGuest()" class="max-w-7xl mx-auto space-y-8">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-3xl font-black text-zinc-900 tracking-tight">
            Magandang araw, <span class="text-primary-600">{{ authService.currentUser()?.first_name }}</span>!
          </h2>
          <p class="text-zinc-400 font-medium mt-1">Here's what's happening in your barangay today.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-4 py-2 bg-white border border-zinc-100 rounded-2xl shadow-premium flex items-center gap-3">
             <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span class="text-xs font-bold text-zinc-600 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-primary-200 transition-all cursor-pointer">
          <div class="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
            <ng-icon name="heroUsers" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Residents</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">1,248</h3>
            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">+2.5%</span>
          </div>
        </div>

        <div class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-accent-200 transition-all cursor-pointer">
          <div class="h-12 w-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4 group-hover:bg-accent-600 group-hover:text-white transition-all">
            <ng-icon name="heroDocumentText" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Requests</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">14</h3>
            <span class="text-[10px] font-bold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded-lg">High Priority</span>
          </div>
        </div>

        <div class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-primary-200 transition-all cursor-pointer">
          <div class="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
            <ng-icon name="heroBell" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Announcements</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">3</h3>
            <span class="text-[10px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-lg">Last 7 days</span>
          </div>
        </div>

        <div class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-emerald-200 transition-all cursor-pointer">
          <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <ng-icon name="heroShieldCheck" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Clearances Issued</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">42</h3>
            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">This Month</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white border border-zinc-100 rounded-[2.5rem] shadow-premium overflow-hidden">
          <div class="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
            <h3 class="text-lg font-bold text-zinc-900">Recent Barangay Activity</h3>
            <button class="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest">View History</button>
          </div>
          <div class="p-8 space-y-6">
            <div *ngFor="let i of [1,2,3]" class="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 group">
              <div class="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm">
                <ng-icon name="heroPlus" class="h-5 w-5 text-zinc-400"></ng-icon>
              </div>
              <div>
                <p class="text-sm font-bold text-zinc-900 leading-none">New Resident Registered</p>
                <p class="text-xs text-zinc-400 mt-1 font-medium">Juan Dela Cruz added to Purok 1 list</p>
                <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-2 block">2 hours ago • By Admin Maria</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-primary-600 rounded-[2.5rem] shadow-elevated p-8 text-white relative overflow-hidden group">
          <div class="relative z-10">
            <h3 class="text-xl font-black mb-2">Quick Navigation</h3>
            <p class="text-primary-100 text-sm mb-8 font-medium">Commonly used administrative tools.</p>
            
            <div class="space-y-3">
              <button class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                <span class="font-bold">Add New Resident</span>
                <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
              </button>
              <button class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                <span class="font-bold">Generate Report</span>
                <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
              </button>
              <button class="w-full flex items-center justify-between p-4 bg-accent-500 hover:bg-accent-600 rounded-2xl transition-all border border-accent-400 group/btn shadow-lg shadow-accent-900/20 mt-4">
                <span class="font-bold">Emergency Alert</span>
                <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
              </button>
            </div>
          </div>

          <!-- Abstract Decor -->
          <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div class="absolute -top-10 -left-10 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);

  isGuest = computed(() => this.authService.currentUser()?.role === 'guest');
  isChecking = signal(false);
  statusMessage = signal('');
  statusType = signal<'success' | 'info'>('info');

  checkStatus(): void {
    this.isChecking.set(true);
    this.statusMessage.set('');

    // Force re-check auth from server
    this.authService.checkAuth();

    // Wait for the response to come back
    setTimeout(() => {
      this.isChecking.set(false);
      const user = this.authService.currentUser();
      if (user && user.role !== 'guest') {
        this.statusMessage.set('Your account has been approved! Redirecting...');
        this.statusType.set('success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        this.statusMessage.set('Your account is still pending administrator approval.');
        this.statusType.set('info');
      }
    }, 2000);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
