import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { adminRoutes } from './admin/admin.routes';
import { settingsRoutes } from './admin/settings/settings.routes';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: adminRoutes
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    children: settingsRoutes
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' }
];
