import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseModel } from '../models/responseModel';
import { Observable } from 'rxjs';
import { UserCompany } from '../models/usercompany';
import { ListResponseModel } from '../models/listResponseModel';
import { CompanyDetail } from '../models/companyDetail';
import { BaseApiService } from './baseApiService';
import { UserCompanyDetail } from '../models/userCompanyDetailDto';

@Injectable({
  providedIn: 'root',
})
export class UserCompanyService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }
  add(usercompany: UserCompany): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'usercompany/add',
      usercompany
    );
  }
  getUserCompanies(): Observable<ListResponseModel<UserCompany>> {
    let newPath = this.apiUrl + 'usercompany/getall';
    return this.httpClient.get<ListResponseModel<UserCompany>>(newPath);
  }
  getUserCompanyDetails(): Observable<ListResponseModel<UserCompanyDetail>> {
    return this.httpClient.get<ListResponseModel<UserCompanyDetail>>(
      this.apiUrl + 'usercompany/getusercompanydetails'
    );
  }
  update(company: UserCompany): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'usercompany/update',
      company
    );
  }

  delete(userCompanyId: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(
      this.apiUrl + 'usercompany/delete?id=' + userCompanyId
    );
  }
}
