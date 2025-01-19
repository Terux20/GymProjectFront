import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-product-add',
    templateUrl: './product-add.component.html',
    styleUrls: ['./product-add.component.css'],
    standalone: false
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createProductForm();
  }

  createProductForm() {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  addProduct() {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      let productModel = Object.assign({}, this.productForm.value);
      this.productService.addProduct(productModel).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.resetForm();
          setTimeout(() => {
            window.location.reload();
          }, 1500); 
        },
        responseError => {
          if (responseError.error.Errors.length > 0) {
            for (let i = 0; i < responseError.error.Errors.length; i++) {
              this.toastrService.error(responseError.error.Errors[i].ErrorMessage, 'Doğrulama hatası');
            }
          }
        }
      ).add(() => {
        this.isSubmitting = false;
      });
    } else {
      this.toastrService.error('Formunuz eksik', 'Dikkat');
    }
  }

  resetForm() {
    this.productForm.reset({
      name: '',
      price: '',
      isActive: true
    });
  }
}