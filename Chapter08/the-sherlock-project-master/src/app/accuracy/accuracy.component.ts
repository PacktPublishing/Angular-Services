import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2";
import {AccuracyService} from "./accuracy.service";

@Component({
  selector: 'sh-accuracy',
  templateUrl: './accuracy.html',
  styleUrls: ['./accuracy.css']
})
export class AccuracyComponent implements OnInit {
  private prevents = [];
  private cures: FirebaseListObservable<any>;
  private items;
  constructor(af: AngularFire, as: AccuracyService) {
    this.cures = af.database.list('/Accuracy/cures');
    this.prevents = as.getPrevents();

   /* as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMl',
      'Cure for article length problem',
      'evidence.service.ts', 77,
      {url: 'some url1', data: 'some data1'},
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMl',
      'Cure for article length problem',
      'evidence.service.ts', 77,
      {url: 'some url2', data: 'some data2'}
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMl',
      'Cure for article length problem',
      'evidence.service.ts', 77,
      {url: 'some url3', data: 'some data3'},
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMl',
      'Cure for article length problem',
      'evidence.service.ts', 77,
      {url: 'some url4', data: 'some data4'},
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMt', 'bada', 'ooo', 34, {url: 'some url2', data: 'some data55'}
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEMt', 'bada', 'ooo', 34, {url: 'some url3', data: 'some data66'}
    );

    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEyt', 'yo', 'rr', 89, {url: 'some url3', data: 'some data66'}
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEyt', 'yo', 'rr', 89, {url: 'some url3', data: 'some data66'}
    );
    as.takeSnapshot(
      '-K_PGziSD-d53wQRrEyt', 'yo', 'rr', 89, {url: 'some url3', data: 'some data66'}
    );
    */
  }

  ngOnInit() {
    this.cures
      .subscribe(data => {
        this.items = data
      })
  }

  newCure() {
    this.cures.push({description:'new cure'})
  }

  editCure(id, event) {
      this.cures.update(id, {description: event.target.outerText});
  }

  deleteCure(id) {
    this.cures.remove(id);
  }
}
