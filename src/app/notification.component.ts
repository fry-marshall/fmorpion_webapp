import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
  @if(show) {
    <div 
      [class]="'fixed top-4 left-4 p-4 rounded-md shadow-lg transition-all duration-300 ' + 
        (type === 'success' ? 'bg-green-500' : 'bg-red-500')"
    >
      <div class="flex items-center">
        <span class="text-white">{{ message }}</span>
        <button 
          (click)="close()" 
          class="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  }
  `,
    styles: []
})
export class NotificationComponent {
    @Input() message: string = '';
    @Input() type: NotificationType = 'success';
    @Input() show: boolean = false;
    @Input() duration: number = 3000;

    close() {
        this.show = false;
    }

    showNotification() {
        this.show = true;
        if (this.duration > 0) {
            setTimeout(() => {
                this.show = false;
            }, this.duration);
        }
    }
} 