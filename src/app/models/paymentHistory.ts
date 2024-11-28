export interface PaymentHistory {
  paymentID: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentAmount: number;
  membershipType: string;
  branch: string;
  name: string;
  isActive: boolean;
  phoneNumber: string;
}
