// src/app/models/pagination.ts
export interface PagingParameters {
    pageNumber: number;
    pageSize: number;
    searchText?: string;
  }
  
  export interface PaginatedResult<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }
  
  // src/app/models/member.ts
  
  
  // src/app/models/memberFilter.ts
  export interface MemberFilter {
    memberID: number;
    membershipID: number;
    name: string;
    phoneNumber: string;
    gender: number;
    branch: string;
    remainingDays: number;
    isActive: boolean;
  }
  
  // src/app/models/paymentHistory.ts
  export interface PaymentHistory {
    paymentID: number;
    paymentDate: Date;
    paymentMethod: string;
    paymentAmount: number;
    membershipType: string;
    branch: string;
    name: string;
    phoneNumber: string;
    isActive: boolean;
  }
  
  // src/app/models/paymentTotals.ts
  export interface PaymentTotals {
    cash: number;
    creditCard: number;
    transfer: number;
    total: number;
  }