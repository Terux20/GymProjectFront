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

interface MemberLastTransaction {
  memberId: string;
  lastTransactionDate: Date;
}

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading: boolean = false;
  searchControl = new FormControl('');
  filteredTransactions: Transaction[] = [];
  selectedMemberId: number | null = null;
  groupedTransactions: GroupedTransactions = {};
  memberTotals: MemberTotals = {};
  selectedMonth: string = '';
  orderedMemberIds: string[] = [];

  constructor(
    private transactionService: TransactionService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTransactions();
    this.initializeMonthFilter();
  }

  initializeMonthFilter() {
    const today = new Date();
    this.selectedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }

  getTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactionsWithDetails().subscribe({
      next: (response) => {
        this.transactions = response.data.map(transaction => ({
          ...transaction,
          quantity: transaction.transactionType === 'Bakiye Yükleme' ? '-' : transaction.quantity
        }));
        this.filterByMonth();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastrService.error('İşlem geçmişi yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    });
  }

  filterByMonth() {
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-');
      this.filteredTransactions = this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transactionDate);
        return transactionDate.getFullYear() === parseInt(year) && 
               transactionDate.getMonth() === parseInt(month) - 1;
      });
    } else {
      this.filteredTransactions = this.transactions;
    }
    this.groupTransactionsByMember();
    this.calculateMemberTotals();
  }

  groupTransactionsByMember() {
    // Reset groupedTransactions
    this.groupedTransactions = {};
    
    // Group transactions by member
    this.filteredTransactions.forEach(transaction => {
      const key = transaction.memberID.toString();
      if (!this.groupedTransactions[key]) {
        this.groupedTransactions[key] = [];
      }
      this.groupedTransactions[key].push(transaction);
    });

    // Find last transaction date for each member
    const memberLastTransactions: MemberLastTransaction[] = Object.keys(this.groupedTransactions).map(memberId => {
      const transactions = this.groupedTransactions[memberId];
      const lastTransactionDate = new Date(Math.max(
        ...transactions.map(t => new Date(t.transactionDate).getTime())
      ));
      return {
        memberId,
        lastTransactionDate
      };
    });

    // Sort members by their last transaction date (descending)
    this.orderedMemberIds = memberLastTransactions
      .sort((a, b) => b.lastTransactionDate.getTime() - a.lastTransactionDate.getTime())
      .map(m => m.memberId);

    // Sort each member's transactions by date (descending)
    Object.keys(this.groupedTransactions).forEach(memberId => {
      this.groupedTransactions[memberId].sort((a, b) => 
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      );
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
    const unpaidTransactions = this.groupedTransactions[memberId]
      .filter(t => !t.isPaid && t.transactionType !== 'Bakiye Yükleme');
    
    if (unpaidTransactions.length === 0) {
      return;
    }

    const totalAmount = unpaidTransactions.reduce((sum, t) => sum + t.amount, 0);

    const dialogRef = this.dialog.open(TransactionPaymentDialogComponent, {
      width: '300px',
      data: {
        title: 'Toplu Ödeme Onayı',
        message: `Toplam ${totalAmount}₺ tutarındaki tüm ödemeleri onaylıyor musunuz?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        unpaidTransactions.forEach(transaction => {
          this.processPayment(transaction);
        });
      }
    });
  }

  private processPayment(transaction: Transaction) {
    this.isLoading = true;
    this.transactionService.updatePaymentStatus(transaction.transactionID).subscribe({
      next: (response) => {
        this.toastrService.success('Ödeme durumu güncellendi', 'Başarılı');
        this.getTransactions();
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
    return transaction.isPaid ? 'Ödendi' : 'Ödenmedi';
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
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalUnpaidAmount(): number {
    return this.filteredTransactions
      .filter(t => !t.isPaid && t.transactionType !== 'Bakiye Yükleme')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalPaidAmount(): number {
    return this.filteredTransactions
      .filter(t => t.isPaid && t.transactionType !== 'Bakiye Yükleme')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getCurrentMonthText(): string {
    if (!this.selectedMonth) return '';
    const [year, month] = this.selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  }
}