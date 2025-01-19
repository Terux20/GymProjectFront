import { Pipe, PipeTransform } from '@angular/core';
import { MemberFilter } from '../models/memberFilter';

@Pipe({
    name: 'memberFilterPipe',
    standalone: false
})
export class MemberFilterPipePipe implements PipeTransform {

  transform(
    value: MemberFilter[],
    filterText: string,
    genderFilter: string,
    branchFilter:string
  ): MemberFilter[] {
    filterText = filterText ? filterText.toLocaleLowerCase() : '';

    return value.filter((p: MemberFilter) => {
      const matchesText = filterText 
        ? p.name.toLocaleLowerCase().includes(filterText) || 
          p.phoneNumber.toLocaleLowerCase().includes(filterText)
        : true;

      const matchesGender = genderFilter 
        ? (genderFilter === '1' && p.gender === 1) || 
          (genderFilter === '2' && p.gender === 2) 
        : true;
        const matchesBranch = branchFilter 
        ? p.branch.toLocaleLowerCase() === branchFilter.toLocaleLowerCase() 
        : true;
      return matchesText && matchesGender && matchesBranch;
    });
  }

}
