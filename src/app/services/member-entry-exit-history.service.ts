import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { memberEntryExitHistory } from '../models/memberEntryExitHistory';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class MemberEntryExitHistoryService extends BaseApiService {
constructor(private httpClient:HttpClient) { 
  super();
}
  
  getMemberEntryExitHistories(): Observable<ListResponseModel<memberEntryExitHistory>> {
    let newPath = this.apiUrl + 'Member/getmemberentryexithistory';
    return this.httpClient.get<ListResponseModel<memberEntryExitHistory>>(newPath);
  }
}
