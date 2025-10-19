import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '',                                   loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)                        },
  { path: 'login',                              loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)                },
  { path: 'register',                           loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)       },
  { path: 'blog',                               loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent)                        },
  { path: 'demo-icons',                         loadComponent: () => import('./demo/demo-icons.component').then(m => m.DemoIconsComponent)                     },

  // NUEVO: rutas protegidas que muestra el header pero exige login al entrar
  { path: 'ecoguia',          canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/ecoguia.component').then(m => m.EcoguiaComponent)       },
  { path: 'ecoguia/create',   canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/business-create/business-create.component').then(m => m.BusinessCreateComponent) },
  { path: 'ecoguia/:id',      canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/business-detail/business-detail.component').then(m => m.BusinessDetailComponent) },
  { path: 'admin',            loadChildren: () => import('./features/admin/admin.routes') },
  { path: 'ecoguia/product/:id', canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'ecoguia/service/:id', canActivate: [authGuard], loadComponent: () => import('./features/ecoguia/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
  { path: 'social',   canActivate: [authGuard], loadComponent: () => import('./features/social/social.component').then(m => m.SocialComponent)                  },
  { path: 'users',    canActivate: [authGuard], loadChildren:  () => import('./features/users/users.routes')                               },

  { path: 'about',                              loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)                     },
  { path: 'solutions',                          loadComponent: () => import('./features/solutions/solutions.component').then(m => m.SolutionsComponent)         },
  { path: 'services',                          loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)         },
  { path: 'contact',                            loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)               },
  { path: 'privacy',                            loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent)               },
  { path: 'terms',                              loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent)                     },
  { path: 'cookies',                            loadComponent: () => import('./features/cookies/cookies.component').then(m => m.CookiesComponent)               },
  { path: 'takedown',                           loadComponent: () => import('./features/takedown/takedown.component').then(m => m.TakedownComponent)            },
  { path: 'acam-notice',                        loadComponent: () => import('./features/acam-notice/acam-notice.component').then(m => m.AcamNoticeComponent)    },
  { path: 'disclaimers',                        loadComponent: () => import('./features/disclaimers/disclaimers.component').then(m => m.DisclaimersComponent)   },
  { path: 'ods',                                loadComponent: () => import('./features/ods/ods-page.component').then(m => m.OdsPageComponent)                  },
  { path: '**',                                 loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)          },
];


