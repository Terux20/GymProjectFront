export interface Transaction {
  transactionID: number;
  memberID: number;
  memberName: string;
  productID?: number;
  productName?: string;
  amount: number;
  unitPrice: number;
  transactionType: string;
  transactionDate: Date;
  quantity: number | string;
  isPaid: boolean;
  balance: number;
}