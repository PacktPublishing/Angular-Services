import {Routes} from '@angular/router';
import {CollectorComponent} from "./collector/collector.component";
import {RatingComponent} from "./rating/rating.component";
import {NotifierComponent} from "./notifier/notifier.component";

export const rootRouterConfig: Routes = [
  {path: '', redirectTo: 'collector', pathMatch: 'full'},
  {path: 'collector', component: CollectorComponent},
  {path: 'rating', component: RatingComponent},
  {path: 'notifier', component: NotifierComponent}
];
