import {Http} from '@angular/http';
import {Injectable} from "@angular/core";

@Injectable()
export class CollectorService {
  private url = 'https://query.yahooapis.com/v1/public/yql?q=select%20title%2Clink%2Cdescription%2CpubDate%20from%20rss%20where%20url%3D%22http%3A%2F%2Frss.cnn.com%2Frss%2Fedition.rss%3Fformat%3Dxml%22&format=json&diagnostics=true&callback=';
  private http;

  constructor(http: Http) {
    this.http = http;
  }

  getHeadlines() {
    return this.http.get(this.url)
      .map(res => res.json())
      .map(data => data.query.results.item);
  }
}
