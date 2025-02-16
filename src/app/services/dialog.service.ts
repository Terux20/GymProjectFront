// src/app/services/dialog.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { DialogType } from '../models/dialog-type.enum';
import { DialogData } from '../models/dialog.model';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openDialog(data: DialogData): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: this.getDialogWidth(data.type),
      data,
      disableClose: true,
      position: { top: '200px' },
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
      item,
    });
  }
  confirmProductDelete(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Silme İşlemi',
      message: `${itemName} adlı ürünü silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item,
    });
  }
  confirmMemberDelete(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Silme İşlemi',
      message: `${itemName} adlı üyeyi silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item,
    });
  }
  confirmMembershipDelete(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Silme İşlemi',
      message: `${itemName} adlı üyenin üyeliğini silmek istediğinizden emin misiniz?`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item,
    });
  }
  confirmFreezeCancel(
    memberName: string,
    usedDays: number
  ): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Dondurma İptal İşlemi',
      message: `${memberName} isimli üyenin dondurma işlemini tamamen iptal etmek istediğinizden emin misiniz?\n\nBu işlem sonucunda üyelik hiç dondurulmamış gibi eski haline dönecektir.`,
      confirmText: 'İptal Et',
      cancelText: 'Vazgeç',
    });
  }

  confirmReactivateFromToday(
    memberName: string,
    usedDays: number
  ): Observable<boolean> {
    return this.openDialog({
      type: DialogType.UPDATE,
      title: 'Üyelik Aktifleştirme',
      message: `${memberName} isimli üyenin üyeliğini bugünden itibaren aktif etmek istediğinizden emin misiniz?\n\nKullanılan dondurma süresi: ${usedDays} gün\nBu işlem sonucunda üyelik süresi buna göre ayarlanacaktır. Bu işlem geri alınamaz.`,
      confirmText: 'Aktifleştir',
      cancelText: 'Vazgeç',
    });
  }
  confirmPaymentDelete(
    memberName: string,
    paymentAmount: number,
    isDebtPayment: boolean
  ): Observable<boolean> {
    const paymentType = isDebtPayment ? 'borç ödemesi' : 'ödeme';
    const amount = paymentAmount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Ödeme Silme İşlemi',
      message: `${memberName} adlı üyenin ${amount}₺ tutarındaki ${paymentType} kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
    });
  }
  confirmMembershipTypeDelete(membershipType: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.DELETE,
      title: 'Üyelik Türü Silme İşlemi',
      message: `${membershipType.branch} branşına ait ${membershipType.typeName} paketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      item: membershipType,
    });
  }
  confirmUpdate(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.UPDATE,
      title: 'Güncelleme İşlemi',
      message: `${itemName} güncellemek istediğinizden emin misiniz?`,
      confirmText: 'Güncelle',
      cancelText: 'İptal',
      item,
    });
  }

  confirmFreeze(itemName: string, item?: any): Observable<boolean> {
    return this.openDialog({
      type: DialogType.FREEZE,
      title: 'Dondurma İşlemi',
      message: `${itemName} üyeliğini dondurmak istediğinizden emin misiniz?`,
      confirmText: 'Dondur',
      cancelText: 'İptal',
      item,
    });
  }

  showPaymentDialog(
    itemName: string,
    paymentMethods: string[]
  ): Observable<any> {
    return this.openDialog({
      type: DialogType.PAYMENT,
      title: 'Ödeme İşlemi',
      message: `${itemName} için ödeme yöntemi seçin`,
      confirmText: 'Onayla',
      cancelText: 'İptal',
      paymentMethods,
      showPaymentMethods: true,
    });
  }
}
