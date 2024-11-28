import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { memberRemainingDay } from '../models/memberRemainingDay';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root',
})
export class MemberRemainingDayService extends BaseApiService{
  constructor(private httpClient:HttpClient) { 
    super();
  }

  getMemberRemainingDays(): Observable<ListResponseModel<memberRemainingDay>> {
    let newPath = this.apiUrl + 'Member/getmemberremainingday';
    return this.httpClient.get<ListResponseModel<memberRemainingDay>>(newPath);
  }
}
