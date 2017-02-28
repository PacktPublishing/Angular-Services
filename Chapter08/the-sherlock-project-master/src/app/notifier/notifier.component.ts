import {Component} from '@angular/core';
import {NotifierConfig} from './notifier.config';
import {
  AngularFire, FirebaseObjectObservable, FirebaseListObservable
} from 'angularfire2';
import {NotifierService} from "./notifier.service";

@Component({
  selector: 'sh-notifier',
  templateUrl: './notifier.html'
})
export class NotifierComponent {
  private notify   = [true, false];
  private notifier = ['app', 'email'];
  private threshold= ['high rated', 'medium rated', 'low rated'];
  private model    = new NotifierConfig(false,'app','low rated');
  private config: FirebaseObjectObservable<any>;
  private ratedNews: FirebaseListObservable<any>;
  private notifierService: NotifierService;


  constructor(af: AngularFire, ns: NotifierService) {
    this.config = af.database.object('/Notifier/config', {preserveSnapshot: true});
    this.ratedNews = af.database.list('Notifier/rated-news');
    this.notifierService = ns;
    this.updateUI();
  }

  updateUI() {
    this.config.subscribe(snapshot => {
      if(snapshot.exists()) {
        //object exists
        this.model = {
          'notify':   snapshot.val().notify,
          'notifier': snapshot.val().notifier,
          'threshold': snapshot.val().threshold
        };
      } else {
        //object doesn't exist
        this.config.set(this.model);
      }
      var notify   = this.model.notify;
      var notifier = this.model.notifier;
      var threshold = this.model.threshold;
      if(notify == true)
        this.notifierService.scheduler(notifier, threshold);
    });
  }

  // Todo: Listen to element's change event and persist any
  // change to the Firebase Database
  updateDB(value) {
    switch(value) {
      case true || false:
        this.model.notify = value;
        break;
      case 'email' || 'app':
        this.model.notifier = value;
        break;
      case 'high rated' || 'medium rated' || 'low rated':
        this.model.threshold = value;
        break;
    }
    this.config.update(this.model);
  }
}
