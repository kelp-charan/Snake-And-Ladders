import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Game } from './features/game/game';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'room/:id',
    component: Game,
    canActivate: [authGuard],
  },
];
