import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ProductUpdateComponent } from '../crud/product-update/product-update.component';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css'],
    standalone: false
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;
  isLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.createProductForm();
  }

  createProductForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  getProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe(
      response => {
        this.products = response.data;
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('Ürünler yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }

  addProduct() {
    if (this.productForm.valid) {
      this.isLoading = true;
      
      let productModel = Object.assign({}, this.productForm.value);
      this.productService.addProduct(productModel).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getProducts();
          this.productForm.reset();
        },
        responseError => {
          this.toastrService.error(responseError.error.message, 'Hata');
          this.isLoading = false;
        }
      );
    }
  }

  deleteProduct(product: Product) {
    this.isLoading = true;
    this.productService.deleteProduct(product.productID).subscribe(
      response => {
        this.toastrService.success(response.message, 'Başarılı');
        this.getProducts();
      },
      responseError => {
        this.toastrService.error(responseError.error.message, 'Hata');
        this.isLoading = false;
      }
    );
  }

  editProduct(product: Product) {
    const dialogRef = this.dialog.open(ProductUpdateComponent, {
      width: '400px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.productService.updateProduct(result).subscribe(
          response => {
            this.toastrService.success(response.message, 'Başarılı');
            this.getProducts();
          },
          responseError => {
            this.toastrService.error(responseError.error.message, 'Hata');
            this.isLoading = false;
          }
        );
      }
    });
  }
}