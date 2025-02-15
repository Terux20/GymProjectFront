import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { BaseApiService } from './baseApiService';
import { MembershipFreezeHistory } from '../models/membershipFreezeHistory';

@Injectable({
  providedIn: 'root'
})
export class MembershipFreezeHistoryService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  getFreezeHistories(): Observable<ListResponseModel<MembershipFreezeHistory>> {
    return this.httpClient.get<ListResponseModel<MembershipFreezeHistory>>(
      `${this.apiUrl}membershipfreezehistory/getall`
    );
  }

  getFreezeHistoriesByMembershipId(membershipId: number): Observable<ListResponseModel<MembershipFreezeHistory>> {
    return this.httpClient.get<ListResponseModel<MembershipFreezeHistory>>(
      `${this.apiUrl}membershipfreezehistory/getbymembershipid/${membershipId}`
    );
  }

  getRemainingFreezeDays(membershipId: number): Observable<SingleResponseModel<number>> {
    return this.httpClient.get<SingleResponseModel<number>>(
      `${this.apiUrl}membershipfreezehistory/getremainingfreezedays/${membershipId}`
    );
  }
}