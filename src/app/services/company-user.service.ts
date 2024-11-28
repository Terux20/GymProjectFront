import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { CompanyUser } from '../models/companyUser';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { CompanyUserDetail } from '../models/companyUserDetails';

@Injectable({
  providedIn: 'root',
})
export class CompanyUserService extends BaseApiService{
  constructor(private httpClient:HttpClient) { 
    super();
  }
  getCompanyUsers(): Observable<ListResponseModel<CompanyUser>> {
    let newPath = this.apiUrl + 'companyUser/getall';
    return this.httpClient.get<ListResponseModel<CompanyUser>>(newPath);
  }
  
    add(companyUser: CompanyUser): Observable<ResponseModel> {
      return this.httpClient.post<ResponseModel>(
        this.apiUrl + 'companyuser/add',
        companyUser
      );
    }
    getCompanyUserDetails(): Observable<ListResponseModel<CompanyUserDetail>> {
      let newPath = this.apiUrl + 'companyUser/getcompanyuserdetails';
      return this.httpClient.get<ListResponseModel<CompanyUserDetail>>(newPath);
    }
    update(company: CompanyUser): Observable<ResponseModel> {
      return this.httpClient.post<ResponseModel>(
        this.apiUrl + 'companyuser/update',
        company
      );
    }
  
    delete(companyUserId: number): Observable<ResponseModel> {
      return this.httpClient.delete<ResponseModel>(
        this.apiUrl + 'companyuser/delete?id=' + companyUserId
      );
    }
}
