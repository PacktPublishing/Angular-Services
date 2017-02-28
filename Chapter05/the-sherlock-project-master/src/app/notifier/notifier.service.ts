import {Injectable} from '@angular/core';
import {CollectorService} from '../collector/collector.service';
import {RatingService} from '../rating/rating.service';
import {FirebaseListObservable, AngularFire} from 'angularfire2';
import {Http, Headers, Response, RequestOptions} from "@angular/http";

@Injectable()
export class NotifierService {
  private cron = require('node-cron');
  private collectorService;
  private ratingService;
  private angularFire;
  private task;
  private threshold = [1, 5, 10];
  private items: FirebaseListObservable<any>;
  private maintenance: FirebaseListObservable<any>;
  private eraseFactor = 72; // 3 days (72 hours)
  private http;

  constructor(cs: CollectorService, rs: RatingService,
              af: AngularFire, http: Http) {
    this.collectorService = cs;
    this.ratingService = rs;
    this.angularFire = af;
    this.http = http;
    this.items =this.angularFire.database.list('/Notifier/rated-news');
    // this.items.remove();
  }

  scheduler(notifier: string, threshold: string) {
    // stop previous tasks first, otherwise you will have
    // multiple notifiers with different settings running
    //   console.log('env:'+sendGridConfig.apiKey);

    if(this.task != null)
      this.task.stop();
    var self = this;
    this.task = this.cron.schedule('*/20 * * * *', function () {
        self.removeOldNews();
        self.collectRateNotify(notifier, threshold);
      });
  }

  collectRateNotify(notifier, threshold) {
    var self = this;
    var thresholdRank = this.thresholdToRank(threshold);
    this.items = this.angularFire.database
      .list('/Notifier/rated-news');
    this.collectorService.getHeadlines().subscribe(
      data => { data.forEach((item: any) => {
        var trendRank = self.ratingService.rl.rateTrends(  item.title + item.description);
        var dateRank  = self.ratingService.rl.rateDate(item.pubDate);
        var newsRank  = trendRank + dateRank;
        console.log(
          'newsRank:'+newsRank,
          'date:'+dateRank,
          'trendRank:'+trendRank,
          'thresholdRank:'+thresholdRank
        );
        if (newsRank >= thresholdRank) {
          var ratedItem = {
            'title': item.title,
            'description': item.description?item.description:'',
            'rank': newsRank,
            'date': item.pubDate?item.pubDate:'',
            'link': item.link
          };
          self.items.push(ratedItem);
          if (notifier == 'email'){
            this.emailNotification(ratedItem);
          }
        }
      });

    })
  }

  thresholdToRank(threshold) {
    var rank = this.threshold[0];
    if (threshold == 'high rated')
      rank = this.threshold[2];
    else if (threshold == 'medium rated')
      rank = this.threshold[1];
    return rank;
  }

  removeOldNews() {
    var self = this;
    this.maintenance = this.angularFire.database
      .list('/Notifier/rated-news', {preserveSnapshot: true});
    this.maintenance.subscribe(snapshots => {
      snapshots.forEach(
        function (snapshot) {
          var date = snapshot.val().date;
          if (self.isOldNews(date) == true)
            self.maintenance.remove(snapshot.key);
        })
    });
  }

  isOldNews(newsDate) {
    if (!newsDate)
      return false;
    else {
      var eraseFactor = this.eraseFactor *60 * 60 * 1000;
      var now = new Date().getTime();
      var then= new Date(newsDate).getTime();
      if((now - then) > eraseFactor) {
        // console.log(now - then);
        return true;
      }
    }
    return false;
  }

  emailNotification(ratedItem) {
    var headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
    var options = new RequestOptions({headers: headers});
    var body = 'message=Hi,\n there is a new rated item in firebase database with following details:\n'+
      'title: '+ ratedItem.title +'\n'+
      'description: '+ ratedItem.description+'\n'+
      'rank: '+ ratedItem.rank+'\n'+
      'date: '+ ratedItem.date+'\n'+
      'link: '+ ratedItem.link+'\n'+
      'Please click on the link if you are interested to know more about this news item.';

    this.http.post('http://localhost:80/mail.php', body, options)
      .subscribe(res => {
        console.log('post result %o', res);
      })
  }


    //   --url https://api.sendgrid.com/v3/mail/send \
  //     --header 'Authorization: Bearer YOUR_API_KEY' \
  // --header 'Content-Type: application/json' \
  // --data '{"personalizations": [{"to": [{"email": "YOU@sendgrid.com"}]}],"from": {"email": "dx@sendgrid.com"},"subject": "Hello, World!","content": [{"type": "text/plain", "value": "Heya!"}]}'

    // var headers = new Headers();
    // headers.append('Authorization', 'Bearer '+sendGridConfig.apiKey);
    // headers.append('Content-Type', 'application/json');
    // var data = JSON.stringify('{"personalizations": [{"to": [{"email": "sohail2d@gmail.com"}]}],"from": {"email": "sohail_salehi@hotmail.com"},"subject": "Hello, World!","content": [{"type": "text/plain", "value": "Heya!"}]}');
    // return this.http.post('https://api.sendgrid.com/v3/mail/send', data, {headers: headers})
    //   .map((res: Response) => res.json());
    // var sg = new SendGrid()(sendGridConfig.apiKey);
    //
    // var f = new this.mail.Email("t@t.com");
    // var t = new this.mail.Email("sohail2d@gmail.com");
    //
    // // from_email = new this.helper.Email("test@example.com");
    // // to_email = new this.helper.Email("sohail2d@gmail.com");
    // var subject = "Sending with SendGrid is Fun";
    // var content = new this.mail.Content(
    //   "text/plain", "and easy to do anywhere, even with Node.js"
    // );
    // var mail = new this.mail.Mail(f, subject, t, content);
    //
    // var request = sg.emptyRequest({
    //   method: 'POST',
    //   path: '/v3/mail/send',
    //   body: mail.toJSON()
    // });
    //
    // sg.API(request, function(error, response) {
    //   console.log(response.statusCode);
    //   console.log(response.body);
    //   console.log(response.headers);
    // })
    //
  //}
}
