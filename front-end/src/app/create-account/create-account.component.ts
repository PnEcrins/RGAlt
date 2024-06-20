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
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
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
        this.passwordFormControl.valid &&
        this.confirmPasswordFormControl.valid
      ) {
        this.router.navigate(['/se-connecter']);
      }
    } else {
      this.passwordError = true;
    }
  }
}
