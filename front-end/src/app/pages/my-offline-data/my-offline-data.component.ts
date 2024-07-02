import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Platform } from '@angular/cdk/platform';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DownloadDialog } from './dialogs/download-dialog';
import { DeleteDialog } from './dialogs/delete-dialog';

import areas from '../../../data/areas.json';

@Component({
  selector: 'app-my-offline-data',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './my-offline-data.component.html',
  styleUrl: './my-offline-data.component.scss',
})
export class MyOfflineDataComponent {
  readonly dialog = inject(MatDialog);

  areas = areas;

  columns: number = 2;
  breakpoints = {
    xl: 4,
    lg: 4,
    md: 2,
    sm: 2,
    xs: 1,
  };
  mobile?: boolean;

  breakpointObserver = inject(BreakpointObserver);
  platform = inject(Platform);

  ngOnInit() {
    this.mobile = this.platform.ANDROID || this.platform.IOS;

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .subscribe((breakpointState) => {
        if (breakpointState.matches) {
          if (breakpointState.breakpoints[Breakpoints.XSmall]) {
            this.columns = this.breakpoints.xs;
          } else if (breakpointState.breakpoints[Breakpoints.Small]) {
            this.columns = this.breakpoints.sm;
          } else if (breakpointState.breakpoints[Breakpoints.Medium]) {
            this.columns = this.breakpoints.md;
          } else if (breakpointState.breakpoints[Breakpoints.Large]) {
            this.columns = this.breakpoints.lg;
          } else if (breakpointState.breakpoints[Breakpoints.XLarge]) {
            this.columns = this.breakpoints.xl;
          }
        }
      });
  }

  areaClick(area: any) {
    if (area.offline) {
      this.openDeleteDialog(area);
    } else {
      this.openDownloadDialog(area);
    }
  }

  openDownloadDialog(area: any) {
    const downloadDialogRef = this.dialog.open(DownloadDialog, {
      width: '250px',
      data: { name: area.name },
    });

    downloadDialogRef.afterClosed().subscribe((result) => {
      if (result && result.downloaded) {
        area.offline = !area.offline;
      }
    });
  }

  openDeleteDialog(area: any) {
    const deleteDialogRef = this.dialog.open(DeleteDialog, {
      width: '250px',
      data: { name: area.name },
    });

    deleteDialogRef.afterClosed().subscribe((result) => {
      if (result && result.deleted) {
        area.offline = !area.offline;
      }
    });
  }
}
