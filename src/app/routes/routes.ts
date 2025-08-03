import { Routes } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RecoverComponent } from './pages/recover/recover.component';
import { LockComponent } from './pages/lock/lock.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { Error404Component } from './pages/error404/error404.component';
import { Error500Component } from './pages/error500/error500.component';

export const routes: Routes = [

    // Redirige la ruta vacía (raíz) directamente al componente de login
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    // Not lazy-loaded routes
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'recover', component: RecoverComponent },
    { path: 'lock', component: LockComponent },
    { path: 'maintenance', component: MaintenanceComponent },
    { path: '404', component: Error404Component },
    { path: '500', component: Error500Component },

    // Rutas protegidas que usarán el LayoutComponent
    {
        path: '',
        component: LayoutComponent,
        children: [
            // { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Puedes redirigir a dashboard aquí
            { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            // ... (el resto de tus rutas lazy-loaded)
        ]
    },

    // Not found (asegúrate de que esto sea lo último)
    { path: '**', redirectTo: '404' }

];