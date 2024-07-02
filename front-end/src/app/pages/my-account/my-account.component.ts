import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { DeleteAccountDialog } from './dialogs/delete-account-dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
  readonly dialog = inject(MatDialog);
  email = 'adresse@email.com';
  authService = inject(AuthService);
  router = inject(Router);

  openDeleteAccountDialog() {
    const deleteDialogRef = this.dialog.open(DeleteAccountDialog);

    deleteDialogRef.afterClosed().subscribe((result) => {
      if (result && result.delete) {
        this.authService.logout();
        this.router.navigate(['..']);
      }
    });
  }
}
