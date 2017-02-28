import {Component, OnInit} from '@angular/core';
import {FirebaseListObservable, AngularFire, FirebaseObjectObservable} from "angularfire2";
import {ReportConfig} from "./report.config";
import {ReportService} from "./report.service";

@Component({
  selector: 'sh-report',
  templateUrl: './report.html'
})
export class ReportComponent implements OnInit {
  private reportService: ReportService;
  private templates: FirebaseListObservable<any>;
  private stats: FirebaseObjectObservable <any>;
  private items = [];
  private reports = [];

  constructor(rs:ReportService, af: AngularFire) {
    this.reportService = rs;
    this.templates = af.database.list('/Report/templates');
    this.stats = af.database.object('Evidence/Corpus/Stats', {preserveSnapshot: true});
  }

  ngOnInit() {
    this.templates.subscribe(data => {
      this.items = data;
      // empty the reports array otherwise any changes in the template page
      // adds new entries to the array and you will end up with duplicates.
      this.reports = [];
      this.items.forEach(item => this.setReport(item));
    });
  }

  setReport(template) {
    console.log(this.setCluster(template));
    this.reports.push({
      general: this.setGeneral(template),
      corpus:  this.setCorpus(template),
      cluster: this.setCluster(template)
    });
  }

  setGeneral(template) {
    let general = {};
    this.stats.subscribe(snapshot => {
      if (snapshot.exists()) {
        //object exists
        general['mainKeyword'] = snapshot.val().mainKeyword;
        general['corpusSize'] =  template.corpusSize?snapshot.val().corpusSize:null;
        general['vocabularySize'] = template.vocabularySize?snapshot.val().vocabularySize:null;
      }
    });
    return general;
  }

  setCorpus(template) {
    return this.reportService.setCorpus(template);
  }

  setCluster(template) {
    return this.reportService.setCluster(template);
  }

  newReportTemplate() {
    this.templates.push(new ReportConfig('untitled333', false,
      false, false, 0, 0, false, false, false, false, false,
      {show: false, size: false, distance: false, url: false}, 0, 0)
    );
  }

  printReport (id) {
    let print = window.open('', '', '');
    print.document.write('<html><title>Print</title><body>');
    print.document.write(document.getElementById(id).innerHTML);
    print.document.write('</body></html>');
    print.document.close();
    print.print();
    return true;
  }

  onSaveReportTemplate(report) {
    // console.log(report);
    var key = report.$key;
    delete report.$key;
    delete report.$exists;
    this.templates.update(key, report);
  }

  onDeleteReportTemplate(report) {
    this.templates.remove(report.$key);
  }
}
