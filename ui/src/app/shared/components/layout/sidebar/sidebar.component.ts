import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '../../../../shared/models/navigation.model';

type NavNode = Omit<NavigationItem, 'children'> & {
  children: NavNode[];
  _open: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="relative flex h-full flex-col overflow-hidden border-r border-teal-100 bg-[#f0fdfa] transition-all duration-300 ease-out z-40 select-none"
      [class.w-72]="isOpen"
      [class.w-0]="!isOpen">
      
      <!-- Brand Area -->
      <div class="px-6 py-8">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-xl shadow-primary-600/20">
             <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
             </svg>
          </div>
          <div class="transition-all duration-300" [class.opacity-0]="!isOpen" [class.translate-x-4]="!isOpen">
            <h2 class="text-xl font-black text-zinc-900 tracking-tight leading-none">Brgy<span class="text-primary-600">Sync</span></h2>
            <p class="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">Administrator</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-none">
        <!-- Dashboard Always Top -->
        <a
          routerLink="/admin/dashboard"
          routerLinkActive="text-primary-600 font-black"
          #rlaDashboard="routerLinkActive"
          class="group relative flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-zinc-500 hover:bg-white/60 hover:shadow-sm transition-all border border-transparent"
          [routerLinkActiveOptions]="{exact: true}">
          <div *ngIf="rlaDashboard.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
          <img class="h-5 w-5 shrink-0 transition-all" [class.brightness-0]="rlaDashboard.isActive" [src]="getIconPath('home-modern')" />
          <span class="truncate">Dashboard</span>
        </a>

        <!-- Dynamic Items -->
        <div *ngFor="let section of filteredNavItems()" class="mb-1">
          <!-- Simple Item -->
          <a
            *ngIf="section.type === 'item' && isValidRoute(section.route)"
            [routerLink]="section.route"
            routerLinkActive="text-primary-600 font-black"
            #rla="routerLinkActive"
            class="group relative flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-zinc-500 hover:bg-white/60 hover:shadow-sm transition-all border border-transparent"
            [routerLinkActiveOptions]="{exact: true}">
            <div *ngIf="rla.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
            <img class="h-5 w-5 shrink-0 transition-all" [class.brightness-0]="rla.isActive" [src]="getIconPath(section.icon)" />
            <span class="truncate">{{ section.title }}</span>
          </a>

          <!-- Group/Collapsible -->
          <div *ngIf="section.type === 'group' || section.type === 'collapsible'" class="space-y-1">
            <button
              type="button"
              class="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-bold text-zinc-500 hover:bg-white/60 hover:shadow-sm transition-all group outline-none"
              (click)="toggleSection(section)">
              <img class="h-5 w-5 shrink-0 transition-all group-hover:scale-110" [src]="getIconPath(section.icon)" />
              <span class="truncate flex-1">{{ section.title }}</span>
              <svg
                class="ml-auto h-4 w-4 shrink-0 transition-transform duration-300 text-zinc-300 group-hover:text-zinc-500"
                [class.rotate-90]="section._open"
                fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Children -->
            <div
              class="overflow-hidden transition-all duration-300 ease-out pl-6 space-y-1"
              [class.max-h-[500px]]="section._open"
              [class.opacity-100]="section._open"
              [class.max-h-0]="!section._open"
              [class.opacity-0]="!section._open">
              <div *ngFor="let item of section.children">
                <a
                  *ngIf="item.type === 'item' && isValidRoute(item.route)"
                  [routerLink]="item.route"
                  routerLinkActive="text-primary-600 font-black"
                  #rlaChild="routerLinkActive"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="relative flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold text-zinc-400 hover:bg-white/60 hover:shadow-sm transition-all">
                  <div *ngIf="rlaChild.isActive" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary-600 rounded-r-full"></div>
                  <span class="truncate">{{ item.title }}</span>
                </a>
                
                <!-- Non-link child -->
                <div 
                  *ngIf="item.type === 'item' && !isValidRoute(item.route)"
                  class="flex h-10 items-center gap-2 px-4 text-[13px] font-bold text-zinc-300 cursor-default italic">
                  <span class="truncate">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Non-link top-level -->
          <div 
            *ngIf="section.type === 'item' && !isValidRoute(section.route)"
            class="flex h-12 items-center gap-3 px-4 text-sm font-bold text-zinc-300 cursor-default opacity-60 italic">
            <img class="h-5 w-5 shrink-0 grayscale opacity-40" [src]="getIconPath(section.icon)" />
            <span class="truncate">{{ section.title }}</span>
          </div>
        </div>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Input() navItems: NavNode[] = [];

  filteredNavItems(): NavNode[] {
    return this.navItems.filter(item => {
      const route = (item.route || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      return route !== '/admin/dashboard' && route !== 'dashboard' && title !== 'dashboard';
    });
  }

  isValidRoute(route?: string | null): boolean {
    if (!route) return false;
    const clean = route.trim();
    return clean !== '' && clean !== '#' && clean !== '/';
  }

  toggleSection(section: NavNode): void {
    section._open = !section._open;
  }

  getIconPath(name?: string | null): string {
    const raw = (name ?? '').trim();
    if (!raw) return 'https://api.iconify.design/heroicons/home-modern.svg';
    if (raw.includes(':')) {
      const [collection, icon] = raw.split(':');
      return `https://api.iconify.design/${collection}/${icon}.svg`;
    }
    return `https://api.iconify.design/heroicons/${raw}.svg`;
  }
}
