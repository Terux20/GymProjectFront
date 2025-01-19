import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { ProductService } from '../../services/product.service';
import { TransactionService } from '../../services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../../models/member';
import { Product } from '../../models/product';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface CartItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

@Component({
    selector: 'app-product-sale',
    templateUrl: './product-sale.component.html',
    styleUrls: ['./product-sale.component.css'],
    standalone: false
})
export class ProductSaleComponent implements OnInit {
  saleForm: FormGroup;
  members: Member[] = [];
  products: Product[] = [];
  filteredMembers: Observable<Member[]>;
  isLoading: boolean = false;
  cartItems: CartItem[] = [];
  totalAmount: number = 0;

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

    this.filteredMembers = this.saleForm.get('member')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name ?? ''),
      map(name => name ? this._filterMembers(name) : this.members.slice())
    );
  }

  createSaleForm() {
    this.saleForm = this.fb.group({
      member: ['', Validators.required],
      product: [''],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addToCart() {
    const selectedProduct = this.saleForm.get('product')?.value;
    const quantity = this.saleForm.get('quantity')?.value;

    if (selectedProduct && quantity) {
      const cartItem: CartItem = {
        productId: selectedProduct.productID,
        quantity: quantity,
        unitPrice: selectedProduct.price
      };

      this.cartItems.push(cartItem);
      this.calculateTotal();
      this.saleForm.patchValue({ product: '', quantity: 1 });
    }
  }

  removeFromCart(index: number) {
    this.cartItems.splice(index, 1);
    this.calculateTotal();
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.productID === productId);
    return product ? product.name : '';
  }

  calculateTotal() {
    this.totalAmount = this.cartItems.reduce((sum, item) => 
      sum + (item.unitPrice * item.quantity), 0);
  }

  sell() {
    if (this.saleForm.get('member')?.valid && this.cartItems.length > 0) {
      this.isLoading = true;
      const selectedMember = this.saleForm.get('member')?.value;

      const bulkTransaction = {
        memberID: selectedMember.memberID,
        transactionType: 'Satış',
        items: this.cartItems.map(item => ({
          productID: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice
        }))
      };

      this.transactionService.addBulkTransaction(bulkTransaction).subscribe({
        next: (response) => {
          this.toastrService.success('Ürün satışı başarılı', 'Başarılı');
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.toastrService.error('Ürün satışı başarısız', 'Hata');
          this.isLoading = false;
        }
      });
    }
  }

  displayMember(member: Member): string {
    return member && member.name ? member.name : '';
  }

  displayProduct(product: Product): string {
    return product && product.name ? `${product.name} (${product.price}₺)` : '';
  }

  private _filterMembers(name: string): Member[] {
    const filterValue = name.toLowerCase();
    return this.members.filter(member => 
      member.name.toLowerCase().includes(filterValue) || 
      member.phoneNumber.includes(filterValue)
    );
  }

  getMembers() {
    this.memberService.getMembers().subscribe(response => {
      this.members = response.data;
    });
  }

  getProducts() {
    this.productService.getProducts().subscribe(response => {
      this.products = response.data;
    });
  }

  resetForm() {
    this.saleForm.reset({
      member: '',
      product: '',
      quantity: 1
    });
    this.cartItems = [];
    this.totalAmount = 0;
  }
}