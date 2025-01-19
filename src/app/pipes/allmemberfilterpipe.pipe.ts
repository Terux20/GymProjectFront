import { Pipe, PipeTransform } from '@angular/core';
import { Member } from '../models/member';

@Pipe({
    name: 'allmemberfilterpipe',
    standalone: false
})
export class AllmemberfilterpipePipe implements PipeTransform {

  transform(
    value: Member[],
    filterText: string
  ): Member[] {
    filterText = filterText ? filterText.toLocaleLowerCase() : '';

    return filterText
      ? value.filter((p: Member) => {
          return (
            p.name.toLocaleLowerCase().indexOf(filterText) !== -1 ||
            p.phoneNumber.toLocaleLowerCase().indexOf(filterText) !== -1
          );
        })
      : value;
  }

}
