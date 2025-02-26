import { Component } from '@angular/core';
import { MemberService } from '../../services/member.service';

interface MembershipInfo {
  branch: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
}

interface MemberQRInfo {
  name: string;
  scanNumber: string;
  memberships: MembershipInfo[];
}

@Component({
    selector: 'app-member-qrcode',
    templateUrl: './member-qrcode.component.html',
    styleUrls: ['./member-qrcode.component.css'],
    standalone: false
})
export class MemberQRCodeComponent {
  phoneNumber: string = '';
  memberInfo: MemberQRInfo | null = null;
  message: string = '';
  isError: boolean = false;
  showLookupButton: boolean = true;
  lastQueriedNumber: string = '';
  isLoading: boolean = false;

  constructor(private memberService: MemberService) {}

  formatPhoneNumber(number: string): string {
    // Telefon numarasındaki tüm boşlukları ve özel karakterleri kaldır
    let cleaned = number.replace(/\D/g, '');
    
    // Eğer numara 10 haneliyse başına 0 ekle
    if (cleaned.length === 10) {
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  }

  lookupMember() {
    if (!this.phoneNumber) {
      this.message = 'Lütfen bir telefon numarası girin.';
      this.isError = true;
      this.memberInfo = null;
      return;
    }

    // Telefon numarasını formatla
    let formattedPhoneNumber = this.formatPhoneNumber(this.phoneNumber);

    

    this.isLoading = true;
    this.showLookupButton = false;
    this.lastQueriedNumber = formattedPhoneNumber;

    this.memberService.getMemberQRInfo(formattedPhoneNumber).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.memberInfo = response.data;
          this.isError = false;
          this.message = response.message;
        } else {
          this.memberInfo = null;
          this.message = response.message || 'Üye bulunamadı.';
          this.isError = true;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.memberInfo = null;
        this.message = error.error?.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        this.isError = true;
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  onPhoneNumberChange() {
    if (this.phoneNumber !== this.lastQueriedNumber) {
      this.showLookupButton = true;
    }
  }

  downloadQRCode() {
    const qrCodeElement = document.querySelector('qrcode canvas');
    if (qrCodeElement instanceof HTMLCanvasElement) {
      const image = qrCodeElement.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement('a');
      link.download = `QR_Code_${this.memberInfo?.name || 'Member'}.png`;
      link.href = image;
      link.click();
    } else {
      console.error('QR code canvas element not found');
      this.message = 'QR kodu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      this.isError = true;
    }
  }

  getFutureMemberships(): MembershipInfo[] {
    if (!this.memberInfo || !this.memberInfo.memberships) return [];
    const now = new Date();
    return this.memberInfo.memberships.filter(m => new Date(m.startDate) > now);
  }

  getActiveMemberships(): MembershipInfo[] {
    if (!this.memberInfo || !this.memberInfo.memberships) return [];
    const now = new Date();
    return this.memberInfo.memberships.filter(m => 
      new Date(m.startDate) <= now && new Date(m.endDate) > now
    );
  }

  getExpiredMemberships(): MembershipInfo[] {
    if (!this.memberInfo || !this.memberInfo.memberships) return [];
    const now = new Date();
    return this.memberInfo.memberships.filter(m => new Date(m.endDate) <= now);
  }
}