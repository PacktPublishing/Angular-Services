import {Component, Input, EventEmitter, Output} from '@angular/core';
import {ReportConfig} from "./report.config";

@Component({
  selector: 'sh-report-template',
  templateUrl: './report-template.html'
})
export class ReportTemplateComponent {
  @Input('template') model: ReportConfig;
  @Output() onSaveReportTemplate = new EventEmitter<any>();
  @Output() onDeleteReportTemplate = new EventEmitter<any>();

  constructor () {}

  saveReportTemplate(model) {
    this.onSaveReportTemplate.emit(
      this.setOptions(model)
    );
  }

  deleteReportTemplate(model) {
    this.onDeleteReportTemplate.emit(model);
  }

  setOptions(model) {
    if (!model.rootNode) {
      model.clusterNode = false;
      this.deactivateNodes(model);
      return model;
    } else if (!model.clusterNode) {
      this.deactivateNodes(model);
      return model
    } else if (!model.articleNode.show) {
      this.deactivateNodes(model);
    }
    return model;
  }

  deactivateNodes(model) {
    model.articleNode = {show: false, size: false, distance: false, url: false};
    model.maxRootPhrases = 0;
    model.maxCenterPhrases = 0;
  }
}
