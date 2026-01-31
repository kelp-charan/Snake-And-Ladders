import { Route } from '@angular/router';
import { Game } from './features/game/game';
import { authGuard } from './core/guards/auth-guard';

export const appRoutes: Route[] = [
    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    },
    {
        path: 'room/:id',
        component: Game,
        canActivate: [authGuard]
    }
];
