import { Routes } from '@angular/router';
import { LandingViewComponent } from './landing-view/landing-view.component';
import { SigninComponent } from './auth-view/signin/signin.component';
import { SignupComponent } from './auth-view/signup/signup.component';
import { AuthViewComponent } from './auth-view/auth-view.component';
import { GameOptionsComponent } from './game-options/game-options.component';
import { GamePartyComponent } from './game-party/game-party.component';
import { AuthRedirectGuard } from './auth-redirect.guard';

export const routes: Routes = [
    {
        path: '',
        component: LandingViewComponent,
        data: { animation: 'LandingPage', index: 1 }
    },
    {
        path: 'auth',
        canActivate: [AuthRedirectGuard],
        children: [
            {
                path: '',
                component: AuthViewComponent,
                data: { animation: 'AuthPage', index: 2 },
            },
            {
                path: 'signin',
                component: SigninComponent,
                data: { animation: 'SignInPage', index: 3 },
            },
            {
                path: 'signup',
                component: SignupComponent,
                data: { animation: 'SignUpPage', index: 4 },

            }
        ]
    },
    {
        path: 'game-options',
        component: GameOptionsComponent,
        data: { animation: 'GameOptionsPage', index: 5 },
    },
    {
        path: 'game-party',
        component: GamePartyComponent,
        data: { animation: 'GamePartyPage', index: 6 },
    },
];
