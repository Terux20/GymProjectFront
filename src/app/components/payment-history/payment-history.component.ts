import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaymentHistoryService } from '../../services/payment-history.service';
import { PaymentHistory } from '../../models/paymentHistory';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  map,
  startWith,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member';
import { DebtPaymentService } from '../../services/debt-payment-service.service';
import { DialogService } from '../../services/dialog.service';

@Component({
    selector: 'app-payment-history',
    templateUrl: './payment-history.component.html',
    styleUrls: ['./payment-history.component.css'],
    standalone: false
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  paymentHistories: PaymentHistory[] = [];
  totalCash: number = 0;
  totalCreditCard: number = 0;
  totalTransfer: number = 0;
  totalDebt: number = 0;
  totalAmount: number = 0;
  startDate: string = '';
  endDate: string = '';
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  itemsPerPage: number = 50;
  isLoading: boolean = false;
  selectedMonth: string = ''; // Bu satırı ekleyin

  memberSearchControl = new FormControl();
  filteredMembers: Observable<Member[]>;
  members: Member[] = [];

  currentMonthStart: Date;
  currentMonthEnd: Date;
  isFiltered: boolean = false;
  selectedMember: Member | null = null;

  constructor(
    private paymentHistoryService: PaymentHistoryService,
    private memberService: MemberService,
    private debtPaymentService: DebtPaymentService,
    private toastrService: ToastrService,
    private dialogService: DialogService
  ) {
    this.setCurrentMonthDates();
  }

  ngOnInit(): void {
    this.loadMembers();
    this.setupMemberAutocomplete();
    this.loadPayments();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  setCurrentMonthDates() {
    const now = new Date();
    this.currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    this.currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  private loadMembers() {
    this.memberService.getMembers().subscribe({
      next: (response) => {
        this.members = response.data;
      },
      error: (error) => {
        this.toastrService.error('Üyeler yüklenirken bir hata oluştu', 'Hata');
      },
    });
  }
  private setupMemberAutocomplete() {
    this.filteredMembers = this.memberSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map((value) => {
        if (typeof value === 'string') {
          if (!value.trim()) {
            this.selectedMember = null;
            this.loadPayments();
            return [];  // Boş input durumunda boş liste döndür
          }
          return this._filterMembers(value);
        }
        this.selectedMember = value;
        return [];  // Üye seçildiğinde dropdown'ı kapat
      })
    );

    this.memberSearchControl.valueChanges.subscribe((value) => {
      if (!value) {
        // Input tamamen boşsa
        this.selectedMember = null;
        this.loadPayments();
      } else if (value && typeof value === 'object') {
        // Üye seçilmişse
        this.loadMemberPayments(value);
      }
    });
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = value.toLowerCase();
    return this.members.filter(
      (member) =>
        member.name.toLowerCase().includes(filterValue) ||
        member.phoneNumber.toLowerCase().includes(filterValue)
    );
  }

  displayMemberFn(member: Member): string {
    return member ? `${member.name} - ${member.phoneNumber}` : '';
  }

  private loadMemberPayments(member: Member) {
    this.currentPage = 1;
    const parameters = {
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage,
      searchText: member.name,
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      endDate: this.endDate ? new Date(this.endDate) : undefined,
    };

    // Önce tüm değerleri sıfırla
    this.totalCash = 0;
    this.totalCreditCard = 0;
    this.totalTransfer = 0;
    this.totalDebt = 0;
    this.totalAmount = 0;

    this.loadPayments(parameters);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.isFiltered = this.startDate !== '' || this.endDate !== '';
    this.loadPayments();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPayments();
    }
  }

  loadPayments(parameters?: any) {
    this.isLoading = true;

    if (!parameters) {
        parameters = {
            pageNumber: this.currentPage,
            pageSize: this.itemsPerPage,
            searchText: this.selectedMember?.name || '',
            startDate: this.startDate ? new Date(this.startDate) : undefined,
            endDate: this.endDate ? new Date(this.endDate) : undefined
        };
    }

    this.paymentHistoryService.getPaymentHistoryPaginated(parameters).subscribe({
        next: (response) => {
            if (response.success) {
                this.paymentHistories = response.data.data;
                this.totalPages = response.data.totalPages;
                this.totalItems = response.data.totalCount;

                // Eğer parameters.searchText varsa (yani üye seçilmişse)
                // calculateTotalsFromCurrentData metodunu çağır
                if (parameters.searchText) {
                    this.calculateTotalsFromCurrentData();
                } else {
                    // Seçili üye yoksa, API'den toplamları al
                    this.loadTotals(parameters);
                }
            }
            this.isLoading = false;
        },
        error: (error) => {
            this.toastrService.error('Ödeme geçmişi yüklenirken bir hata oluştu.', 'Hata');
            this.isLoading = false;
        }
    });
}
private calculateTotalsFromCurrentData() {
  // Normal ödemeler için toplamları hesapla
  const regularPayments = this.paymentHistories.filter(p => 
    !p.paymentMethod.includes('Borç') && 
    !p.paymentMethod.includes('Borç Ödemesi'));

  this.totalCash = regularPayments
    .filter(p => p.paymentMethod === 'Nakit')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  this.totalCreditCard = regularPayments
    .filter(p => p.paymentMethod === 'Kredi Kartı')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  this.totalTransfer = regularPayments
    .filter(p => p.paymentMethod === 'Havale - EFT')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  // Borç ödemeleri için toplamları ekle
  this.totalCash += this.paymentHistories
    .filter(p => p.paymentMethod === 'Nakit (Borç Ödemesi)')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  this.totalCreditCard += this.paymentHistories
    .filter(p => p.paymentMethod === 'Kredi Kartı (Borç Ödemesi)')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  this.totalTransfer += this.paymentHistories
    .filter(p => p.paymentMethod === 'Havale - EFT (Borç Ödemesi)')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  // İlk borç miktarını bul
  const initialDebt = this.paymentHistories
    .filter(p => p.paymentMethod === 'Borç')
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  // Toplam borç ödemelerini hesapla
  const totalDebtPayments = this.paymentHistories
    .filter(p => p.paymentMethod.includes('Borç Ödemesi'))
    .reduce((sum, payment) => sum + payment.paymentAmount, 0);

  // Kalan borç miktarı
  this.totalDebt = initialDebt - totalDebtPayments;

  // Genel toplam (borç ödemeleri hariç tüm ödemeler)
  this.totalAmount = this.totalCash + this.totalCreditCard + this.totalTransfer;
}

  loadTotals(parameters: any) {
    // Eğer seçili bir üye varsa, sadece o üyenin ödemelerinin toplamını hesapla
    if (this.selectedMember) {
      // Mevcut ödeme listesinden toplam değerleri hesapla
      this.totalCash = this.paymentHistories
        .filter((p) => p.paymentMethod === 'Nakit')
        .reduce((sum, payment) => sum + payment.paymentAmount, 0);

      this.totalCreditCard = this.paymentHistories
        .filter((p) => p.paymentMethod === 'Kredi Kartı')
        .reduce((sum, payment) => sum + payment.paymentAmount, 0);

      this.totalTransfer = this.paymentHistories
        .filter((p) => p.paymentMethod === 'Havale - EFT')
        .reduce((sum, payment) => sum + payment.paymentAmount, 0);

      this.totalDebt = this.paymentHistories
        .filter((p) => p.paymentMethod.includes('Borç'))
        .reduce((sum, payment) => sum + payment.paymentAmount, 0);

      this.totalAmount =
        this.totalCash + this.totalCreditCard + this.totalTransfer;
    } else {
      // Seçili üye yoksa normal API çağrısını yap
      this.paymentHistoryService.getPaymentTotals(parameters).subscribe({
        next: (response) => {
          if (response.success) {
            this.totalCash = response.data.cash;
            this.totalCreditCard = response.data.creditCard;
            this.totalTransfer = response.data.transfer;
            this.totalDebt = response.data.debt;
            this.totalAmount = response.data.total;
          }
        },
        error: (error) => {
          console.error('Error loading totals:', error);
        },
      });
    }
  }
  getTotalValuesTitle(): string {
    if (this.selectedMember) {
      return `Toplam Değerler (${this.selectedMember.name})`;
    }
    if (this.isFiltered) {
      return 'Toplam Değerler (Filtrelenmiş)';
    }
    return `Toplam Değerler (${this.currentMonthStart.toLocaleString(
      'default',
      { month: 'long' }
    )} ${this.currentMonthStart.getFullYear()})`;
  }

  deletePayment(payment: PaymentHistory) {
    const isDebtPayment = payment.paymentMethod.includes('Borç Ödemesi');
    
    this.dialogService.confirmPaymentDelete(
      payment.name,
      payment.paymentAmount,
      isDebtPayment
    ).subscribe(result => {
      if (result) {
        this.isLoading = true;
  
        if (isDebtPayment) {
          this.debtPaymentService.delete(payment.paymentID).subscribe({
            next: (response) => {
              this.toastrService.success('Borç ödemesi başarıyla silindi');
              this.loadPayments();
            },
            error: (error) => {
              this.toastrService.error('Borç ödemesi silinirken bir hata oluştu');
              this.isLoading = false;
            },
          });
        } else {
          this.paymentHistoryService.delete(payment.paymentID).subscribe({
            next: (response) => {
              this.toastrService.success('Ödeme başarıyla silindi');
              this.loadPayments();
            },
            error: (error) => {
              this.toastrService.error('Ödeme silinirken bir hata oluştu');
              this.isLoading = false;
            },
          });
        }
      }
    });
  }
  

  clearFilters() {
    this.memberSearchControl.reset();
    this.startDate = '';
    this.endDate = '';
    this.selectedMember = null;
    this.isFiltered = false;
    this.currentPage = 1;
    this.loadPayments();
  }

  getCurrentMonthText(): string {
    if (!this.selectedMonth) return '';
    const [year, month] = this.selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  }
}
