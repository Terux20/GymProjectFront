import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { TransactionPaymentDialogComponent } from '../transaction-payment-dialog/transaction-payment-dialog.component';

interface GroupedTransactions {
  [key: string]: Transaction[];
}

interface MemberTotals {
  [key: string]: number;
}

interface ProductSummary {
  quantity: number;
  totalAmount: number;
}

interface MemberProductSummary {
  [productName: string]: ProductSummary;
}

interface TransactionsByMember {
  memberId: string;
  memberName: string;
  transactions: Transaction[];
  productSummary: MemberProductSummary;
  totalDebt: number;
}

@Component({
    selector: 'app-transaction-list',
    templateUrl: './transaction-list.component.html',
    styleUrls: ['./transaction-list.component.css'],
    standalone: false
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  paidTransactions: Transaction[] = [];
  unpaidTransactions: Transaction[] = [];
  isLoading: boolean = false;
  searchControl = new FormControl('');
  filteredTransactions: Transaction[] = [];
  selectedMemberId: number | null = null;
  groupedTransactions: GroupedTransactions = {};
  memberTotals: MemberTotals = {};
  selectedMonth: string = '';
  orderedMemberIds: string[] = [];
  memberProductSummaries: { [memberId: string]: MemberProductSummary } = {};
  transactionsByMember: TransactionsByMember[] = [];
  currentSearchText: string = '';
  showPaidTransactions: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private transactionService: TransactionService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.getTransactions();
  }

  private setupSearchSubscription(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.currentSearchText = value || '';
        this.filterTransactions(this.currentSearchText);
      });
  }

  toggleTransactionView() {
    this.showPaidTransactions = !this.showPaidTransactions;
    this.filterTransactions(this.currentSearchText);
  }

  private filterTransactions(searchText: string): void {
    let filteredList = this.showPaidTransactions ? this.paidTransactions : this.unpaidTransactions;

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filteredList = filteredList.filter(transaction =>
        transaction.memberName.toLowerCase().includes(lowerSearchText)
      );
    }

    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filteredList = filteredList.filter(transaction => {
        const transDate = new Date(transaction.transactionDate);
        return transDate >= start && transDate <= end;
      });
    }

    this.filteredTransactions = filteredList;
    this.groupTransactionsByMember();
    this.calculateMemberTotals();
    this.calculateProductSummaries();
    this.prepareTransactionsByMember();
  }

  onDateFilterChange() {
    this.filterTransactions(this.currentSearchText);
  }

  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filterTransactions(this.currentSearchText);
  }

  private prepareTransactionsByMember(): void {
    this.transactionsByMember = this.orderedMemberIds.map(memberId => {
      const transactions = this.groupedTransactions[memberId];
      const memberName = transactions[0].memberName;
      const productSummary = this.memberProductSummaries[memberId] || {};
      const totalDebt = this.memberTotals[memberId] || 0;

      return {
        memberId,
        memberName,
        transactions,
        productSummary,
        totalDebt
      };
    });
  }

  private calculateProductSummaries(): void {
    this.memberProductSummaries = {};
    
    Object.keys(this.groupedTransactions).forEach(memberId => {
      const memberTransactions = this.groupedTransactions[memberId]
        .filter(t => !t.isPaid && t.transactionType !== 'Bakiye Yükleme' && t.productName);
      
      if (memberTransactions.length > 0) {
        const summary: MemberProductSummary = {};
        
        memberTransactions.forEach(transaction => {
          if (!transaction.productName) return;
          
          if (!summary[transaction.productName]) {
            summary[transaction.productName] = {
              quantity: 0,
              totalAmount: 0
            };
          }
          
          if (typeof transaction.quantity === 'number') {
            summary[transaction.productName].quantity += transaction.quantity;
          }
          summary[transaction.productName].totalAmount += transaction.amount;
        });
        
        this.memberProductSummaries[memberId] = summary;
      }
    });
  }

  groupTransactionsByMember() {
    this.groupedTransactions = {};
    
    this.filteredTransactions.forEach(transaction => {
      const key = transaction.memberID.toString();
      if (!this.groupedTransactions[key]) {
        this.groupedTransactions[key] = [];
      }
      this.groupedTransactions[key].push(transaction);
    });

    this.orderedMemberIds = Object.keys(this.groupedTransactions).sort((a, b) => {
      const aTransactions = this.groupedTransactions[a];
      const bTransactions = this.groupedTransactions[b];
      const aLatest = Math.max(...aTransactions.map(t => new Date(t.transactionDate).getTime()));
      const bLatest = Math.max(...bTransactions.map(t => new Date(t.transactionDate).getTime()));
      return bLatest - aLatest;
    });

    Object.keys(this.groupedTransactions).forEach(key => {
      this.groupedTransactions[key].sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
    });
  }

  getTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactionsWithDetails().subscribe({
      next: (response) => {
        this.transactions = response.data.map(transaction => ({
          ...transaction,
          quantity: transaction.transactionType === 'Bakiye Yükleme' ? '-' : transaction.quantity
        }));

        this.paidTransactions = this.transactions.filter(t => t.isPaid);
        this.unpaidTransactions = this.transactions.filter(t => !t.isPaid);

        this.filteredTransactions = this.unpaidTransactions;
        this.groupTransactionsByMember();
        this.calculateMemberTotals();
        this.calculateProductSummaries();
        this.prepareTransactionsByMember();
        
        this.isLoading = false;
      },
      error: (error) => {
        this.toastrService.error('İşlem geçmişi yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    });
  }

  calculateMemberTotals() {
    this.memberTotals = {};
    Object.keys(this.groupedTransactions).forEach(memberId => {
      const memberTransactions = this.groupedTransactions[memberId];
      this.memberTotals[memberId] = memberTransactions
        .filter(t => !t.isPaid && t.transactionType !== 'Bakiye Yükleme')
        .reduce((sum, t) => sum + t.amount, 0);
    });
  }

  getProductSummary(memberId: string): MemberProductSummary | null {
    return this.memberProductSummaries[memberId] || null;
  }

  getMemberTotalDebt(memberId: string): number {
    return this.memberTotals[memberId] || 0;
  }

  updatePaymentStatus(transaction: Transaction) {
    if (transaction.transactionType === 'Bakiye Yükleme' || transaction.isPaid) {
      return;
    }

    const dialogRef = this.dialog.open(TransactionPaymentDialogComponent, {
      width: '300px',
      data: {
        title: 'Ödeme Onayı',
        message: `${transaction.amount}₺ tutarındaki ödemeyi onaylıyor musunuz?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.processPayment(transaction);
      }
    });
  }

  updateAllMemberPayments(memberId: string) {
    const totalDebt = this.memberTotals[memberId] || 0;

    if (totalDebt <= 0) {
        return;
    }

    const dialogRef = this.dialog.open(TransactionPaymentDialogComponent, {
        width: '300px',
        data: {
            title: 'Toplu Ödeme Onayı',
            message: `Toplam ${totalDebt}₺ tutarındaki tüm ödemeleri onaylıyor musunuz?`
        }
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result && result.confirmed) {
            this.isLoading = true;
            this.transactionService.updateAllPaymentStatus(memberId).subscribe({
                next: (response) => {
                    this.toastrService.success('Tüm ödemeler başarıyla yapıldı');
                    this.getTransactions();
                },
                error: (error) => {
                    this.toastrService.error('Ödemeler yapılırken bir hata oluştu', 'Hata');
                    this.isLoading = false;
                }
            });
        }
    });
  }

  private processPayment(transaction: Transaction, isLastPayment: boolean = true) {
    this.isLoading = true;
    this.transactionService.updatePaymentStatus(transaction.transactionID).subscribe({
      next: (response) => {
        if (isLastPayment) {
          this.toastrService.success('Ödeme durumu güncellendi', 'Başarılı');
          this.getTransactions();
        }
      },
      error: (error) => {
        this.toastrService.error('Ödeme durumu güncellenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    });
  }

  getPaymentStatus(transaction: Transaction): string {
    if (transaction.transactionType === 'Bakiye Yükleme') {
      return 'Tamamlandı';
    }
    return transaction.isPaid ? 'Ödendi' : 'Öde';
  }

  getStatusClass(transaction: Transaction): string {
    if (transaction.transactionType === 'Bakiye Yükleme') {
      return 'badge bg-success';
    }
    return transaction.isPaid ? 'badge bg-success' : 'badge bg-danger';
  }

  getTotalAmount(): number {
    return this.filteredTransactions
        .filter(t => t.transactionType !== 'Bakiye Yükleme')
        .reduce((sum, t) => sum + t.totalPrice, 0);
}

getTotalUnpaidAmount(): number {
    return this.filteredTransactions
        .filter(t => !t.isPaid && t.transactionType !== 'Bakiye Yükleme')
        .reduce((sum, t) => sum + t.amount, 0);  // Burada amount kullanıyoruz çünkü bu gerçek borç
}

getTotalPaidAmount(): number {
    return this.filteredTransactions
        .filter(t => t.isPaid && t.transactionType !== 'Bakiye Yükleme')
        .reduce((sum, t) => sum + t.totalPrice, 0);
}

  getCurrentMonthText(): string {
    if (!this.selectedMonth) return '';
    const [year, month] = this.selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  }
}