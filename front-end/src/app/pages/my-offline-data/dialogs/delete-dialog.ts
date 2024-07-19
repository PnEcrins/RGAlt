import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  selector: 'delete-dialog',
  templateUrl: 'delete-dialog.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialog {
  dialogRef = inject(MatDialogRef<DeleteDialog>);
  data = inject<{ name: string }>(MAT_DIALOG_DATA);

  deleteCancel() {
    this.dialogRef.close();
  }
  deleteConfirm() {
    this.dialogRef.close({ deleted: true });
  }
}
