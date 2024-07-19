import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FilterDialog } from '../../synthesis-interface/dialogs/filter-dialog';

@Component({
  selector: 'delete-account-dialog',
  templateUrl: 'delete-account-dialog.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './delete-account-dialog.scss',
})
export class DeleteAccountDialog {
  dialogRef = inject(MatDialogRef<FilterDialog>);

  deleteAccountCancel() {
    this.dialogRef.close({ cancel: true });
  }

  deleteAccountConfirm() {
    this.dialogRef.close({ delete: true });
  }
}
