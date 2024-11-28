import { Pipe, PipeTransform } from '@angular/core';
import { CompanyDetail } from '../models/companyDetail';

@Pipe({
  name: 'filterPipe',
})
export class FilterPipePipe implements PipeTransform {
  transform(
    value: CompanyDetail[],
    filterText: string
  ): CompanyDetail[] {
    filterText = filterText ? filterText.toLocaleLowerCase() : '';

    return filterText
      ? value.filter((p: CompanyDetail) => {
          return (
            p.cityName.toLocaleLowerCase().indexOf(filterText) !== -1 ||
            p.companyUserName.toLocaleLowerCase().indexOf(filterText) !== -1 ||
            p.companyUserPhoneNumber.toLocaleLowerCase().indexOf(filterText) !==
              -1
          );
        })
      : value;
  }
}

