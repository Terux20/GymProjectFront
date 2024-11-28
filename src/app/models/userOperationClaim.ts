export interface UserOperationClaim {
    userOperationClaimId: number;
    userId: number;
    operationClaimId: number;
  }
  
export interface UserOperationClaimDto {
  userOperationClaimId: number;
  userId: number;
  userName: string;
  operationClaimId: number;
  operationClaimName: string;
  email:string
}

