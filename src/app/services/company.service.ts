import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { HttpClient } from '@angular/common/http';
import { Company } from '../models/company';
import { ListResponseModel } from '../models/listResponseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  add(company: Company): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'company/add',
      company
    );
  }

  getCompanies(): Observable<ListResponseModel<Company>> {
    let newPath = this.apiUrl + 'Company/getactivecompanies';
    return this.httpClient.get<ListResponseModel<Company>>(newPath);
  }

  // Yeni eklenen metodlar
  update(company: Company): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'company/update',
      company
    );
  }

  delete(companyId: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(
      this.apiUrl + 'company/delete?id=' + companyId
    );
  }
}
