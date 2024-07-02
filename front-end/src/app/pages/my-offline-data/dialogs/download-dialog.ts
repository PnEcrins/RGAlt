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
  selector: 'download-dialog',
  templateUrl: 'download-dialog.html',
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
export class DownloadDialog {
  dialogRef = inject(MatDialogRef<DownloadDialog>);
  data = inject<{ name: string }>(MAT_DIALOG_DATA);

  downloadCancel() {
    this.dialogRef.close();
  }
  downloadConfirm() {
    this.dialogRef.close({ downloaded: true });
  }
}
