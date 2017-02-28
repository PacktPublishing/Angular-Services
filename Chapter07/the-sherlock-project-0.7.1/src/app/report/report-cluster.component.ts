import {Component, Input} from '@angular/core';
// import * as Vis from 'vis';
// import { VisNetworkService } from 'ng2-vis/components/network';

@Component({
  selector: 'sh-report-cluster',
  templateUrl: './report-cluster.html',
  styleUrls: ['./report-cluster.css']
})

export class ReportClusterComponent {
  @Input() cluster: {};
  // public visNetwork: string = 'reportNetwork';
  // public visNetworkData: Vis.IData;
  // public visNetworkOptions: Vis.IOptions;
  // public visNetworkService: VisNetworkService;

  constructor (/*vns: VisNetworkService*/) {
    // this.visNetworkService = vns;
    // this.visNetworkOptions = {};
    // this.visNetworkData = this.cluster.network;
  }
}
