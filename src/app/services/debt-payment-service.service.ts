// debt-payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class DebtPaymentService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  delete(debtPaymentId: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(`${this.apiUrl}debtpayments/delete?id=${debtPaymentId}`);
  }
}