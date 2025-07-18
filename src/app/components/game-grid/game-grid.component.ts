import { Component, input, output } from '@angular/core';
import { GridComponent } from './grid/grid.component';
import { Grid } from '../../game-party/party.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-grid',
  imports: [GridComponent, CommonModule],
  templateUrl: './game-grid.component.html',
  styleUrl: './game-grid.component.scss'
})
export class GameGridComponent {
  party = input.required<Grid[]>();
  lineGridIndexs = input.required<number[]>();
  onClickGrid = output<number>();

  play(index: number) {
    this.onClickGrid.emit(index);
  }
}
