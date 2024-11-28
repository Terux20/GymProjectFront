import { Component, OnInit } from '@angular/core';
import { PaymentHistoryService } from '../../services/payment-history.service';
import { PaymentHistory } from '../../models/paymentHistory';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-debtor-member',
  templateUrl: './debtor-member.component.html',
  styleUrls: ['./debtor-member.component.css'],
})
export class DebtorMemberComponent implements OnInit {
  debtorMembers: PaymentHistory[] = [];
  faEdit = faEdit;
  paymentMethods = ['Nakit', 'Kredi Kartı', 'Havale-EFT'];
  isLoading: boolean = false;

  constructor(
    private paymentHistoryService: PaymentHistoryService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getDebtorMembers();
  }

  getDebtorMembers() {
    this.isLoading = true;
    this.paymentHistoryService.getDebtorMembers().subscribe(
      (response) => {
        this.debtorMembers = response.data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching debtor members:', error);
        this.toastrService.error('Borçlu üyeler yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    );
  }

  openConfirmDialog(payment: PaymentHistory) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        title: 'Ödeme Onayı',
        message: `${payment.name} adlı üyenin ${payment.paymentAmount}₺ tutarındaki ödemesini onaylıyor musunuz?`,
        paymentMethods: this.paymentMethods
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.updatePaymentStatus(payment, result.paymentMethod);
      }
    });
  }

  updatePaymentStatus(payment: PaymentHistory, paymentMethod: string) {
    this.isLoading = true;
    this.paymentHistoryService.updatePaymentStatus(payment.paymentID, paymentMethod).subscribe(
      (response) => {
        if (response.success) {
          this.toastrService.success('Ödeme durumu güncellendi', 'Başarılı');
          this.getDebtorMembers(); // Listeyi yenile
        } else {
          this.toastrService.error('Ödeme durumu güncellenemedi', 'Hata');
        }
        this.isLoading = false;
      },
      (error) => {
        this.toastrService.error('Bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }
}