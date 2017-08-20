import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFilter'
})
export class DateFilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    value = JSON.parse(value);
    return value.day+':'+value.month+':'+value.year;
  }

}
