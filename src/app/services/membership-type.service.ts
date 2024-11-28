import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MembershipType } from '../models/membershipType';
import { ListResponseModel } from '../models/listResponseModel';
import { Observable } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root',
})
export class MembershipTypeService extends BaseApiService{
  constructor(private httpClient:HttpClient) { 
    super();
  }
  getMembershipTypes(): Observable<ListResponseModel<MembershipType>> {
    let newPath = this.apiUrl + 'membershipType/getall';

    return this.httpClient.get<ListResponseModel<MembershipType>>(newPath);
  }
  add(membershiptype: MembershipType): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'membershiptype/add',
      membershiptype
    );
  }
  delete(membershipTypeId: number): Observable<ResponseModel> {
    let deletePath = `${this.apiUrl}membershiptype/delete/?id=${membershipTypeId}`;
    return this.httpClient.delete<ResponseModel>(deletePath);
  }
  getBranches(): Observable<ListResponseModel<MembershipType>> {
    let newPath = this.apiUrl + 'MembershipType/getallbranches';
    return this.httpClient.get<ListResponseModel<MembershipType>>(newPath);
  }
  update(membershipType: MembershipType): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'membershiptype/update',
      membershipType
    );
  }
}
