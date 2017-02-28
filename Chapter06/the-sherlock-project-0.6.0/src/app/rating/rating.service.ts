import {Injectable} from "@angular/core";
import {
  FirebaseListObservable, AngularFire
} from "angularfire2";
import {RatingLogic} from "./rating.logic";

@Injectable()
export class RatingService {
  private news: FirebaseListObservable<any>;
  private rl;
  private trends;
  protected numberOfTrends = 20;

  constructor(af: AngularFire, rl: RatingLogic) {
    this.news = af.database.list('/Collector');
    this.rl   = rl;
    this.trends =rl.getTrends(this.numberOfTrends)
  }

  getNews() {
    return this.news;
  }

  getTrends() {
    return this.trends;
  }

  rateNews() {
    var news = [];
    var self = this;
    // console.log(this.news._ref.once("value"));
    // first get a reference to the value part of news object
    this.news.subscribe(
      snapshots => {
        snapshots.forEach (function (snapshot) {
          var newsRank;
          // save individual news components in a set of variables
          var title = snapshot.title;
          var desc = snapshot.description;
          var date = snapshot.pubDate;
          var link = snapshot.link;
          // calculate the news rank
          newsRank = self.rl.rateTrends(title+' '+desc) + self.rl.rateDate(date);
          // push the ranked news into an array of news objects
          news.push({
            'title':title,
            'descrition': desc,
            'rank': newsRank,
            'link': link
          });
        })
      }
    );
    return news;
  }
}
