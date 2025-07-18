import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { AuthDto } from "./auth.dto";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { inject } from "@angular/core";
import { PlayerService } from "./player.service";
import { tapResponse } from '@ngrx/operators';

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type ErrorResponse = {
  statusCode: number;
  message: string;
}

export interface Player{
  id: string;
  pseudo: string;
}

type PlayerState = {
  currentPlayer: Player | null;
  tokens: { access_token: string, refresh_token: string },
  status: Status | null;
  error: ErrorResponse | null;
};

const initialState: PlayerState = {
  currentPlayer: null,
  tokens: { access_token: '', refresh_token: '' },
  error: null,
  status: null,
}


export const PlayerStore = signalStore(
  { providedIn: 'root' },
  withState<PlayerState>(initialState),
  withMethods((store, playerService = inject(PlayerService)) => ({
    signin: rxMethod<AuthDto>(
      pipe(
        tap(() => patchState(store, { status: Status.PENDING })),
        switchMap((authDto) => {
          return playerService.signin(authDto).pipe(
            tapResponse({
              next: (response: any) => patchState(store, {
                tokens: { access_token: response.data.access_token, refresh_token: response.data.refresh_token },
                status: Status.SUCCESS
              }),
              error: ({ error }) => {
                console.error('Signin error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        })
      )
    ),
    signup: rxMethod<AuthDto>(
      pipe(
        tap(() => patchState(store, { status: Status.PENDING })),
        switchMap((authDto) => {
          return playerService.signup(authDto).pipe(
            tapResponse({
              next: (response: any) => patchState(store, {
                status: Status.SUCCESS,
                tokens: { access_token: response.data.access_token, refresh_token: response.data.refresh_token },
              }),
              error: ({ error }) => {
                console.error('Signin error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        })
      )
    ),
    getMe: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: Status.PENDING })),
        switchMap(() => {
          return playerService.getPlayer().pipe(
            tapResponse({
              next: (response: any) => patchState(store, {
                status: Status.SUCCESS,
                currentPlayer: { 
                  id: response.data.id,
                  pseudo: response.data.pseudo,
                 },
              }),
              error: ({ error }) => {
                console.error('Get Player infos error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        })
      )
    )
  }))
)