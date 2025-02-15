import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Membership } from '../models/membership';
import { ResponseModel } from '../models/responseModel';
import { BaseApiService } from './baseApiService';
import { membershipUpdate } from '../models/membershipUpdate';

@Injectable({
  providedIn: 'root',
})
export class MembershipService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }
  freezeMembership(
    membershipId: number,
    freezeDays: number
  ): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.apiUrl}membership/freeze`,
      { membershipID: membershipId, freezeDays: freezeDays }
    );
  }

  unfreezeMembership(membershipId: number): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.apiUrl}membership/unfreeze/${membershipId}`,
      {}
    );
  }

  getFrozenMemberships(): Observable<ListResponseModel<any>> {
    return this.httpClient.get<ListResponseModel<any>>(
      `${this.apiUrl}membership/frozen`
    );
  }

  add(membership: Membership): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'membership/add',
      membership
    );
  }
  update(membership: membershipUpdate): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      this.apiUrl + 'membership/update',
      membership
    );
  }
  delete(membershipID: number): Observable<ResponseModel> {
    let deletePath = `${this.apiUrl}membership/delete/?id=${membershipID}`;
    return this.httpClient.delete<ResponseModel>(deletePath);
  }
  getMembershipById(membershipId: number): Observable<ResponseModel> {
    return this.httpClient.get<ResponseModel>(
      `${this.apiUrl}membership/getbymembershipid?id=${membershipId}`
    );
  }
  getLastMembershipInfo(memberId: number): Observable<any> {
    return this.httpClient.get<any>(
      `${this.apiUrl}membership/getlastmembershipinfo/${memberId}`
    );
  }
  cancelFreeze(membershipId: number): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.apiUrl}membership/cancel-freeze/${membershipId}`,
      {}
    );
  }

  reactivateFromToday(membershipId: number): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.apiUrl}membership/reactivate-from-today/${membershipId}`,
      {}
    );
  }
}
