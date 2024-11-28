import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading: boolean = false;

  constructor(
    private transactionService: TransactionService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getTransactions();
  }

  getTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactionsWithDetails().subscribe(
      response => {
        this.transactions = response.data
          .map(transaction => ({
            ...transaction,
            quantity: transaction.transactionType === 'Bakiye Yükleme' ? '-' : transaction.quantity
          }))
          .sort((a, b) => {
            return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
          });
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('İşlem geçmişi yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }
}