// remaining-debt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { RemainingDebtDetail } from '../models/RemainingDebtDetail'; 
import { DebtPayment } from '../models/debtPayment'; 

@Injectable({
  providedIn: 'root'
})
export class RemainingDebtService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  getRemainingDebtDetails(): Observable<ListResponseModel<RemainingDebtDetail>> {
    return this.httpClient.get<ListResponseModel<RemainingDebtDetail>>(
      `${this.apiUrl}remainingdebts/getremainingdebtdetails`
    );
  }

  addDebtPayment(debtPayment: DebtPayment): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.apiUrl}remainingdebts/adddebtpayment`,
      debtPayment
    );
  }
}