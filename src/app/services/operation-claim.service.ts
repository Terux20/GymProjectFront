// src/app/services/operation-claim.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperationClaim } from '../models/operationClaim'; 
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class OperationClaimService extends BaseApiService {

  constructor(private httpClient: HttpClient) {
    super();
  }
  getAll(): Observable<ListResponseModel<OperationClaim>> {
    return this.httpClient.get<ListResponseModel<OperationClaim>>(`${this.apiUrl}OperationClaims/getall`);
  }

  add(operationClaim: OperationClaim): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}OperationClaims/add`, operationClaim);
  }

  update(operationClaim: OperationClaim): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}OperationClaims/update`, operationClaim);
  }

  delete(id: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(`${this.apiUrl}OperationClaims/delete?id=${id}`);
  }
}