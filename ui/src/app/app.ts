import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationService, AuthService, UIConfigService } from './services';
import { NavigationItem } from './shared/models';
import { AdminLayoutComponent } from './shared/components/layout/admin-layout/admin-layout.component';

type NavNode = Omit<NavigationItem, 'children'> & {
  children: NavNode[];
  _open: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ui');

  navigation = signal<NavNode[]>([]);
  loadingNavigation = signal(false);
  navigationError = signal('');
  sidebarOpen = signal(true);

  private readonly navigationService = inject(NavigationService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly uiConfig = inject(UIConfigService);

  isSubRoute(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  constructor() {
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      this.loadNavigation();
    });
  }

  async ngOnInit(): Promise<void> {}

  private async loadNavigation(): Promise<void> {
    this.loadingNavigation.set(true);
    this.navigationError.set('');
    try {
      const raw = await this.navigationService.getNavigation();
      this.navigation.set(this.stampOpen(raw));
    } catch (error: unknown) {
      this.navigationError.set(
        error instanceof Error ? error.message : 'Failed to load navigation.'
      );
    } finally {
      this.loadingNavigation.set(false);
    }
  }

  private stampOpen(items: NavigationItem[]): NavNode[] {
    return items.map(item => ({
      ...item,
      _open: false,
      children: item.children?.length ? this.stampOpen(item.children) : [],
    }));
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleSection(section: NavNode): void {
    section._open = !section._open;
    this.navigation.update(nav => [...nav]);
  }
}