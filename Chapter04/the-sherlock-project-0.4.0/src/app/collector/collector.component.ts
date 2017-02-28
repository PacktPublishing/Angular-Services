import {Component} from '@angular/core';
import {CollectorService} from './collector.service';
import {FirebaseListObservable, AngularFire} from "angularfire2";
import {OrderByPipe} from "../pipes/orderby.pipe";
@Component({
  selector: 'sh-collector',
  templateUrl: './collector.html',
  providers: [CollectorService],
  pipes: [OrderByPipe]
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
