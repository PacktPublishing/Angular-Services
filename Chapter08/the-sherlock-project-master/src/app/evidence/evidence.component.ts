import {Component, OnInit, ViewChild} from '@angular/core';
import {EvidenceService} from "./evidence.service";
import {AngularFire, FirebaseObjectObservable} from "angularfire2";
import {ModalComponent} from "../modal/modal.component";

@Component({
  selector: 'sh-evidence',
  templateUrl: 'evidence.html',
  styleUrls  : ['./app/evidence/evidence.css']
})

export class EvidenceComponent implements OnInit{
  @ViewChild(ModalComponent) modal: ModalComponent;
  private angularFire;
  private evidenceService;
  private newsItems;
  private supportKeywords;
  private mainKeyword;
  private clusterKeywords;
  private network: FirebaseObjectObservable <any>;

  constructor (es:EvidenceService, af: AngularFire) {
    this.evidenceService = es;
    this.angularFire = af;
    this.network = af.database.object('Evidence/Corpus/network-graph');
  }

  ngOnInit() {
    // this.modal.visNetwork = 'test';
    this.angularFire.database.list('/Notifier/rated-news', {
      query: {
        orderByChild: 'rank',
        limitToFirst: 5 // lets fetch 5 items
      }})
      .subscribe(data => {
          this.newsItems = data;
        }
      );
  }

  onSelect(item, isRadio){
    let url = isRadio?item.link:item;
    this.evidenceService.wordAnalyzer(url);
  }

  onIDFs() {
    this.evidenceService.saveIDFs(this.mainKeyword);
  }

  buildCorpus() {
    this.evidenceService.corpusBuilder(this.mainKeyword, this.supportKeywords);
  }

  buildClusters() {
    const self = this;
    this.evidenceService.clusterBuilder(this.mainKeyword, this.clusterKeywords)
    .then(data => {
      setTimeout(function() {
        self.network.set(data[0]);
        self.modal.showModal(data[0]);
      }, 35000);
      // this.visNetworkService.setData("idOfYourNetwork", data);
    });
  }
}
