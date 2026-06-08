import { Component, Input, Output, EventEmitter, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FooterService } from '../../../../services/footer/footer.service';
import { Footer } from '../../../../services/footer/footer.types';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, CdkScrollable],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-zinc-100 text-zinc-900 relative">
      <!-- Mobile Backdrop — only visible on small screens when sidebar is open -->
      <div 
        *ngIf="sidebarOpen" 
        (click)="toggleSidebar.emit()"
        class="fixed inset-0 z-[45] bg-zinc-900/20 backdrop-blur-sm lg:hidden transition-all duration-300 animate-in fade-in">
      </div>

      <app-sidebar 
        [isOpen]="sidebarOpen" 
        [navItems]="navItems"
        (closeSidebar)="toggleSidebar.emit()"
        class="h-full shrink-0">
      </app-sidebar>

      <div class="flex flex-1 flex-col overflow-hidden relative min-w-0">
        <app-header 
          [sidebarOpen]="sidebarOpen"
          (toggleSidebar)="toggleSidebar.emit()">
        </app-header>

                <!-- Main Content Area -->
        <main cdkScrollable class="flex-1 overflow-y-auto scroll-smooth flex flex-col justify-between">
          <div class="p-4 md:p-6 lg:p-8 animate-fade-in-up relative z-10">
            <ng-content></ng-content>
          </div>

                    <!-- Compact Low-Profile Dashboard Footer -->
          <div *ngIf="footerData() as footer" class="w-full mt-8 shrink-0">
            
            <!-- Dark Teal Footer Background -->
            <footer class="w-full bg-[#0c5144] text-white py-4 px-6 md:px-12 border-t border-teal-800/20 relative z-10 flex items-center justify-between">
              <div class="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-semibold">
                
                <!-- Left Section: Branding Text -->
                <div class="flex items-center text-white text-[13px] font-bold tracking-tight whitespace-nowrap">
                  BrgySync | Super Admin
                </div>
                
                <!-- Center Section: Inline Links and Contact Details -->
                <div class="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2 text-zinc-300 font-medium">
                  <!-- Inline Links -->
                  <div class="flex items-center gap-4">
                    <a href="#" class="hover:text-white transition-all duration-200">Terms of Use</a>
                    <a href="#" class="hover:text-white transition-all duration-200">Privacy Policy</a>
                  </div>
                  
                  <!-- Separator -->
                  <span class="text-white/10 hidden sm:inline">|</span>
                  
                  <!-- Horizontally Aligned Minimalist Contact Details -->
                  <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <!-- Location -->
                    <span *ngIf="footer.address" class="flex items-center gap-1.5">
                      <svg class="h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ footer.address }}</span>
                    </span>
                    
                    <!-- Phone -->
                    <span *ngIf="footer.phone" class="flex items-center gap-1.5">
                      <svg class="h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{{ footer.phone }}</span>
                    </span>
                    
                    <!-- Email -->
                    <span *ngIf="footer.email" class="flex items-center gap-1.5">
                      <svg class="h-3.5 w-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a [href]="'mailto:' + footer.email" class="hover:text-white transition-all duration-200">{{ footer.email }}</a>
                    </span>
                  </div>
                </div>
                
                <!-- Right Section: Copyright Notice and Social Icons -->
                <div class="flex items-center gap-4 whitespace-nowrap">
                  <span class="text-zinc-400 tracking-wider">
                    {{ footer.copyright && footer.copyright.toUpperCase().includes('BRGYSYNC') ? footer.copyright.toUpperCase() : '© 2026 BRGYSYNC' }}
                  </span>
                  
                  <div class="flex items-center gap-2">
                    <!-- Facebook -->
                    <a href="#" class="h-7 w-7 rounded-full border border-white/20 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200" aria-label="Facebook">
                      <svg class="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                      </svg>
                    </a>
                    <!-- X -->
                    <a href="#" class="h-7 w-7 rounded-full border border-white/20 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200" aria-label="X">
                      <svg class="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <!-- LinkedIn -->
                    <a href="#" class="h-7 w-7 rounded-full border border-white/20 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200" aria-label="LinkedIn">
                      <svg class="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784-1.764 1.75-1.764.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <!-- Instagram -->
                    <a href="#" class="h-7 w-7 rounded-full border border-white/20 hover:border-white hover:bg-white/10 flex items-center justify-center text-white transition-all duration-200" aria-label="Instagram">
                      <svg class="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0-2.881 1.44 1.44 0 0 0 0 2.881z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                
              </div>
            </footer>
          </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  @Input() sidebarOpen = true;
  @Input() navItems: any[] = [];
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly footerService = inject(FooterService);

  footerData = computed(() => {
    const active = this.footerService.activeFooterSignal();
    if (active) return active;
    return {
      id: 'default',
      name: 'Default Configuration',
      copyright: '© 2026 BRGYSYNC. ALL RIGHTS RESERVED.',
      address: 'Zone 1 Barangay Hall, Metro Manila, Philippines',
      phone: '+63 912 345 6789',
      email: 'contact@brgysync.gov',
      status: true
    } as Footer;
  });

  ngOnInit(): void {
    this.loadActiveFooter();
  }

  async loadActiveFooter(): Promise<void> {
    try {
      await this.footerService.getActive();
    } catch (e) {
      console.error('Failed to load active footer in layout', e);
    }
  }
}
