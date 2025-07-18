import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { GameGridComponent } from '../components/game-grid/game-grid.component';
import { PlayerCardComponent } from '../components/player-card/player-card.component';
import { ActivatedRoute } from '@angular/router';
import { Player } from '../auth-view/player.interface';
import { PartyStore } from './party.store';
import { PlayerStore, Status } from '../auth-view/player.store';
import { ModalComponent } from '../components/modal/modal.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationComponent, NotificationType } from '../notification.component';
import { SocketService } from '../socket.service';
import { CommonModule } from '@angular/common';
import { lineGridIndexs } from './party.functions';

@Component({
  selector: 'app-game-party',
  imports: [CommonModule, GameGridComponent, PlayerCardComponent, PlayerCardComponent, ModalComponent, ReactiveFormsModule, NotificationComponent],
  templateUrl: './game-party.component.html',
  styleUrl: './game-party.component.scss'
})
export class GamePartyComponent implements OnInit {

  players: Player[] = []
  partyStore = inject(PartyStore);
  playerStore = inject(PlayerStore);

  /**
   * A player get do three actions:
   *  - Create a party
   *  - Join a party with a code
   *  - In a case he still have a party in progress and he accidentally close the window, he can go back to the current party
   */
  isCreating = signal(false);
  isJoining = signal(false);
  isGettingBack = signal(false);
  Status = Status;
  displayCodeModal = signal(false);
  displayWaitingPlayer = signal(false);
  canPlay = signal(false);

  form = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(4)])
  })

  notificationMessage = '';
  notificationType: NotificationType = 'success';
  showNotification = false;

  private audioWin: HTMLAudioElement | null = null;
  private audioLosing: HTMLAudioElement | null = null;
  public audioEnabled = false;

  lineGridIndexs = lineGridIndexs;

  currentParty = computed(() => this.partyStore.currentParty());

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly socketService: SocketService
  ) {
    this.isCreating.set(this.activatedRoute.snapshot.queryParamMap.get('creating') === 'true');
    this.isJoining.set(this.activatedRoute.snapshot.queryParamMap.get('joining') === 'true');
    this.isGettingBack.set(this.activatedRoute.snapshot.queryParamMap.get('gettingback') === 'true');

    effect(() => {

      if (this.isCreating() && typeof this.currentParty()?.player2 !== 'undefined') {
        this.displayWaitingPlayer.set(false)
      }

      if (this.isJoining() && typeof this.currentParty()?.player2 !== 'undefined') {
        this.isJoining.set(false)
      }

      const status = this.partyStore.status();
      if (status === Status.ERROR) {
        this.showErrorNotification(this.partyStore.error()?.message!);
      }

      if (this.currentParty()) {
        const isPlayer1 = this.currentParty()?.player1 === this.playerStore.currentPlayer()?.pseudo;

        this.players = [
          {
            name: 'You',
            sign: isPlayer1 ? 'rond.png' : 'croix.png',
            img: isPlayer1 ? 'img1.png' : 'robot.png'
          },
          {
            name: isPlayer1 ? this.currentParty()?.player2 ?? '...' : 'toto',
            sign: !isPlayer1 ? 'rond.png' : 'croix.png',
            img: !isPlayer1 ? 'img1.png' : 'robot.png'
          }
        ]
      }
    });
  }

  ngOnInit() {
    if (this.isCreating()) {
      this.displayCodeModal.set(true);
      this.partyStore.createParty();

      const party = this.partyStore.currentParty();
      if (typeof party?.player2 === 'undefined') {
        this.displayWaitingPlayer.set(true)
      }
    }

    if (this.isGettingBack()) {
      const party = this.partyStore.currentParty();
      if (typeof party?.player2 === 'undefined') {
        this.displayWaitingPlayer.set(true)
        this.displayCodeModal.set(true);
      }
    }

    if (this.isJoining()) {
      this.players = [
        {
          name: 'You',
          sign: 'croix.png',
          img: 'robot.png'
        },
        {
          name: '...',
          sign: 'rond.png',
          img: 'img1.png'
        }
      ]
    }

    this.socketService.listen('partyJoined').subscribe((data: any) => {
      this.partyStore.updateCurrentParty({ player2: data.player })
      this.canPlay.set(true)
    })

    this.socketService.listen('partyPlayed').subscribe((data: any) => {
      this.partyStore.partyPlayed(data.move, this.signPlayed)
      this.canPlay.set(true)
      if (this.hasWon) {
        if (this.hasWon.won) {
          this.canPlay.set(false)
          this.playWinAudio();
        }
        else {
          this.playLosingAudio()
        }
        this.partyStore.finishParty()
      }
      else if (this.partyStore.grids().every(grid => grid.sign !== undefined)) {
        this.partyStore.resetGrid()
      }
    })
  }

  get signPlayed() {
    if (!this.isCreating()) {
      return 'rond.png'
    }
    else {
      return 'croix.png'
    }
  }

  get sign() {
    if (this.isCreating()) {
      return 'rond.png'
    }
    else {
      return 'croix.png'
    }
  }

  get hasWon() {
    const win = lineGridIndexs(this.partyStore.grids())
    if (win.length > 0) {
      const firstSign = this.partyStore.grids()[win[0]].sign

      if (this.isCreating() && firstSign === 'rond.png') {
        return { won: true }
      }
      else if (this.isCreating() && firstSign !== 'rond.png') {
        return { won: false }
      }
      else if (!this.isCreating() && firstSign === 'rond.png') {
        return { won: false }
      }
      else if (!this.isCreating() && firstSign !== 'rond.png') {
        return { won: true }
      }
    }
    return null
  }

  play(gridIndex: number) {
    if (this.canPlay() && this.partyStore.grids()[gridIndex].sign === undefined) {
      this.partyStore.playing(gridIndex, this.sign)
      this.canPlay.set(false)
    }
    if (this.hasWon) {
      if (this.hasWon.won) {
        this.canPlay.set(false)
        this.playWinAudio();
      }
      else {
        this.playLosingAudio()
      }
      this.partyStore.finishParty()
    }
  }

  joinParty() {
    if (this.form.valid) {
      const code: string = this.form.get('code')?.value ?? ''
      this.partyStore.joinParty(code);
    }
  }

  private showErrorNotification(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }


  @HostListener('document:click')
  enableLosingAudio() {
    this.audioLosing = new Audio('losing.mp3');
    this.audioLosing.load();
    this.audioLosing.volume = 0;
    this.audioLosing
      .play()
      .then(() => {
        this.audioLosing?.pause();
        this.audioLosing!.currentTime = 0;
        this.audioLosing!.volume = 1;
      })
      .catch((err) => {
        console.warn(err);
      });

    this.audioWin = new Audio('win.mp3');
    this.audioWin.load();
    this.audioWin.volume = 0;
    this.audioWin
      .play()
      .then(() => {
        this.audioWin?.pause();
        this.audioWin!.currentTime = 0;
        this.audioWin!.volume = 1;
      })
      .catch((err) => {
        console.warn(err);
      });
  }

  playWinAudio() {
    this.audioWin!
      .play()
      .catch((err) => console.warn(err));
  }

  playLosingAudio() {
    this.audioLosing!
      .play()
      .catch((err) => console.warn(err));
  }
}
