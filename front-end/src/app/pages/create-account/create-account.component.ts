import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterLink,
    MatSnackBarModule,
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  firstNameFormControl = new FormControl('', [Validators.required]);
  lastNameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  confirmPasswordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  passwordError = false;

  router = inject(Router);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.passwordFormControl.valueChanges.subscribe((value) => {
      if (
        this.passwordError &&
        value === this.confirmPasswordFormControl.value
      ) {
        this.passwordError = false;
      }
    });
    this.confirmPasswordFormControl.valueChanges.subscribe((value) => {
      if (this.passwordError && this.passwordFormControl.value === value) {
        this.passwordError = false;
      }
    });
  }

  onCreateAccount() {
    if (
      this.passwordFormControl.value === this.confirmPasswordFormControl.value
    ) {
      this.passwordError = false;
      if (
        this.emailFormControl.valid &&
        this.firstNameFormControl.valid &&
        this.lastNameFormControl.valid &&
        this.passwordFormControl.valid &&
        this.confirmPasswordFormControl.valid
      ) {
        this.authService
          .createAccount({
            email: this.emailFormControl.value!,
            last_name: this.lastNameFormControl.value!,
            first_name: this.firstNameFormControl.value!,
            password: this.passwordFormControl.value!,
          })
          .subscribe({
            next: (success) => {
              console.log('success', success);
              this.snackBar.open('Compte créé', '', { duration: 2000 });
              this.router.navigate(['/se-connecter']);
            },
            error: (error) => {
              console.log('error', error);
            },
          });
      }
    } else {
      this.passwordError = true;
    }
  }
}
