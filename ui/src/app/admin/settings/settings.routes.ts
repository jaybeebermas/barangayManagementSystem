import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'barangay', loadComponent: () => import('./barangay/barangay.component').then(m => m.BarangayComponent) },
      { path: '', redirectTo: 'barangay', pathMatch: 'full' }
    ]
  }
];
