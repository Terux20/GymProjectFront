import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { Product } from '../models/product';
import { BaseApiService } from './baseApiService';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService {
  constructor(private httpClient: HttpClient) {
    super();
  }

  getProducts(): Observable<ListResponseModel<Product>> {
    return this.httpClient.get<ListResponseModel<Product>>(this.apiUrl + 'products/getall');
  }

  addProduct(product: Product): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.apiUrl + 'products/add', product);
  }

  updateProduct(product: Product): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.apiUrl + 'products/update', product);
  }

  deleteProduct(productId: number): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(this.apiUrl + 'products/delete?id=' + productId, {});
  }
}