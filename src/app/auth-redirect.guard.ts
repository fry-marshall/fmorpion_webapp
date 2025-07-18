import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class AuthRedirectGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(): boolean {
    if (this.cookieService.get('access_token') && this.cookieService.get('refresh_token')) {
      this.router.navigate(['/game-options']);
      return false;
    }
    return true;
  }
}
