import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { DeleteAccountDialog } from './dialogs/delete-account-dialog';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-account',
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
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
  readonly dialog = inject(MatDialog);
  email = 'adresse@email.com';
  lastName = 'Nom';
  firstName = 'Prénom';

  authService = inject(AuthService);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  openDeleteAccountDialog() {
    const deleteDialogRef = this.dialog.open(DeleteAccountDialog);

    deleteDialogRef.afterClosed().subscribe((result) => {
      if (result && result.delete) {
        this.authService.deleteAccount().subscribe({
          next: (success: any) => {
            this.authService.removeToken();
            this.authService.removeRefreshToken();
            this.authService.checkAuth();
            this.snackBar.open('Votre compte est supprimé', '', {
              duration: 2000,
            });
            this.router.navigate(['..']);
          },
          error: () => {},
        });
      }
    });
  }
}
