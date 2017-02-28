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
    // first get a reference to the value part of news object
    this.news._ref.once("value")
    // then loop through each news item
      .then(snapshots => { snapshots.forEach(
        function(snapshot) {
          var newsRank;
          // save individual news components in a set of variables
          var title = snapshot.child("title").val();
          var desc = snapshot.child("description").val();
          var date = snapshot.child("pubDate").val();
          var link = snapshot.child("link").val();
          // calculate the news rank
          newsRank = self.rl.rateTrends(title+' '+desc) + self.rl.rateDate(date);
          // push the ranked news into an array of news objects
          news.push({
            'title':title,
            'descrition': desc,
            'rank': newsRank,
            'link': link
          });
        })});
    return news;
  }
}
