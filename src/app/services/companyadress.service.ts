import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompanyAdress } from '../models/companyAdress';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { ListResponseModel } from '../models/listResponseModel';
import { BaseApiService } from './baseApiService';
import { CompanyAdressDetailDto } from '../models/companyAdressDetailDto';

@Injectable({
  providedIn: 'root'
})
export class CompanyadressService extends BaseApiService{
  constructor(private httpClient:HttpClient) { 
    super();
  }
  add(companyadress: CompanyAdress): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'companyadress/add',
      companyadress
    );
  }
  getCompanyAdresses(): Observable<ListResponseModel<CompanyAdress>> {
    let newPath = this.apiUrl + 'companyadress/getall';
    return this.httpClient.get<ListResponseModel<CompanyAdress>>(newPath);
  }
  getCompanyAdressesDetails(): Observable<ListResponseModel<CompanyAdressDetailDto>> {
    let newPath = this.apiUrl + 'companyadress/getcompanyadressdetails';
    return this.httpClient.get<ListResponseModel<CompanyAdressDetailDto>>(newPath);
  }
  delete(id: number): Observable<ResponseModel> {
    return this.httpClient.delete<ResponseModel>(`${this.apiUrl}companyadress/delete?id=${id}`);
  }

  update(companyadress: CompanyAdress): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(`${this.apiUrl}companyadress/update`, companyadress);
  }
}
