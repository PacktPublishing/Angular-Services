import {Injectable} from '@angular/core';
import {Http} from "@angular/http";

@Injectable()
export class RatingLogic {
  private url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20%20from%20json%20where%20url%3D%22http%3A%2F%2Fhawttrends.appspot.com%2Fapi%2Fterms%2F%22&format=json&diagnostics=true&callback=';
  private http;
  private trends;

  constructor(http: Http) {
    this.http = http;
  }

  getTrends (count) {
    var trends = [];
    this.http.get(this.url)
      .toPromise()
      .then(res => res.json())
      .then(data => data.query.results.json._)
      .then(function(data) {
        for (var i=0; i<count; i++)
          trends.push({'keyword':data[i], 'rank': count-i});
      });
    this.trends = trends;
    return trends;
  }

  rateTrends(newsItem) {
    var trendsRank = 0;
    this.trends.forEach(
      function (trend) {
        if(newsItem.indexOf(trend.keyword)>0){
          trendsRank += trend.rank;
        }
      });
    return trendsRank;
  }

  rateDate(newsDate) {
    var last24Hours = 86400000; // 24*60*60*1000
    var now = new Date().getTime();
    var then= new Date(newsDate).getTime();
    if((now - then) < last24Hours)
      return 1;
    return 0;
  }
}
