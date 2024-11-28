// src/app/services/member-entry.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { MemberEntry } from '../models/memberEntry';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class MemberEntryService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  getTodayEntries(date: string): Observable<ListResponseModel<MemberEntry>> {
    return this.httpClient.get<ListResponseModel<MemberEntry>>(`${this.apiUrl}member/gettodayentries?date=${date}`);
  }
}