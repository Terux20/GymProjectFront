// src/app/models/memberEntry.ts
export interface MemberEntry {
  memberID: number;
  name: string;
  phoneNumber: string;
  entryTime: Date;
  exitTime?: Date;
  remainingDays:number;
}
