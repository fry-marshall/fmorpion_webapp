import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-landing-view',
  imports: [],
  templateUrl: './landing-view.component.html',
  styleUrl: './landing-view.component.scss'
})
export class LandingViewComponent implements OnInit {

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/auth'])
    }, 3000);
  }

}
