import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '',                                   loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)                        },
  { path: 'login',                              loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)                },
  { path: 'register',                           loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)       },

  // NUEVO: rutas protegidas que muestra el header pero exige login al entrar
  { path: 'ecoguia',  canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/ecoguia.component').then(m => m.EcoguiaComponent)               },
  { path: 'social',   canActivate: [authGuard], loadComponent: () => import('./features/social/social.component').then(m => m.SocialComponent)                  },
  { path: 'users',    canActivate: [authGuard], loadChildren:  () => import('./features/users/users.routes')                               },

  { path: 'about',                              loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)                     },
  { path: 'solutions',                          loadComponent: () => import('./features/solutions/solutions.component').then(m => m.SolutionsComponent)         },
  { path: 'contact',                            loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)               },
  { path: 'privacy',                            loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent)               },
  { path: 'terms',                              loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent)                     },
  { path: 'cookies',                            loadComponent: () => import('./features/cookies/cookies.component').then(m => m.CookiesComponent)               },
  { path: 'takedown',                           loadComponent: () => import('./features/takedown/takedown.component').then(m => m.TakedownComponent)            },
  { path: 'acam-notice',                        loadComponent: () => import('./features/acam-notice/acam-notice.component').then(m => m.AcamNoticeComponent)    },
  { path: 'disclaimers',                        loadComponent: () => import('./features/disclaimers/disclaimers.component').then(m => m.DisclaimersComponent)   },
  { path: '**', redirectTo: '' },
];
