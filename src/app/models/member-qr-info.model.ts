export interface MemberQRInfo {
    name: string;
    scanNumber: string;
    remainingDays: string;
    membershipStatus?: string; // Yeni alan

  }

  
  export interface MemberQRInfoResponse {
    data: MemberQRInfo;
    message: string;
    success: boolean;
  }