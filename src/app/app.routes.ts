import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'tasks', loadComponent: () => import('./pages/task-list/task-list').then(m => m.TaskList), title: 'Shipyard | My Board' },
  { path: 'tasks/new', loadComponent: () => import('./pages/task-form/task-form').then(m => m.TaskForm), title: 'Shipyard | New Task' },
  { path: 'tasks/:id/edit', loadComponent: () => import('./pages/task-form/task-form').then(m => m.TaskForm), title: 'Shipyard | Edit Task' },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: '**', loadComponent: () => import('./pages/not-found').then(m => m.NotFound), title: 'Shipyard | Page Not Found' },
];
