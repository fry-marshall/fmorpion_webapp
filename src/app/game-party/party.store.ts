import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { PartyService } from "./party.service";
import { inject } from "@angular/core";
import { tapResponse } from "@ngrx/operators";
import { ErrorResponse, PlayerStore, Status } from "../auth-view/player.store";
import { Player } from "../auth-view/player.interface";
import { SocketService } from "../socket.service";
import { get2dCoordinatesToGridIndex, getGridIndexTo2dCoordinates, lineGridIndexs } from "./party.functions";

export type Grid = {
  sign?: string,
  pos: number
}

export type Party = {
  id?: string,
  player1?: string,
  player2?: string,
  code?: string,
  status?: PartyStatus,
}

export type PartyState = {
  grids: Grid[];
  parties: any[] | null;
  status: Status | null;
  currentParty: Party | null;
  error: ErrorResponse | null;
}

export enum PartyStatus {
  PENDING_PLAYER = 'pending_player',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELED = 'canceled',
}

const initialState: PartyState = {
  grids: Array.from({ length: 9 }).map((_, i) => ({ sign: undefined, pos: i } as Grid)),
  parties: null,
  currentParty: null,
  status: null,
  error: null
}

export const PartyStore = signalStore(
  { providedIn: 'root' },
  withState<PartyState>(initialState),
  withMethods((store, partyService = inject(PartyService), playerStore = inject(PlayerStore), socketService = inject(SocketService)) => ({

    playing: (index: number, sign: string) => {
      const grids = [...store.grids()];
      grids[index] = {
        ...grids[index],
        sign
      };
      patchState(store, { grids });
      const coordinates = getGridIndexTo2dCoordinates(index);
      socketService.emit('playParty', {
        partyId: store.currentParty()?.id,
        ...coordinates
      });

      if (lineGridIndexs(store.grids()).length > 0) {
        socketService.emit('finishParty', {
          partyId: store.currentParty()?.id,
        });
      }
      else if (store.grids().every(grid => grid.sign !== undefined)) {
        patchState(store, { grids: Array.from({ length: 9 }).map((_, i) => ({ sign: undefined, pos: i } as Grid)) })
      }
    },

    resetGrid: () => {
      patchState(store, { grids: Array.from({ length: 9 }).map((_, i) => ({ sign: undefined, pos: i } as Grid)) })
    },

    partyPlayed: (coordinate: { x: number, y: number }, sign: string) => {
      const index = get2dCoordinatesToGridIndex(coordinate)
      const grids = [...store.grids()];
      grids[index] = {
        ...grids[index],
        sign
      };
      patchState(store, { grids });
    },

    updateCurrentParty: (party: Party) => {
      patchState(store, { currentParty: { ...store.currentParty(), ...party } })
    },

    getParties: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: Status.PENDING })),
        switchMap(() =>
          partyService.getParties().pipe(
            tapResponse({
              next: (response: any) => {
                const parties: any[] = response.data.map((party: any) => ({...party, status: party.partyState}));
                const partyInProgress = parties.find(party => party.partyState !== PartyStatus.CANCELED && party.partyState !== PartyStatus.FINISHED)
                patchState(store, { parties, status: Status.SUCCESS, currentParty: partyInProgress });
              },
              error: ({ error }) => {
                console.error('Get parties error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        )
      )
    ),

    createParty: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { status: Status.PENDING });
        }),
        switchMap(() =>
          partyService.createParty().pipe(
            tapResponse({
              next: (response: any) => {
                const data = response.data;
                patchState(store, {
                  currentParty: { code: data.code, id: data.id, status: PartyStatus.PENDING_PLAYER, player1: playerStore.currentPlayer()?.pseudo },
                  status: Status.SUCCESS,
                });
                socketService.emit('joinParty', { partyId: data.id });
              },
              error: ({ error }) => {
                console.error('Create party error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        )
      )
    ),

    joinParty: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { status: Status.PENDING })),
        switchMap((code: string) =>
          partyService.joinParty(code).pipe(
            tapResponse({
              next: (response: any) => {
                const data = response.data
                patchState(store, {
                  currentParty: {
                    id: data.id,
                    player1: data.player1,
                    player2: data.player2
                  },
                  status: Status.SUCCESS,
                });
                socketService.emit('joinParty', { partyId: data.id });
              },
              error: ({ error }) => {
                console.error('Create party error:', error);
                patchState(store, { status: Status.ERROR, error });
              },
            })
          )
        )
      )
    ),

    finishParty: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { currentParty: {...store, status: PartyStatus.FINISHED} })),
      )
    ),

  }))
);
