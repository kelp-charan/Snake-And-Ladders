import { Routes } from "@angular/router";

import { Signin } from "./components/signin-page/signin";
import { Signup } from "./components/signup-page/signup";
import { AuthComponent } from "./auth";
import { Room } from "./components/room/room";
import { guestGuard } from "../../core/guards/guest-guard";


export const authRoutes: Routes = [
    {
        path: '',
        component: AuthComponent,
        children: [
            {
                path: '',
                redirectTo: 'signin',
                pathMatch: 'full'
            },
            {
                path: 'signin',
                component: Signin,
                canActivate: [guestGuard]
            },
            {
                path: 'signup',
                component: Signup,
                canActivate: [guestGuard]
            },
            {
                path: 'room',
                component: Room
            }
        ],
    },
]