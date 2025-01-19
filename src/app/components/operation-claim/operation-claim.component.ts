// src/app/components/operation-claim/operation-claim.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OperationClaimService } from '../../services/operation-claim.service';
import { OperationClaim } from '../../models/operationClaim';

@Component({
    selector: 'app-operation-claim',
    templateUrl: './operation-claim.component.html',
    styleUrls: ['./operation-claim.component.css'],
    standalone: false
})
export class OperationClaimComponent implements OnInit {
  operationClaims: OperationClaim[] = [];
  claimForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private operationClaimService: OperationClaimService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createClaimForm();
    this.getOperationClaims();
  }

  createClaimForm() {
    this.claimForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  getOperationClaims() {
    this.isLoading = true;
    this.operationClaimService.getAll().subscribe(
      response => {
        this.operationClaims = response.data;
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('Roller yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }

  addOperationClaim() {
    if (this.claimForm.valid) {
      this.isLoading = true;
      let claimModel = Object.assign({}, this.claimForm.value);
      this.operationClaimService.add(claimModel).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getOperationClaims();
          this.claimForm.reset();
        },
        error => {
          this.toastrService.error('Rol eklenirken bir hata oluştu', 'Hata');
          this.isLoading = false;
        }
      );
    }
  }

  deleteOperationClaim(claim: OperationClaim) {
    if (confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
      this.operationClaimService.delete(claim.operationClaimId).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getOperationClaims();
        },
        error => {
          this.toastrService.error('Rol silinirken bir hata oluştu', 'Hata');
        }
      );
    }
  }
}