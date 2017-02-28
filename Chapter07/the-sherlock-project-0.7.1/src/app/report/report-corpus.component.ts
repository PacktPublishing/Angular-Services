import {Component, Input} from '@angular/core';

@Component({
  selector: 'sh-report-corpus',
  templateUrl: './report-corpus.html',
  styleUrls: ['./report-corpus.css']
})

export class ReportCorpusComponent {
  @Input() corpus: {};
  constructor() {}
}
