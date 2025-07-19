import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocketService } from '../socket.service';
import { PartyStatus, PartyStore } from '../game-party/party.store';
import { PlayerStore } from '../auth-view/player.store';

@Component({
  selector: 'app-game-options',
  imports: [RouterLink],
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.scss'
})
export class GameOptionsComponent implements OnInit {
  playerStore = inject(PlayerStore);
  partyStore = inject(PartyStore);

  hasCurrentPartyInProgress = computed(() => {
    const party = this.partyStore.currentParty();
    return party?.status === PartyStatus.IN_PROGRESS || party?.status === PartyStatus.PENDING_PLAYER
  })

  constructor(private readonly socketService: SocketService) { }

  ngOnInit() {
    if (!this.playerStore.currentPlayer()) {
      this.playerStore.getMe()
    }
    if (!this.partyStore.parties()) {
      this.partyStore.getParties()
    }

    const party = this.partyStore.currentParty();
    if (party && party.status === PartyStatus.FINISHED) {
      this.partyStore.resetGrid()
    }
  }

  joinParty() {
    const party = this.partyStore.currentParty();
    this.socketService.emit('rejoinParty', { partyId: party?.id });
  }
}
