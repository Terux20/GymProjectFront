import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { Transaction } from '../models/transaction';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  addTransaction(transaction: any): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.apiUrl + 'transactions/add', transaction);
  }

  getTransactionsWithDetails(): Observable<ListResponseModel<Transaction>> {
    return this.httpClient.get<ListResponseModel<Transaction>>(this.apiUrl + 'transactions/getwithuserproductdetails');
  }
  getTransactionsByMemberId(memberId: number): Observable<ListResponseModel<Transaction>> {
    return this.httpClient.get<ListResponseModel<Transaction>>(this.apiUrl + 'transactions/getbymemberid?memberId=' + memberId);
  }


}