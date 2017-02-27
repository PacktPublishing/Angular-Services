import {Component} from '@angular/core';

@Component({
  selector: 'sh-notifier',
  templateUrl: './notifier.html'
})
export class NotifierComponent {
  data = {
    collector: "collecting data",
    rating: "rating data"
  };
}
