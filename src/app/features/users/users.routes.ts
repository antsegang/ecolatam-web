import { Routes } from '@angular/router';

export default [
  { path: '',    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent) },
  { path: ':id', loadComponent: () => import('./user-profile/user-profile.component').then(m => m.UserProfileComponent) }
] satisfies Routes;
