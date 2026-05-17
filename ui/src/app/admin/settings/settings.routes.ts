import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'general', loadComponent: () => import('./general/general.component').then(m => m.GeneralComponent) },
      { path: '', redirectTo: 'general', pathMatch: 'full' }
    ]
  }
];
