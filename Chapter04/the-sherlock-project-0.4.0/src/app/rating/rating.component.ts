// src/app/rating/rating.component.ts
import {Component} from '@angular/core';
import {RatingLogic} from './rating.logic';
import {RatingService} from './rating.service';

@Component({
  selector: 'sh-rating',
  templateUrl: './rating.html',
  providers: [RatingLogic, RatingService]
})
export class RatingComponent {
  private ratingService;
  private trends;
  private collectedNews;
  private ratedNews;

  constructor(rs:RatingService) {
    this.ratingService = rs;
    this.trends = rs.getTrends();
    this.collectedNews = rs.getNews();
    this.ratedNews= rs.rateNews();
  }
}
