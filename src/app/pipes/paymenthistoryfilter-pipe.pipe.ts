import { Pipe, PipeTransform } from '@angular/core';
import { PaymentHistory } from '../models/paymentHistory';

@Pipe({
    name: 'paymenthistoryfilterPipe',
    standalone: false
})
export class PaymenthistoryfilterPipePipe implements PipeTransform {
  transform(
    paymentHistories: PaymentHistory[],
    filterText: string,
    startDate: string,
    endDate: string
  ): PaymentHistory[] {
    if (!paymentHistories) return [];
    if (!filterText && !startDate && !endDate) return paymentHistories;

    return paymentHistories.filter(ph => {
      const textMatch = !filterText || 
        ph.name.toLowerCase().includes(filterText.toLowerCase()) ||
        ph.phoneNumber.includes(filterText);

      const dateMatch = this.dateFilter(ph, startDate, endDate);

      return textMatch && dateMatch;
    });
  }

  private dateFilter(ph: PaymentHistory, startDate: string, endDate: string): boolean {
    if (!startDate && !endDate) return true;

    const paymentDate = new Date(ph.paymentDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59);

    if (start && end) {
      return paymentDate >= start && paymentDate <= end;
    } else if (start) {
      return paymentDate >= start;
    } else if (end) {
      return paymentDate <= end;
    }

    return true;
  }
}