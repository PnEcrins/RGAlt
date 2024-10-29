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
  selector: 'delete-observation-dialog',
  templateUrl: 'delete-observation-dialog.html',
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
export class DeleteObservationDialog {
  dialogRef = inject(MatDialogRef<DeleteObservationDialog>);
  data = inject<{ title: string; content: string }>(MAT_DIALOG_DATA);

  deleteCancel() {
    this.dialogRef.close();
  }
  deleteConfirm() {
    this.dialogRef.close({ deleted: true });
  }
}
