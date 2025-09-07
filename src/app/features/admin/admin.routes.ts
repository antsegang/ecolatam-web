import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export default [
  {
    path: '',
    canActivate: [roleGuard(['admin','superadmin'], 'any')],
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'catalogs',    loadComponent: () => import('./catalogs/admin-catalogs.component').then(m => m.AdminCatalogsComponent) },
      { path: 'categories',  loadComponent: () => import('./categories/admin-categories.component').then(m => m.AdminCategoriesComponent) },
      { path: 'kyc',         loadComponent: () => import('./kyc/admin-kyc.component').then(m => m.AdminKycComponent) },
      { path: 'roles',       loadComponent: () => import('./roles/admin-roles.component').then(m => m.AdminRolesComponent) },
    ]
  }
] satisfies Routes;
