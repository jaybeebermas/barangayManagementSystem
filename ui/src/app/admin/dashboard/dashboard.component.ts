import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, ResidentProfileService, BarangayClearanceService, GraphqlService } from '../../services';
import { Router, RouterModule } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterModule],
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
    <div *ngIf="!isGuest()" class="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-3xl font-black text-zinc-900 tracking-tight">
            Magandang araw, <span class="text-primary-600">{{ authService.currentUser()?.first_name }}</span>!
          </h2>
          <p class="text-zinc-400 font-medium mt-1">Here's what's happening in your barangay today.</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Live Indicator -->
          <div class="px-4 py-2 bg-white border border-zinc-100 rounded-2xl shadow-premium flex items-center gap-3">
             <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span class="text-xs font-bold text-zinc-600 uppercase tracking-widest">Live System Active</span>
          </div>
        </div>
      </div>

      <!-- Quick Search Bar -->
      <div class="relative w-full max-w-2xl">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <ng-icon name="heroMagnifyingGlass" class="h-5 w-5 text-zinc-400"></ng-icon>
        </div>
        <input 
          type="text" 
          placeholder="Quick search resident profile, clearance number, zone..." 
          (input)="onSearchChange($event)"
          class="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-zinc-400 shadow-premium"
        />
        
        <!-- Search Results Dropdown -->
        <div *ngIf="searchQuery() && searchResults().length > 0" class="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-elevated overflow-hidden max-h-80 overflow-y-auto">
          <div 
            *ngFor="let item of searchResults()" 
            (click)="navigateTo(item.route)" 
            class="flex items-center justify-between p-4 hover:bg-zinc-50 border-b border-zinc-50 cursor-pointer transition-colors"
          >
            <div>
              <p class="text-sm font-bold text-zinc-900">{{ item.title }}</p>
              <p class="text-xs text-zinc-500 mt-0.5">{{ item.subtitle }}</p>
            </div>
            <ng-icon name="heroArrowRight" class="h-4 w-4 text-zinc-400"></ng-icon>
          </div>
        </div>
        
        <!-- Search No Results -->
        <div *ngIf="searchQuery() && searchResults().length === 0" class="absolute z-50 w-full mt-2 bg-white border border-zinc-100 rounded-2xl shadow-elevated p-4 text-center text-xs text-zinc-400">
          No records found for "{{ searchQuery() }}"
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Residents -->
        <div 
          (click)="navigateTo('/admin/resident-profile')" 
          class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-primary-200 transition-all cursor-pointer"
        >
          <div class="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-all">
            <ng-icon name="heroUsers" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Residents</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">
              {{ isLoadingData() ? '...' : totalResidentsCount() }}
            </h3>
            <span *ngIf="!isLoadingData()" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">Active</span>
          </div>
        </div>

        <!-- Pending Requests -->
        <div 
          (click)="navigateTo('/admin/barangay-clearance')" 
          class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-accent-200 transition-all cursor-pointer"
        >
          <div class="h-12 w-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4 group-hover:bg-accent-600 group-hover:text-white transition-all">
            <ng-icon name="heroDocumentText" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pending Requests</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">
              {{ isLoadingData() ? '...' : pendingClearancesCount() }}
            </h3>
            <span *ngIf="!isLoadingData() && pendingClearancesCount() > 0" class="text-[10px] font-bold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded-lg animate-pulse">Needs Review</span>
            <span *ngIf="!isLoadingData() && pendingClearancesCount() === 0" class="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-lg">Clear</span>
          </div>
        </div>

        <!-- Active Blotters -->
        <div 
          (click)="navigateTo('/admin/blotter')" 
          class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-red-200 transition-all cursor-pointer"
        >
          <div class="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
            <ng-icon name="heroExclamationTriangle" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Blotters</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">
              {{ isLoadingData() ? '...' : activeIncidentsCount() }}
            </h3>
            <span *ngIf="!isLoadingData() && activeIncidentsCount() > 0" class="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-lg">Attention</span>
            <span *ngIf="!isLoadingData() && activeIncidentsCount() === 0" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">No Cases</span>
          </div>
        </div>

        <!-- Clearances Issued -->
        <div 
          (click)="navigateTo('/admin/barangay-clearance')" 
          class="p-6 bg-white border border-zinc-100 rounded-3xl shadow-premium group hover:border-emerald-200 transition-all cursor-pointer"
        >
          <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <ng-icon name="heroShieldCheck" class="h-6 w-6"></ng-icon>
          </div>
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Clearances Issued</p>
          <div class="flex items-baseline gap-2 mt-1">
            <h3 class="text-3xl font-black text-zinc-900">
              {{ isLoadingData() ? '...' : issuedClearancesCount() }}
            </h3>
            <span *ngIf="!isLoadingData() && issuedClearancesCount() > 0" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">Total</span>
          </div>
        </div>
      </div>

      <!-- Main Layout Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Activity Feed & Zone Analytics -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Recent Activity Log -->
          <div class="bg-white border border-zinc-100 rounded-[2.5rem] shadow-premium overflow-hidden">
            <div class="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <h3 class="text-lg font-bold text-zinc-900">Recent Barangay Activity</h3>
              <button (click)="loadDashboardData()" class="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                <ng-icon name="heroArrowPath" class="h-3.5 w-3.5"></ng-icon> Refresh
              </button>
            </div>
            
            <div class="p-8 space-y-6">
              <!-- Loading State -->
              <div *ngIf="isLoadingData()" class="py-12 text-center text-zinc-400 font-medium">
                <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Loading latest activity feed...</span>
              </div>
              
              <!-- Empty State -->
              <div *ngIf="!isLoadingData() && recentActivities().length === 0" class="py-12 text-center text-zinc-400 font-medium">
                <ng-icon name="heroQueueList" class="h-8 w-8 text-zinc-300 mx-auto mb-2"></ng-icon>
                <p>No activity log history recorded.</p>
              </div>

              <!-- List of Activity Entries -->
              <div *ngIf="!isLoadingData() && recentActivities().length > 0" class="space-y-6">
                <div *ngFor="let act of recentActivities()" class="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100 group">
                  <!-- Dynamic icon based on activity type -->
                  <div class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm"
                    [ngClass]="{
                      'bg-teal-50 text-teal-600': act.type === 'resident',
                      'bg-orange-50 text-orange-600': act.type === 'clearance',
                      'bg-red-50 text-red-600': act.type === 'blotter'
                    }"
                  >
                    <ng-icon *ngIf="act.type === 'resident'" name="heroUserPlus" class="h-5 w-5"></ng-icon>
                    <ng-icon *ngIf="act.type === 'clearance'" name="heroDocumentCheck" class="h-5 w-5"></ng-icon>
                    <ng-icon *ngIf="act.type === 'blotter'" name="heroScale" class="h-5 w-5"></ng-icon>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-4">
                      <p class="text-sm font-bold text-zinc-900 leading-none truncate">{{ act.title }}</p>
                      <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter shrink-0">
                        {{ formatTimeAgo(act.timestamp) }}
                      </span>
                    </div>
                    <p class="text-xs text-zinc-500 mt-1.5 font-medium leading-relaxed">{{ act.description }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-bold">
                        By {{ act.author }}
                      </span>
                      <span *ngIf="act.status" class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                        [ngClass]="{
                          'bg-amber-50 text-amber-600': act.status === 'pending' || act.status === 'Active',
                          'bg-emerald-50 text-emerald-600': act.status === 'approved' || act.status === 'released' || act.status === 'Settled',
                          'bg-zinc-100 text-zinc-400': act.status === 'expired' || act.status === 'Unsettled'
                        }"
                      >
                        {{ act.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Zone Distribution Overview -->
          <div class="bg-white border border-zinc-100 rounded-[2.5rem] shadow-premium p-8">
            <h3 class="text-lg font-bold text-zinc-900 mb-6">Zone Population Distribution</h3>
            
            <!-- Loading -->
            <div *ngIf="isLoadingData()" class="py-6 text-center text-zinc-400">
              Loading zone analytics...
            </div>
            
            <!-- Empty -->
            <div *ngIf="!isLoadingData() && zoneStats().length === 0" class="py-6 text-center text-zinc-400">
              No registered zones available.
            </div>

            <!-- Custom CSS Bars -->
            <div *ngIf="!isLoadingData() && zoneStats().length > 0" class="space-y-4">
              <div *ngFor="let zone of zoneStats()" class="space-y-2">
                <div class="flex justify-between items-center text-sm">
                  <span class="font-bold text-zinc-700">{{ zone.name }}</span>
                  <span class="text-zinc-500 font-medium">{{ zone.count }} resident{{ zone.count !== 1 ? 's' : '' }} ({{ zone.percentage }}%)</span>
                </div>
                <div class="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-primary-600 h-full rounded-full transition-all duration-500" [style.width.%]="zone.percentage"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Quick Navigation & Upcoming Events -->
        <div class="space-y-8">
          <!-- Quick Navigation Panel -->
          <div class="bg-primary-600 rounded-[2.5rem] shadow-elevated p-8 text-white relative overflow-hidden group">
            <div class="relative z-10">
              <h3 class="text-xl font-black mb-2">Quick Navigation</h3>
              <p class="text-primary-100 text-sm mb-8 font-medium">Commonly used administrative tools.</p>
              
              <div class="space-y-3">
                <button (click)="navigateTo('/admin/resident-profile')" class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn cursor-pointer">
                  <span class="font-bold text-sm">Resident Profiles</span>
                  <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
                </button>
                <button (click)="navigateTo('/admin/barangay-clearance')" class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn cursor-pointer">
                  <span class="font-bold text-sm">Barangay Clearances</span>
                  <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
                </button>
                <button (click)="navigateTo('/admin/blotter')" class="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn cursor-pointer">
                  <span class="font-bold text-sm">Blotter Cases</span>
                  <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
                </button>
                <button (click)="navigateTo('/admin/events')" class="w-full flex items-center justify-between p-4 bg-accent-500 hover:bg-accent-600 rounded-2xl transition-all border border-accent-400 group/btn shadow-lg shadow-accent-900/20 mt-4 cursor-pointer">
                  <span class="font-bold text-sm">Events & Announcements</span>
                  <ng-icon name="heroChevronRight" class="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth="2.5"></ng-icon>
                </button>
              </div>
            </div>

            <!-- Abstract Decor -->
            <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div class="absolute -top-10 -left-10 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          <!-- Upcoming Events Card -->
          <div class="bg-white border border-zinc-100 rounded-[2.5rem] shadow-premium p-8">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-zinc-900">Upcoming Events</h3>
              <button (click)="navigateTo('/admin/events')" class="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest cursor-pointer">
                View All
              </button>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoadingData()" class="py-6 text-center text-zinc-400">
              Loading calendar events...
            </div>
            
            <!-- Empty State -->
            <div *ngIf="!isLoadingData() && upcomingEvents().length === 0" class="py-8 text-center text-zinc-400">
              <ng-icon name="heroCalendarDays" class="h-8 w-8 text-zinc-300 mx-auto mb-2"></ng-icon>
              <p class="text-sm font-medium">No upcoming public events scheduled.</p>
            </div>

            <!-- Events List -->
            <div *ngIf="!isLoadingData() && upcomingEvents().length > 0" class="space-y-4">
              <div *ngFor="let ev of upcomingEvents()" class="flex items-start gap-4 p-3 rounded-2xl border border-zinc-50 hover:border-zinc-100 hover:bg-zinc-50/50 transition-all">
                <!-- Date Badge -->
                <div class="bg-primary-50 text-primary-700 rounded-xl p-2 shrink-0 text-center w-12">
                  <span class="block text-[10px] font-black uppercase tracking-wider leading-none">
                    {{ ev.parsedDate.toLocaleDateString('en-US', { month: 'short' }) }}
                  </span>
                  <span class="block text-lg font-black mt-1 leading-none">
                    {{ ev.parsedDate.getDate() }}
                  </span>
                </div>
                <!-- Details -->
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold text-zinc-900 truncate leading-snug">{{ ev.title }}</h4>
                  <p class="text-xs text-zinc-500 mt-0.5 truncate">{{ ev.location || 'No location set' }}</p>
                  <p *ngIf="ev.zone" class="text-[10px] text-primary-600 font-bold mt-1 uppercase tracking-wider">
                    Zone: {{ ev.zone.zone_name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  residentService = inject(ResidentProfileService);
  clearanceService = inject(BarangayClearanceService);
  gqlService = inject(GraphqlService);

  isGuest = computed(() => this.authService.currentUser()?.role === 'guest');
  isChecking = signal(false);
  statusMessage = signal('');
  statusType = signal<'success' | 'info'>('info');

  // Live data signals
  residents = signal<any[]>([]);
  clearances = signal<any[]>([]);
  blotters = signal<any[]>([]);
  events = signal<any[]>([]);
  isLoadingData = signal(true);

  // Search parameters
  searchQuery = signal('');
  searchResults = signal<any[]>([]);

  async ngOnInit() {
    if (!this.isGuest()) {
      await this.loadDashboardData();
    }
  }

  async loadDashboardData() {
    this.isLoadingData.set(true);
    try {
      const [resList, clList, blList, evList] = await Promise.all([
        this.residentService.getAll(),
        this.clearanceService.getAll(),
        this.loadBlotters(),
        this.loadEvents()
      ]);
      this.residents.set(resList || []);
      this.clearances.set(clList || []);
      this.blotters.set(blList || []);
      this.events.set(evList || []);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      this.isLoadingData.set(false);
    }
  }

  async loadBlotters(): Promise<any[]> {
    const query = `
      query {
        blotters(first: 100) {
          data { id case_number complainant_name respondent_name incident_date incident_location complaint_description status resolution_details created_at }
        }
      }
    `;
    try {
      const res = await this.gqlService.request<any>(query);
      return res.blotters.data || [];
    } catch (e) {
      console.error('Error loading blotters:', e);
      return [];
    }
  }

  async loadEvents(): Promise<any[]> {
    try {
      const res = await this.gqlService.requestFromFile<any>('event', 'get-events.gql', { first: 100 });
      return res.events.data || [];
    } catch (e) {
      console.error('Error loading events:', e);
      return [];
    }
  }

  // Dynamic statistics
  totalResidentsCount = computed(() => this.residents().length);

  pendingClearancesCount = computed(() => 
    this.clearances().filter(c => c.status === 'pending').length
  );

  issuedClearancesCount = computed(() => 
    this.clearances().filter(c => c.status === 'released' || c.status === 'approved').length
  );

  activeIncidentsCount = computed(() => 
    this.blotters().filter(b => b.status === 'Active').length
  );

  // Zone Population stats
  zoneStats = computed(() => {
    const zonesMap = new Map<string, number>();
    this.residents().forEach(r => {
      const name = r.zone?.zone_name || `Zone ${r.zone_id || 'N/A'}`;
      zonesMap.set(name, (zonesMap.get(name) || 0) + 1);
    });

    const total = this.totalResidentsCount();
    const stats: any[] = [];
    zonesMap.forEach((count, name) => {
      stats.push({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      });
    });

    return stats.sort((a, b) => b.count - a.count).slice(0, 4);
  });

  // Recent Activity Log aggregator
  recentActivities = computed(() => {
    const list: any[] = [];

    // Add residents (type: 'resident')
    this.residents().forEach(r => {
      list.push({
        type: 'resident',
        title: 'New Resident Registered',
        description: `${r.first_name} ${r.last_name} was registered in Zone ${r.zone?.zone_name || r.zone_id || 'N/A'}`,
        timestamp: r.created_at ? new Date(r.created_at) : new Date(),
        author: 'Admin'
      });
    });

    // Add clearances (type: 'clearance')
    this.clearances().forEach(c => {
      list.push({
        type: 'clearance',
        title: `Clearance Requested: ${c.clearance_number}`,
        description: `Requested by ${c.resident?.first_name} ${c.resident?.last_name} for ${c.purpose}`,
        timestamp: c.created_at ? new Date(c.created_at) : new Date(),
        author: c.issuer ? `${c.issuer.first_name} ${c.issuer.last_name}` : 'Admin',
        status: c.status
      });
    });

    // Add blotters (type: 'blotter')
    this.blotters().forEach(b => {
      list.push({
        type: 'blotter',
        title: `Incident Recorded: ${b.case_number}`,
        description: `Complainant ${b.complainant_name} against ${b.respondent_name} at ${b.incident_location}`,
        timestamp: b.created_at ? new Date(b.created_at) : new Date(),
        author: 'Staff',
        status: b.status
      });
    });

    // Sort by timestamp descending
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
  });

  // Upcoming published events
  upcomingEvents = computed(() => {
    const now = new Date();
    // Filter active and published events scheduled for today or in the future
    return this.events()
      .filter(e => e.status === 'PUBLISHED')
      .map(e => ({
        ...e,
        parsedDate: e.start_date ? new Date(e.start_date) : new Date()
      }))
      .filter(e => e.parsedDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .slice(0, 3);
  });

  // Quick search handler
  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchQuery.set(value);

    if (!value) {
      this.searchResults.set([]);
      return;
    }

    const results: any[] = [];

    // Search residents
    this.residents().forEach(r => {
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
      const email = (r.email || '').toLowerCase();
      const zoneName = (r.zone?.zone_name || '').toLowerCase();
      if (fullName.includes(value) || email.includes(value) || zoneName.includes(value)) {
        results.push({
          id: r.id,
          type: 'resident',
          title: `${r.first_name} ${r.last_name}`,
          subtitle: `Resident • Zone ${r.zone?.zone_name || r.zone_id || 'N/A'} • ${r.email || 'No email'}`,
          route: '/admin/resident-profile'
        });
      }
    });

    // Search clearances
    this.clearances().forEach(c => {
      const number = c.clearance_number.toLowerCase();
      const purpose = c.purpose.toLowerCase();
      const residentName = `${c.resident?.first_name} ${c.resident?.last_name}`.toLowerCase();
      if (number.includes(value) || purpose.includes(value) || residentName.includes(value)) {
        results.push({
          id: c.id,
          type: 'clearance',
          title: c.clearance_number,
          subtitle: `Clearance • For ${c.resident?.first_name} ${c.resident?.last_name} • Purpose: ${c.purpose}`,
          route: '/admin/barangay-clearance'
        });
      }
    });

    this.searchResults.set(results.slice(0, 8));
  }

  // Helpers
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  checkStatus(): void {
    this.isChecking.set(true);
    this.statusMessage.set('');

    this.authService.checkAuth();

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

