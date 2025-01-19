// debt-payment-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RemainingDebtDetail } from '../../models/RemainingDebtDetail'; 

@Component({
    selector: 'app-debt-payment-dialog',
    template: `
    <h2 mat-dialog-title>Ödeme Al</h2>
    <mat-dialog-content>
      <form [formGroup]="paymentForm">
        <div class="mb-3">
          <label>Toplam Borç: {{ data.originalAmount | currency:'TRY':'symbol-narrow':'1.2-2' }}</label>
        </div>
        <div class="mb-3">
          <label>Kalan Borç: {{ data.remainingAmount | currency:'TRY':'symbol-narrow':'1.2-2' }}</label>
        </div>
        <mat-form-field class="w-100">
          <mat-label>Ödenecek Tutar</mat-label>
          <input matInput type="number" formControlName="paidAmount" 
                 [max]="data.remainingAmount" [min]="1">
          <mat-error *ngIf="paymentForm.get('paidAmount')?.hasError('required')">
            Tutar gereklidir
          </mat-error>
          <mat-error *ngIf="paymentForm.get('paidAmount')?.hasError('max')">
            Tutar kalan borçtan büyük olamaz
          </mat-error>
          <mat-error *ngIf="paymentForm.get('paidAmount')?.hasError('min')">
            Tutar 1'den küçük olamaz
          </mat-error>
        </mat-form-field>
        <mat-form-field class="w-100">
          <mat-label>Ödeme Yöntemi</mat-label>
          <mat-select formControlName="paymentMethod">
            <mat-option value="Nakit">Nakit</mat-option>
            <mat-option value="Kredi Kartı">Kredi Kartı</mat-option>
            <mat-option value="Havale - EFT">Havale - EFT</mat-option>
          </mat-select>
          <mat-error *ngIf="paymentForm.get('paymentMethod')?.hasError('required')">
            Ödeme yöntemi seçilmelidir
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">İptal</button>
      <button mat-button [mat-dialog-close]="getPaymentData()" 
              [disabled]="!paymentForm.valid">
        Ödeme Al
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-form-field {
      margin-bottom: 1rem;
    }
  `],
    standalone: false
})
export class DebtPaymentDialogComponent {
  paymentForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DebtPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RemainingDebtDetail,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      paidAmount: ['', [Validators.required, Validators.min(1), Validators.max(data.remainingAmount)]],
      paymentMethod: ['', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getPaymentData() {
    if (this.paymentForm.valid) {
      return {
        remainingDebtID: this.data.remainingDebtID,
        paidAmount: this.paymentForm.get('paidAmount')?.value,
        paymentMethod: this.paymentForm.get('paymentMethod')?.value
      };
    }
    return null;
  }
}