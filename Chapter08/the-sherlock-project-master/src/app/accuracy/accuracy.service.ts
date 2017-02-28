import {Injectable} from '@angular/core';
import {preventions} from '../app.module'

@Injectable()
export class AccuracyService {
  private prevents = preventions;
  constructor() {}
  takeSnapshot(id, description, file, line, variables) {
    if (preventions.length == 0){
      preventions.push({
        id:id, description:description, file:file,
        line:line, hits:1, variables:[variables]
      })
    } else {
      let p = (preventions.find( item => item.id == id));
      if (p){
        p.hits++;
        p.variables.push(variables);
      } else {
        preventions.push({
          id:id, description:description, file:file,
          line:line, hits:1, variables:[variables]
        });
      }
    }
    console.log(preventions);
  }

  getPrevents() {
    return this.prevents;
  }
}
