import {Routes} from '@angular/router';
import {CollectorComponent} from "./collector/collector.component";
import {RatingComponent} from "./rating/rating.component";
import {NotifierComponent} from "./notifier/notifier.component";
import {EvidenceComponent} from "./evidence/evidence.component";
import {AiComponent} from "./ai/ai.component";

export const rootRouterConfig: Routes = [
  {path: '', redirectTo: 'collector', pathMatch: 'full'},
  {path: 'collector', component: CollectorComponent},
  {path: 'rating', component: RatingComponent},
  {path: 'notifier', component: NotifierComponent},
  {path: 'evidence', component: EvidenceComponent},
  {path: 'ai', component: AiComponent},
];
