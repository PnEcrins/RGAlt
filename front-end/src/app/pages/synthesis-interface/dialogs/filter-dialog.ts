import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SettingsService } from '../../../services/settings.service';
import { ObservationTypes } from '../../../types/types';

@Component({
  selector: 'filter-dialog',
  templateUrl: 'filter-dialog.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './filter-dialog.scss',
})
export class FilterDialog {
  data = inject<{
    observationTypes: any[];
    observationDates: { start: any; end: any };
  }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<FilterDialog>);
  observationsTypesForm = new FormControl(this.data.observationTypes);
  readonly observationsDates = new FormGroup({
    start: new FormControl(this.data.observationDates.start),
    end: new FormControl(this.data.observationDates.end),
  });

  settingsService = inject(SettingsService);

  observationsTypes: ObservationTypes =
    this.settingsService.settings.value!.categories;

  filterCancel() {
    this.dialogRef.close({ cancel: true });
  }

  filterConfirm() {
    if (
      this.observationsDates.value.start &&
      !this.observationsDates.value.end
    ) {
      this.observationsDates.setErrors({ emptyEnd: true });
    } else if (
      this.observationsDates.value.end &&
      !this.observationsDates.value.start
    ) {
      this.observationsDates.setErrors({ emptyStart: true });
    } else {
      this.dialogRef.close({
        filter: {
          observationTypes: this.observationsTypesForm.value,
          observationDates: this.observationsDates.value,
        },
      });
    }
  }
}
