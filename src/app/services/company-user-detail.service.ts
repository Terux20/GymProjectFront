import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListResponseModel } from '../models/listResponseModel';
import { Observable } from 'rxjs';
import { CompanyDetail } from '../models/companyDetail';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root',
})
export class CompanyUserDetailService extends BaseApiService{
 
  constructor(private httpClient:HttpClient) { 
    super();
  }
  getCompanyUserDetails(): Observable<ListResponseModel<CompanyDetail>> {
    let newPath = this.apiUrl + 'CompanyUser/getcompanydetails';
    return this.httpClient.get<ListResponseModel<CompanyDetail>>(newPath);
  }
  getCompanyUserDetailsByCity(
    cityId: number
  ): Observable<ListResponseModel<CompanyDetail>> {
    let newPath =
      this.apiUrl +
      'CompanyUser/getcompanyuserdetailsbycityid?cityId=' +
      cityId;
    return this.httpClient.get<ListResponseModel<CompanyDetail>>(newPath);
  }
}
