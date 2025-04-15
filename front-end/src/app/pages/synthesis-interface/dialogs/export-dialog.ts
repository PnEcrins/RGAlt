import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'export-dialog',
  templateUrl: 'export-dialog.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatProgressSpinnerModule,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './filter-dialog.scss',
})
export class ExportDialog {
  data = inject<{
    nbObservations: number;
    downloadObservations: Observable<any>;
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ExportDialog>);
  exportSubscription: Subscription | null = null;
  isExporting = false;

  filterCancel() {
    this.dialogRef.close({ cancel: true });
  }

  exportObservations() {
    this.isExporting = true;
    this.dialogRef.disableClose = true;

    this.exportSubscription = this.data?.downloadObservations.subscribe({
      next: (jsonData) => {
        try {
          const jsonString =
            typeof jsonData === 'string'
              ? jsonData
              : JSON.stringify(jsonData, null, 2);

          const blob = new Blob([jsonString], {
            type: 'application/json;charset=utf-8',
          });

          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = 'observations_export.json';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
        } finally {
          this.isExporting = false;
          this.dialogRef.close();
        }
      },
      error: () => {
        this.isExporting = false;
        this.dialogRef.close();
      },
    });
  }

  ngOnDestroy() {
    this.exportSubscription?.unsubscribe();
  }
}
