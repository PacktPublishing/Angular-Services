import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core'
import {RouterModule} from "@angular/router";
import {rootRouterConfig} from "./app.routes";
import {AppComponent} from "./app";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {NavigationComponent} from "./navigation/navigation.component";
import {CollectorComponent} from "./collector/collector.component";
import {RatingComponent} from "./rating/rating.component";
import {NotifierComponent} from "./notifier/notifier.component";
import {AngularFireModule} from 'angularfire2';
import {OrderByPipe} from "./pipes/orderby.pipe";
import {NotifierService} from "./notifier/notifier.service";
import {CollectorService} from "./collector/collector.service";
import {RatingService} from "./rating/rating.service";
import {RatingLogic} from "./rating/rating.logic";
import {EvidenceComponent} from "./evidence/evidence.component";
import {EvidenceService} from "./evidence/evidence.service";
import {VisModule} from 'ng2-vis';
import {ModalComponent} from './modal/modal.component';
import {ReportComponent} from "./report/report.component";
import {ReportTemplateComponent} from "./report/report-template.component";
import {ReportGeneralComponent} from "./report/report-general.component";
import {ReportCorpusComponent} from "./report/report-corpus.component";
import {ReportClusterComponent} from "./report/report-cluster.component";
import {ReportService} from "./report/report.service";
import {AccuracyComponent} from "./accuracy/accuracy.component";
import {AccuracyService} from "./accuracy/accuracy.service";

export const firebaseConfig = {
  apiKey: "AIzaSyA8C9a7wZ9r-5BsMXJbP3-6_raliTVkHpk",
  authDomain: "the-sherlock-project.firebaseapp.com",
  databaseURL: "https://the-sherlock-project.firebaseio.com",
  storageBucket: "the-sherlock-project.appspot.com"
};

export const sendGridConfig = {
  apiKey: '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'
};

export const googleSearchConfig = {
  apiKey: 'AIzaSyA8C9a7wZ9r-5BsMXJbP3-6_raliTVkHpk',
  cx    : '001410267427255255168:nfviboevhri'
};

export const timeSpans = [
  {"span":"d1", "sort":"date:d"},
  //{"span":"w1", "sort":"date:a"},
  {"span":"m1", "sort":"date:a"},
  //{"span":"m6", "sort":"date:a"},
  {"span":"y1", "sort":"date:a"},
  {"span":"y10","sort":"date:a"}
];

export let preventions = [];

export const articleRange = {min: 100, max: 10000}; // characters

@NgModule({
  declarations: [
    AppComponent, NavigationComponent, CollectorComponent,
    RatingComponent, NotifierComponent, EvidenceComponent,
    OrderByPipe, ModalComponent, ReportComponent,
    ReportTemplateComponent, ReportGeneralComponent,
    ReportCorpusComponent, ReportClusterComponent,
    AccuracyComponent
  ],
  schemas     : [CUSTOM_ELEMENTS_SCHEMA],
  imports     : [
    BrowserModule, FormsModule, HttpModule,
    RouterModule.forRoot(rootRouterConfig),
    AngularFireModule.initializeApp(firebaseConfig),
    VisModule
  ],
  providers   : [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    CollectorService, RatingService, RatingLogic, NotifierService,
    EvidenceService, ReportService, AccuracyService
  ],
  bootstrap   : [AppComponent]
})
export class AppModule {

}
