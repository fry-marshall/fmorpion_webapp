import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../player.service';
import { PlayerStore, Status } from '../player.store';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AuthDto } from '../auth.dto';
import { HttpService } from '../../../../library_v2/src/app/services/http.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { NotificationComponent, NotificationType } from '../../notification.component';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  providers: [PlayerService, PlayerStore, HttpService, ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  signUpForm = new FormGroup({
    pseudo: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  validationErrors: { [key: string]: string } = {};
  playerStore = inject(PlayerStore);
  Status = Status;

  // Notification properties
  notificationMessage = '';
  notificationType: NotificationType = 'success';
  showNotification = false;

  constructor(private readonly router: Router, private readonly cookieService: CookieService){
    effect(() => {
      const status = this.playerStore.status();
      console.log("status", status)
      if (status === Status.SUCCESS) {
        const tokens = this.playerStore.tokens();

        this.cookieService.set(
          'access_token',
          tokens.access_token!,
          undefined,
          '/',
          /* environment.cookieDomain,
          environment.cookieSecure, */
        );

        this.cookieService.set(
          'refresh_token',
          tokens.refresh_token!,
          undefined,
          '/',
         /*  environment.cookieDomain,
          environment.cookieSecure, */
        );

        // requests

        this.signUpForm.reset();
        this.router.navigate(['/game-options']);
      } else if (status === Status.ERROR) {
        switch (this.playerStore.error()?.statusCode) {
          case 400:
            this.showErrorNotification('An error has occured.\nPlease verify field informations');
            break;
          case 409:
            this.showErrorNotification('Pseudo already exist');
            break;
          default:
            this.showErrorNotification('An error has occured, Try again later');
            break;
        }
      }
    });
  }

  onSubmit() {
    // Reset the notification and errors on each submission
    this.validationErrors = {};

    if (this.signUpForm.valid) {
      const formData = this.signUpForm.value;
      console.log("formData", formData)
      const signupDto = plainToInstance(AuthDto, formData);
      const errors = validateSync(signupDto);

      if (errors.length > 0) {
        errors.forEach(error => {
          if (error.constraints) {
            this.validationErrors[error.property] = Object.values(error.constraints)[0];
          }
        });
        //this.showErrorNotification('Veuillez corriger les erreurs du formulaire');
      } else {
        this.playerStore.signup(signupDto);
      }
    }
  }

  private showErrorNotification(message: string) {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
  }
}
