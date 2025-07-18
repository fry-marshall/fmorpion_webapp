import { Component, effect, inject } from '@angular/core';
import { PlayerStore, Status } from '../player.store';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AuthDto } from '../auth.dto';
import { environment } from '../../../environments/environment';
import { NotificationComponent, NotificationType } from '../../notification.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../player.service';
import { HttpService } from '../../../../library_v2/src/app/services/http.service';

@Component({
  selector: 'app-signin',
  imports: [NotificationComponent, ReactiveFormsModule, CommonModule],
  providers: [PlayerStore, PlayerService, HttpService],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  signInForm = new FormGroup({
    pseudo: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  validationErrors: { [key: string]: string } = {};
  playerStore = inject(PlayerStore);
  Status = Status;

  // Notification properties
  notificationMessage = '';
  notificationType: NotificationType = 'success';
  showNotification = false;

  constructor(private readonly router: Router, private readonly cookieService: CookieService) {
    effect(() => {
      const status = this.playerStore.status();
      if (status === Status.SUCCESS) {
        const tokens = this.playerStore.tokens();

        this.cookieService.set(
          'access_token',
          tokens.access_token!,
          undefined,
          '/',
          /*environment.cookieDomain,
          environment.cookieSecure, */
        );

        this.cookieService.set(
          'refresh_token',
          tokens.refresh_token!,
          undefined,
          '/',
          /* environment.cookieDomain,
          environment.cookieSecure, */
        );

        // requests

        this.signInForm.reset();
        this.router.navigate(['/game-options']);
      } else if (status === Status.ERROR) {
        switch (this.playerStore.error()?.statusCode) {
          case 404:
            this.showErrorNotification('Pseudo not found');
            break;
          default:
            this.showErrorNotification('An error has occured');
            break;
        }
      }
    });
  }

  onSubmit() {
    // Reset the notification and errors on each submission
    this.validationErrors = {};

    if (this.signInForm.valid) {
      const formData = this.signInForm.value;
      const signInDto = plainToInstance(AuthDto, formData);
      const errors = validateSync(signInDto);

      if (errors.length > 0) {
        errors.forEach(error => {
          if (error.constraints) {
            this.validationErrors[error.property] = Object.values(error.constraints)[0];
          }
        });
        //this.showErrorNotification('Veuillez corriger les erreurs du formulaire');
      } else {
        this.playerStore.signin(signInDto);
      }
    }
  }

  private showErrorNotification(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }
}
