// src/app/components/shared/confirmation-dialog/confirmation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogType } from '../../models/dialog-type.enum';
import { DialogData } from '../../models/dialog.model'; 

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p [ngClass]="getMessageClass()">{{ data.message }}</p>
        
        <mat-form-field *ngIf="data.showPaymentMethods" class="w-100">
          <mat-label>Ödeme Yöntemi</mat-label>
          <mat-select [(ngModel)]="selectedPaymentMethod">
            <mat-option *ngFor="let method of data.paymentMethods" [value]="method">
              {{method}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button 
                (click)="onCancel()"
                [class.cancel-delete]="data.type === DialogType.DELETE">
          {{data.cancelText || 'İptal'}}
        </button>
        <button mat-button 
                (click)="onConfirm()"
                [ngClass]="getConfirmButtonClass()"
                [disabled]="isConfirmDisabled()">
          {{data.confirmText || 'Onayla'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      position: relative;
      min-width: 280px;
      max-width: 90vw;
      width: auto;
      padding: 1rem;
    }
    
    .dialog-content {
      margin: 1rem 0;
      padding: 0.5rem;
      overflow-wrap: break-word;
      word-wrap: break-word;
      hyphens: auto;
    }
    
    .payment-select {
      width: 100%;
      margin-top: 1rem;
    }
    
    .dialog-actions {
      margin-bottom: 0;
      padding: 1rem 0;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .message-delete {
      color: #dc3545;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }
    
    .message-update {
      color: #0d6efd;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }
    
    .message-payment {
      color: #198754;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }
    
    .message-freeze {
      color: #0dcaf0;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    .confirm-delete {
      background-color: #dc3545 !important;
      color: white !important;
    }
    
    .confirm-update {
      background-color: #0d6efd !important;
      color: white !important;
    }
    
    .confirm-payment {
      background-color: #198754 !important;
      color: white !important;
    }
    
    .confirm-freeze {
      background-color: #0dcaf0 !important;
      color: white !important;
    }

    .cancel-delete {
      color: #dc3545;
    }

    button {
      min-width: 80px;
      padding: 0.5rem 1rem;
    }

    @media screen and (max-width: 480px) {
      .dialog-container {
        min-width: 260px;
        padding: 0.75rem;
      }

      .dialog-content {
        margin: 0.75rem 0;
        padding: 0.25rem;
      }

      button {
        min-width: 70px;
        padding: 0.4rem 0.8rem;
      }
    }
  `],standalone:false
})
export class ConfirmationDialogComponent {
  selectedPaymentMethod: string;
  DialogType = DialogType;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  getMessageClass(): string {
    return `message-${this.data.type}`;
  }

  getConfirmButtonClass(): string {
    return `confirm-${this.data.type}`;
  }

  isConfirmDisabled(): boolean {
    if (this.data.showPaymentMethods) {
      return !this.selectedPaymentMethod;
    }
    return false;
  }

  onConfirm(): void {
    const result = this.data.showPaymentMethods 
      ? { confirmed: true, paymentMethod: this.selectedPaymentMethod }
      : true;
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}