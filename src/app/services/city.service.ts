import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { City } from '../models/city';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class CityService extends BaseApiService {


  constructor(private httpClient:HttpClient) { 
    super();
  }

  getCities(): Observable<ListResponseModel<City>> {
    let newPath = this.apiUrl + 'City/getall';
    return this.httpClient.get<ListResponseModel<City>>(newPath);
  }
}
