import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  canClose = input<boolean>(true);
  display = signal(true);

  closeModal(){
    this.display.set(false)
  }

}
