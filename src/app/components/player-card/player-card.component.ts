import { Component, input } from '@angular/core';
import { Player } from '../../auth-view/player.interface';

@Component({
  selector: 'app-player-card',
  imports: [],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss'
})
export class PlayerCardComponent {
  player = input.required<Player>();
  isPlaying = input<boolean>(true);

  get name(){
    return (this.player().name?.substring(0,1)?.toUpperCase() ?? '') + (this.player().name?.substring(1) ?? '')
  }
}
