import { Pipe, PipeTransform } from '@angular/core';
import { MemberFilter } from '../models/memberFilter';

@Pipe({
    name: 'activeMembers',
    standalone: false
})
export class ActiveMembersPipe implements PipeTransform {

  transform(members: MemberFilter[]): MemberFilter[] {
    if (!members) {
      return [];
    }

    return members.filter(member => {
      return this.calculateRemainingDays(member.startDate, member.endDate) > 0;
    });
  }

  calculateRemainingDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) {
      return NaN; 
    }

    const currentDate = new Date();
    const end = new Date(endDate);

    if (isNaN(currentDate.getTime()) || isNaN(end.getTime())) {
      return NaN;
    }

    const timeDiff = end.getTime() - currentDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff;
  }

}
