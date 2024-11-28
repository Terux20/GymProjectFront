import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaymentHistoryService } from '../../services/payment-history.service';
import { PaymentHistory } from '../../models/paymentHistory';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  paymentHistories: PaymentHistory[] = [];
  totalCash: number = 0;
  totalCreditCard: number = 0;
  totalTransfer: number = 0;
  totalDebt: number = 0;
  totalAmount: number = 0;
  filterText: string = '';
  startDate: string = '';
  endDate: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  itemsPerPage: number = 50; // Default 50 yapıldı
  isLoading: boolean = false;

  currentMonthStart: Date;
  currentMonthEnd: Date;
  isFiltered: boolean = false;

  private filterSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private paymentHistoryService: PaymentHistoryService,
    private toastrService: ToastrService
  ) {
    this.setCurrentMonthDates();

    // Debounce için subscription
    this.filterSubject
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.isFiltered = this.filterText !== '' || this.startDate !== '' || this.endDate !== '';
        this.loadPayments();
      });
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCurrentMonthDates() {
    const now = new Date();
    this.currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    this.currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  loadPayments() {
    this.isLoading = true;

    const parameters = {
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
      searchText: this.filterText || '',
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      endDate: this.endDate ? new Date(this.endDate) : undefined
    };

    this.paymentHistoryService.getPaymentHistoryPaginated(parameters).subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentHistories = response.data.data;
          this.totalPages = response.data.totalPages;
          this.totalItems = response.data.totalCount;
          this.loadTotals();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.toastrService.error('Ödeme geçmişi yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    });
  }

  loadTotals() {
    const parameters = {
      searchText: this.filterText || '',
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      endDate: this.endDate ? new Date(this.endDate) : undefined
    };

    this.paymentHistoryService.getPaymentTotals(parameters).subscribe({
      next: (response) => {
        if (response.success) {
          this.totalCash = response.data.cash;
          this.totalCreditCard = response.data.creditCard;
          this.totalTransfer = response.data.transfer;
          this.totalAmount = response.data.total;
        }
      },
      error: (error) => {
        console.error('Error loading totals:', error);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPayments();
    }
  }

  onFilterChange(): void {
    this.filterSubject.next(this.filterText);
  }

  getTotalValuesTitle(): string {
    if (this.isFiltered) {
      return 'Toplam Değerler (Filtrelenmiş)';
    } else {
      return `Toplam Değerler (${this.currentMonthStart.toLocaleString('default', { month: 'long' })} ${this.currentMonthStart.getFullYear()})`;
    }
  }

  deletePayment(paymentHistory: PaymentHistory) {
    const message = `${paymentHistory.name} adlı üyenin yaptığı ödemeyi silmek istediğinizden emin misiniz?`;
    
    if (confirm(message)) {
      this.isLoading = true;
      this.paymentHistoryService.delete(paymentHistory.paymentID).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastrService.success(response.message, 'Başarılı');
            this.loadPayments();
          } else {
            this.toastrService.error(response.message, 'Hata');
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.toastrService.error('Ödeme silinirken bir hata oluştu.', 'Hata');
          this.isLoading = false;
        }
      });
    }
  }
}