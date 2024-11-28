import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaymentHistory } from '../models/paymentHistory';
import { ListResponseModel } from '../models/listResponseModel';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { PaginatedResult } from '../models/pagination';
import { PaymentTotals } from '../models/paymentTotals';
import { SingleResponseModel } from '../models/singleResponseModel';

@Injectable({
  providedIn: 'root',
})
export class PaymentHistoryService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }
  getPaymentHistoryPaginated(
    parameters: {
      pageNumber: number;
      pageSize: number;
      searchText?: string;
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
    }
  ): Observable<SingleResponseModel<PaginatedResult<PaymentHistory>>> {
    let params = new HttpParams()
      .set('pageNumber', parameters.pageNumber.toString())
      .set('pageSize', parameters.pageSize.toString());

    if (parameters.searchText) params = params.set('searchText', parameters.searchText);
    if (parameters.startDate) params = params.set('startDate', parameters.startDate.toISOString());
    if (parameters.endDate) params = params.set('endDate', parameters.endDate.toISOString());
    if (parameters.paymentMethod) params = params.set('paymentMethod', parameters.paymentMethod);

    return this.httpClient.get<SingleResponseModel<PaginatedResult<PaymentHistory>>>(
      `${this.apiUrl}payment/getpaymenthistorypaginated`,
      { params }
    );
  }

  getPaymentTotals(
    parameters: {
      searchText?: string;
      startDate?: Date;
      endDate?: Date;
      paymentMethod?: string;
    }
  ): Observable<SingleResponseModel<PaymentTotals>> {
    let params = new HttpParams();

    if (parameters.searchText) params = params.set('searchText', parameters.searchText);
    if (parameters.startDate) params = params.set('startDate', parameters.startDate.toISOString());
    if (parameters.endDate) params = params.set('endDate', parameters.endDate.toISOString());
    if (parameters.paymentMethod) params = params.set('paymentMethod', parameters.paymentMethod);

    return this.httpClient.get<SingleResponseModel<PaymentTotals>>(
      `${this.apiUrl}payment/getpaymenttotals`,
      { params }
    );
  }
  
  getPaymentHistories(): Observable<ListResponseModel<PaymentHistory>> {
    let newPath = this.apiUrl + 'Payment/getpaymenthistory';

    return this.httpClient.get<ListResponseModel<PaymentHistory>>(newPath);
  }
  getDebtorMembers(): Observable<ListResponseModel<PaymentHistory>> {
    let newPath = this.apiUrl + 'Payment/GetDebtorMembers';

    return this.httpClient.get<ListResponseModel<PaymentHistory>>(newPath);
  } 
  updatePaymentStatus(paymentId: number, paymentMethod: string): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}Payment/updatestatus/${paymentId}`, { paymentMethod: paymentMethod });
  }
  delete(paymentId: number): Observable<ResponseModel> {
    let deletePath = `${this.apiUrl}payment/delete/?id=${paymentId}`;
    return this.httpClient.delete<ResponseModel>(deletePath);
  }
  
  get(): Observable<ListResponseModel<PaymentHistory>> {
    let newPath = this.apiUrl + 'Payment/GetDebtorMembers';

    return this.httpClient.get<ListResponseModel<PaymentHistory>>(newPath);
  }
}
