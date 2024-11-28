// transaction.ts
export interface Transaction {
  transactionID: number;
  memberID: number;
  memberName: string; // Yeni eklendi
  productID?: number;
  productName?: string; // Yeni eklendi
  amount: number;
  transactionType: string;
  transactionDate: Date;
  quantity: number | string; // Bu satırı değiştirin
}
