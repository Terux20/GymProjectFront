import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { ProductService } from '../../services/product.service';
import { TransactionService } from '../../services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../../models/member';
import { Product } from '../../models/product';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-product-sale',
  templateUrl: './product-sale.component.html',
  styleUrls: ['./product-sale.component.css']
})
export class ProductSaleComponent implements OnInit {
  saleForm: FormGroup;
  members: Member[] = [];
  products: Product[] = [];
  filteredMembers: Observable<Member[]>;
  filteredProducts: Observable<Product[]>;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private productService: ProductService,
    private transactionService: TransactionService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createSaleForm();
    this.getMembers();
    this.getProducts();
  }

  createSaleForm() {
    this.saleForm = this.fb.group({
      memberId: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.filteredMembers = this.saleForm.get('memberId')?.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name ?? ''),
      map(name => name ? this._filterMembers(name) : this.members.slice())
    ) ?? of([]);

    this.filteredProducts = this.saleForm.get('productId')?.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name ?? '';
        return name ? this._filterProducts(name) : this.products.slice();
      })
    ) ?? of([]);
  }

  getMembers() {
    this.isLoading = true;
    this.memberService.getMembers().subscribe(
      response => {
        this.members = response.data;
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('Üyeler yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
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

  displayMember(member: Member): string {
    return member && member.name ? member.name : '';
  }

  displayProduct(product: Product): string {
    return product && product.name ? product.name : '';
  }

  private _filterMembers(name: string): Member[] {
    const filterValue = name.toLowerCase();
    return this.members.filter(member => 
      member.name.toLowerCase().includes(filterValue) || 
      member.phoneNumber.includes(filterValue)
    );
  }

  private _filterProducts(name: string): Product[] {
    const filterValue = name.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(filterValue) || 
      product.price.toString().includes(filterValue)
    );
  }

  onProductInputFocus() {
    this.filteredProducts = of(this.products);
  }

  sell() {
    if (this.saleForm.valid) {
      this.isLoading = true;
      const selectedMember = this.saleForm.get('memberId')?.value;
      const selectedProduct = this.saleForm.get('productId')?.value;
      const quantity = this.saleForm.get('quantity')?.value;
      
      const totalAmount = selectedProduct.price * quantity;

      const saleData = {
        memberID: selectedMember.memberID,
        productID: selectedProduct.productID,
        amount: totalAmount,
        quantity: quantity,
        transactionType: 'Satış'
      };

      this.transactionService.addTransaction(saleData).subscribe(
        response => {
          this.toastrService.success('Ürün satışı başarılı', 'Başarılı');
          this.saleForm.reset({quantity: 1});
          this.isLoading = false;
        },
        error => {
          this.toastrService.error('Ürün satışı başarısız', 'Hata');
          this.isLoading = false;
        }
      );
    }
  }
}