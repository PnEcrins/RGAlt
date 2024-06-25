import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import observationsTypes from './types.json';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
  dialogRef = inject(MatDialogRef<FilterDialog>);
  observationTypesForm = new FormControl('');
  observationTypes: any = observationsTypes;
  readonly observationsDates = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  filterCancel() {
    this.dialogRef.close();
  }
  filterConfirm() {
    this.dialogRef.close({ filter: true });
  }
}
