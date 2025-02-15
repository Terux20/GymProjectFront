// src/app/services/dialog.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { DialogType } from '../models/dialog-type.enum';
import { DialogData } from '../models/dialog.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(data: DialogData): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: this.getDialogWidth(data.type),
      data,
      disableClose: true,
      position: { top: '200px' }
    });

    return dialogRef.afterClosed();
  }

  private getDialogWidth(type: DialogType): string {
    switch (type) {
      case DialogType.PAYMENT:
        return '500px';
      case DialogType.UPDATE:
        return '600px';
      default:
        return '400px';
    }
  }

  confirmDelete(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Silme İşlemi',
      message: `${itemName} silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item
    });
  }
  confirmMemberDelete(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Silme İşlemi',
      message: `${itemName} adlı üyeyi silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item
    });
  }
  confirmUpdate(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.UPDATE,
      title: 'Güncelleme İşlemi',
      message: `${itemName} güncellemek istediğinizden emin misiniz?`,
      confirmText: 'Güncelle',
      cancelText: 'İptal',
      item
    });
  }
  confirmMemberUpdate(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.UPDATE,
      title: 'Güncelleme İşlemi',
      message: `${itemName} adlı üyenin bilgilerini güncellemek istediğinizden emin misiniz?`,
      confirmText: 'Güncelle',
      cancelText: 'İptal',
      item
    });
  }

  confirmFreeze(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.FREEZE,
      title: 'Dondurma İşlemi',
      message: `${itemName} üyeliğini dondurmak istediğinizden emin misiniz?`,
      confirmText: 'Dondur',
      cancelText: 'İptal',
      item
    });
  }

  showPaymentDialog(itemName: string, paymentMethods: string[]): Observable<any> {
    return this.openDialog({
      type: DialogType.PAYMENT,
      title: 'Ödeme İşlemi',
      message: `${itemName} için ödeme yöntemi seçin`,
      confirmText: 'Onayla',
      cancelText: 'İptal',
      paymentMethods,
      showPaymentMethods: true
    });
  }
}