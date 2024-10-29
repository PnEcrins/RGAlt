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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'my-observation-loader-dialog',
  templateUrl: 'my-observation-loader-dialog.html',
  styleUrl: './my-observation-loader-dialog.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyObservationLoaderDialog {
  dialogRef = inject(MatDialogRef<MyObservationLoaderDialog>);
  data = inject<{ title: string }>(MAT_DIALOG_DATA);
}
