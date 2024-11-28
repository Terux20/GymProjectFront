import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Town } from '../models/town';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class TownService extends BaseApiService {

  constructor(private httpClient:HttpClient) { 
    super();
  }
  getTowns(): Observable<ListResponseModel<Town>> {
    let newPath = this.apiUrl + 'Town/getall';
    return this.httpClient.get<ListResponseModel<Town>>(newPath);
  }

 
}
