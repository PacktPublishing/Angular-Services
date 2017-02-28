import {Component} from '@angular/core';
import {CollectorService} from './collector.service';
import {AngularFire, FirebaseListObservable} from "angularfire2";

@Component({
  selector: 'sh-collector',
  templateUrl: './collector.html'
  // providers: []
})
export class CollectorComponent {
  caption = "Some news worth investigating";
  headlines;

  private items: FirebaseListObservable<any>;

  constructor (collectorService: CollectorService, af: AngularFire) {
    collectorService.getHeadlines()
      .subscribe(
        data => {
          this.headlines = data;
        }
      );
    this.items = af.database.list('/Collector');
  }

  onChange(item){
    this.items.push(item);
  }
}
