import { Routes } from '@angular/router';

export default [
  { path: '',    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent) },
  { path: ':id/edit', loadComponent: () => import('./user-edit/user-edit.component').then(m => m.UserEditComponent) },
  { path: ':id', loadComponent: () => import('./user-profile/user-profile.component').then(m => m.UserProfileComponent) }
] satisfies Routes;
