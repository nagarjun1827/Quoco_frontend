import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'tender-analyzer',
    loadComponent: () => import('./pages/tender-analyzer/tender-analyzer.component').then(m => m.TenderAnalyzerComponent)
  },
  {
    path: 'boq-estimator',
    loadComponent: () => import('./pages/boq-estimator/boq-estimator.component').then(m => m.BoqEstimatorComponent)
  },
  {
    path: 'boq-knowledge-base',
    loadComponent: () => import('./pages/boq-knowledge-base/boq-knowledge-base.component').then(m => m.BoQKnowledgeBaseComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'profile',
    redirectTo: 'settings',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
