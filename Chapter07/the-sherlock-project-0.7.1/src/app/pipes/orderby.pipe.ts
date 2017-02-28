import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderBy', pure: false})
export class OrderByPipe implements PipeTransform {
  transform(input: Array<any>, property: string, order: boolean):
  Array<string> {
    input.sort((a: any, b: any) => {
      return order
        ? a[property] - b[property]
        : b[property] - a[property];
    });
    return input;
  }
}
