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

export const firebaseConfig = {
  apiKey: "AIzaSyA8C9a7wZ9r-5BsMXJbP3-6_raliTVkHpk",
  authDomain: "the-sherlock-project.firebaseapp.com",
  databaseURL: "https://the-sherlock-project.firebaseio.com",
  storageBucket: "the-sherlock-project.appspot.com"
}

export const sendGridConfig = {
  apiKey: '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'
}

@NgModule({
  declarations: [
    AppComponent, NavigationComponent, CollectorComponent,
    RatingComponent, NotifierComponent, OrderByPipe
  ],
  schemas     : [CUSTOM_ELEMENTS_SCHEMA],
  imports     : [
    BrowserModule, FormsModule, HttpModule,
    RouterModule.forRoot(rootRouterConfig),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers   : [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    CollectorService, RatingService, RatingLogic, NotifierService
  ],
  bootstrap   : [AppComponent]
})
export class AppModule {

}
