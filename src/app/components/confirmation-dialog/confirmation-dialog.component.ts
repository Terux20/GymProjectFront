import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field>
        <mat-label>Ödeme Yöntemi</mat-label>
        <mat-select [(ngModel)]="selectedPaymentMethod">
          <mat-option *ngFor="let method of data.paymentMethods" [value]="method">
            {{method}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">İptal</button>
      <button mat-button [mat-dialog-close]="{ confirmed: true, paymentMethod: selectedPaymentMethod }" [disabled]="!selectedPaymentMethod">Onayla</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmationDialogComponent {
  selectedPaymentMethod: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; paymentMethods: string[] }
  ) {}
}