import { Component, OnInit, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationService } from './services';
import { NavigationItem } from './shared/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ui');
  navigation = signal<NavigationItem[]>([]);
  loadingNavigation = signal(false);
  navigationError = signal('');
  private readonly navigationService = inject(NavigationService);
  private readonly navigationLoadTimeoutMs = 12000;

  async ngOnInit(): Promise<void> {
    try {
      await Promise.race([
        this.loadNavigation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Navigation loading timed out. Check API/proxy connectivity.')), this.navigationLoadTimeoutMs)
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
      const navigation = await this.navigationService.getNavigation();
      this.navigation.set(navigation);
    } catch (error: unknown) {
      this.navigationError.set(
        error instanceof Error ? error.message : 'Failed to load navigation.'
      );
    } finally {
      this.loadingNavigation.set(false);
    }
  }
}
