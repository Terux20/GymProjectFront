import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Member } from '../models/member';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { MemberQRInfoResponse } from '../models/member-qr-info.model';
import { PaginatedResult } from '../models/pagination';
import { MemberFilter } from '../models/memberFilter';
import { SingleResponseModel } from '../models/singleResponseModel';

@Injectable({
  providedIn: 'root',
})
export class MemberService extends BaseApiService {

  constructor(private httpClient:HttpClient) { 
    super();
  }
  getAllPaginated(pageNumber: number = 1, searchText: string = ''): Observable<SingleResponseModel<PaginatedResult<Member>>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('searchText', searchText);

    return this.httpClient.get<SingleResponseModel<PaginatedResult<Member>>>(
      `${this.apiUrl}member/getallpaginated`,
      { params }
    );
  }

  getMemberDetailsPaginated(
    pageNumber: number = 1, 
    searchText?: string, 
    gender?: number, 
    branch?: string
  ): Observable<SingleResponseModel<PaginatedResult<MemberFilter>>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', '50');

    if (searchText) params = params.set('searchText', searchText);
    if (gender !== undefined) params = params.set('gender', gender.toString());
    if (branch) params = params.set('branch', branch);

    return this.httpClient.get<SingleResponseModel<PaginatedResult<MemberFilter>>>(
      `${this.apiUrl}member/getmemberdetailspaginated`,
      { params }
    );
  }

  getMembers(): Observable<ListResponseModel<Member>> {
    let newPath = this.apiUrl + 'member/getactivemembers';

    return this.httpClient.get<ListResponseModel<Member>>(newPath);
  }
  add(member: Member): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'member/add',
      member
    );
  }
  delete(memberId: number): Observable<ResponseModel> {
    let deletePath = `${this.apiUrl}member/delete/?id=${memberId}`;
    return this.httpClient.delete<ResponseModel>(deletePath);
  }
  update(member: Member): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'member/update',
      member
    );
  }
  getMemberQRInfo(phoneNumber: string): Observable<MemberQRInfoResponse> {
    let path = `${this.apiUrl}member/getbyphone?phoneNumber=${phoneNumber}`;
    return this.httpClient.get<MemberQRInfoResponse>(path);
  }
  getTotalActiveMembers(): Observable<SingleResponseModel<number>> {
    return this.httpClient.get<SingleResponseModel<number>>(
        `${this.apiUrl}member/gettotalactivemembers`
    );
}
getActiveMemberCounts(): Observable<SingleResponseModel<{male: number, female: number}>> {
  return this.httpClient.get<SingleResponseModel<{male: number, female: number}>>(
    `${this.apiUrl}member/getactivemembercounts`
  );
}
getBranchCounts(): Observable<SingleResponseModel<{ [key: string]: number }>> {
  return this.httpClient.get<SingleResponseModel<{ [key: string]: number }>>(
    `${this.apiUrl}member/getbranchcounts`
  );
}
}
