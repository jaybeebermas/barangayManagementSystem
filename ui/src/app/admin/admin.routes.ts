import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [

            // MAIN MODULES
            { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },

            // USER MODULE
            { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },

            // ROLE MODULE
            { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },

            // RESIDENCE MODULE
            { path: 'resident-profile', loadComponent: () => import('./residence/resident-profile/resident-profile.component').then(m => m.ResidentProfileComponent) },
            { path: 'zone', loadComponent: () => import('./residence/zone/zone.component').then(m => m.ZoneComponent) },

            // EVENTS MODULE
            { path: 'events', loadComponent: () => import('./events/events.component').then(m => m.EventsComponent) },

            // OFFICIALS MODULE
            { path: 'officials', loadComponent: () => import('./officials/officials.component').then(m => m.OfficialsComponent) },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

        ]
    }
];
