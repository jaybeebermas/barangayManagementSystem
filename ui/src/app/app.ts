import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationService } from './services';
import { NavigationItem } from './shared/models';

type NavNode = Omit<NavigationItem, 'children'> & {
  children: NavNode[];
  _open: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
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
  private readonly navigationLoadTimeoutMs = 12000;

  async ngOnInit(): Promise<void> {
    try {
      await Promise.race([
        this.loadNavigation(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Navigation loading timed out. Check API/proxy connectivity.')),
            this.navigationLoadTimeoutMs
          )
        )
      ]);
    } catch (error: unknown) {
      this.navigationError.set(
        error instanceof Error ? error.message : 'Failed to load navigation.'
      );
      this.loadingNavigation.set(false);
    }
  }

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

  /** Recursively stamps _open on every node. NavigationItem model is never modified. */
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

  toggleItem(item: NavNode): void {
    item._open = !item._open;
    this.navigation.update(nav => [...nav]);
  }

  async toggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }

  getIconPath(name?: string | null): string {
    const raw = (name ?? '').trim();
    if (!raw) {
      return 'https://api.iconify.design/heroicons/home-modern.svg';
    }

    if (raw.includes(':')) {
      const [collection, icon] = raw.split(':');
      if (collection && icon) {
        return `https://api.iconify.design/${collection}/${icon}.svg`;
      }
    }

    return `https://api.iconify.design/heroicons/${raw}.svg`;
  }
}