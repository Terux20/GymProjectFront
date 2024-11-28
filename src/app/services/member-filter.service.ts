import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberFilter } from '../models/memberFilter';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root',
})
export class MemberFilterService extends BaseApiService{
  constructor(private httpClient:HttpClient) { 
    super();
  }
  getMembers(): Observable<ListResponseModel<MemberFilter>> {
    let newPath = this.apiUrl + 'Member/getmemberdetails';
    return this.httpClient.get<ListResponseModel<MemberFilter>>(newPath);
  }
}
