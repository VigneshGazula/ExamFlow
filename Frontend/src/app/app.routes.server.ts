import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/manage-exams/series/:id/schedule',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/manage-exams/series/:id/branches/:branch/scheduler',
    renderMode: RenderMode.Server
  },
  {
    path: 'student/exams',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
