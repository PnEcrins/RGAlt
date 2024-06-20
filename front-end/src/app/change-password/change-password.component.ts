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
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
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

  onChangePassword() {
    if (
      this.passwordFormControl.value === this.confirmPasswordFormControl.value
    ) {
      this.passwordError = false;
      if (
        this.passwordFormControl.valid &&
        this.confirmPasswordFormControl.valid
      ) {
        this.authService.logout();
        this.router.navigate(['/se-connecter']);
      }
    } else {
      this.passwordError = true;
    }
  }
}
