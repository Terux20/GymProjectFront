export interface MembershipFreezeHistory {
    freezeHistoryID: number;
    memberName: string;
    phoneNumber: string;
    branch: string;
    startDate: Date;
    plannedEndDate: Date;
    actualEndDate?: Date;
    freezeDays: number;
    usedDays?: number;
    cancellationType?: string;
    creationDate: Date;
}