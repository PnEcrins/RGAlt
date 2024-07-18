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
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterLink,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  router = inject(Router);
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  error: String | null = null;

  onLogin() {
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {
      this.authService
        .login({
          email: this.emailFormControl.value!,
          password: this.passwordFormControl.value!,
        })
        .subscribe({
          next: (success: any) => {
            console.log('success', success);
            this.snackBar.open('Vous êtes connecté', '', { duration: 2000 });
            this.authService.saveToken(success.access);
            this.authService.saveRefreshToken(success.refresh);
            this.authService.checkAuth();
            this.router.navigate(['..']);
          },
          error: (error: any) => {
            console.log(error);
            this.error = error.toString();
            console.log(this.error);
          },
        });
    }
  }
}
