import { Component } from '@angular/core';
import { LicencesComponent } from '../../components/licences/licences.component';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [LicencesComponent],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
})
export class LegalNoticeComponent {}
