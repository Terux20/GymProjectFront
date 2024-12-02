import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-payment-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
     
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">İptal</button>
      <button mat-button [mat-dialog-close]="{ confirmed: true, paymentMethod: selectedPaymentMethod }" >Onayla</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin: 16px 0;
    }
    mat-dialog-actions {
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class TransactionPaymentDialogComponent {
  selectedPaymentMethod: string;

  constructor(
    public dialogRef: MatDialogRef<TransactionPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; paymentMethods: string[] }
  ) {}
}