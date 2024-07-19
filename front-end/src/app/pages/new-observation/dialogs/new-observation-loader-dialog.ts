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
  selector: 'new-observation-loader-dialog',
  templateUrl: 'new-observation-loader-dialog.html',
  styleUrl: './new-observation-loader-dialog.scss',
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
export class NewObservationLoaderDialog {
  dialogRef = inject(MatDialogRef<NewObservationLoaderDialog>);
  data = inject<{ title: string }>(MAT_DIALOG_DATA);
}
