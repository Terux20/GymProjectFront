// debtor-member.component.ts
import { Component, OnInit } from '@angular/core';
import { RemainingDebtService } from '../../services/remaining-debt-service.service'; 
import { RemainingDebtDetail } from '../../models/RemainingDebtDetail';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DebtPaymentDialogComponent } from '../debt-payment-dialog/debt-payment-dialog.component';

@Component({
  selector: 'app-debtor-member',
  templateUrl: './debtor-member.component.html',
  styleUrls: ['./debtor-member.component.css']
})
export class DebtorMemberComponent implements OnInit {
  debtorMembers: RemainingDebtDetail[] = [];
  isLoading: boolean = false;

  constructor(
    private remainingDebtService: RemainingDebtService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getDebtorMembers();
  }

  getDebtorMembers() {
    this.isLoading = true;
    this.remainingDebtService.getRemainingDebtDetails().subscribe(
      (response) => {
        this.debtorMembers = response.data;
        this.isLoading = false;
      },
      (error) => {
        this.toastrService.error('Borçlu üyeler yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    );
  }

  openPaymentDialog(debt: RemainingDebtDetail) {
    const dialogRef = this.dialog.open(DebtPaymentDialogComponent, {
      width: '400px',
      data: debt
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.remainingDebtService.addDebtPayment(result).subscribe(
          (response) => {
            this.toastrService.success('Ödeme başarıyla kaydedildi', 'Başarılı');
            this.getDebtorMembers();
          },
          (error) => {
            this.toastrService.error('Ödeme kaydedilirken bir hata oluştu', 'Hata');
          }
        );
      }
    });
  }
}