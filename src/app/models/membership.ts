export interface Membership {
  membershipID: number;
  memberID: number;
  membershipTypeID: number;
  startDate: Date;
  endDate: Date;
  paymentStatus: string;
  PaymentMethod: string;
}
