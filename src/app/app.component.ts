import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './route-animations';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideInAnimation]
})
export class AppComponent {
  animationDirection: 'forward' | 'backward' = 'forward';
  private previousIndex = 0;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.router.routerState.root.firstChild;
        const currentIndex: number = currentRoute?.snapshot.data?.['index'] ?? 0;
        
        this.animationDirection = currentIndex >= this.previousIndex ? 'forward' : 'backward';
        this.previousIndex = currentIndex;
      });
  }
}
