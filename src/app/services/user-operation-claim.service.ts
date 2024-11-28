// src/app/services/user-operation-claim.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserOperationClaim,UserOperationClaimDto } from '../models/userOperationClaim'; 
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserOperationClaimService extends BaseApiService {

  constructor(private httpClient: HttpClient) {
    super();
  }
  getAll(): Observable<ListResponseModel<UserOperationClaimDto>> {
    return this.httpClient.get<ListResponseModel<UserOperationClaimDto>>(`${this.apiUrl}useroperationclaims/getuseroperationclaimdetails`);
  }
  getAllUsers(): Observable<ListResponseModel<User>> {
    return this.httpClient.get<ListResponseModel<User>>(`${this.apiUrl}user/getall`);
  }
  add(userOperationClaim: UserOperationClaim): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}useroperationclaims/add`, userOperationClaim);
  }

  update(userOperationClaim: UserOperationClaim): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}useroperationclaims/update`, userOperationClaim);
  }

  delete(id: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(`${this.apiUrl}useroperationclaims/delete?id=${id}`);
  }
 
}