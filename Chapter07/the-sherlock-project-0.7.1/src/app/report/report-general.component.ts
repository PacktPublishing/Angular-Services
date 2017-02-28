import {Component, Input} from '@angular/core';

@Component({
  selector: 'sh-report-general',
  templateUrl: './report-general.html',
  styleUrls: ['./report-general.css']
})
export class ReportGeneralComponent {
  @Input() general: {};
  constructor() {}
}
