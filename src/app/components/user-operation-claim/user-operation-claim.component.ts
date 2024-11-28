// src/app/components/user-operation-claim/user-operation-claim.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserOperationClaimService } from '../../services/user-operation-claim.service';
import { OperationClaimService } from '../../services/operation-claim.service';
import { UserOperationClaim,UserOperationClaimDto } from '../../models/userOperationClaim';
import { OperationClaim } from '../../models/operationClaim'; 
import { User } from '../../models/user';

@Component({
  selector: 'app-user-operation-claim',
  templateUrl: './user-operation-claim.component.html',
  styleUrls: ['./user-operation-claim.component.css']
})
export class UserOperationClaimComponent implements OnInit {
  userOperationClaims: UserOperationClaimDto[] = [];
  users: User[] = [];
  operationClaims: OperationClaim[] = [];
  claimForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private userOperationClaimService: UserOperationClaimService,
    private userService: UserOperationClaimService,
    private operationClaimService: OperationClaimService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createClaimForm();
    this.getUserOperationClaims();
    this.getUsers();
    this.getOperationClaims();
  }

  createClaimForm() {
    this.claimForm = this.formBuilder.group({
      userId: ['', Validators.required],
      operationClaimId: ['', Validators.required]
    });
  }

  getUserOperationClaims() {
    this.isLoading = true;
    this.userOperationClaimService.getAll().subscribe(
      response => {
        this.userOperationClaims = response.data;
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('Kullanıcı rolleri yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }

  getUsers() {
    this.userService.getAllUsers().subscribe(
      response => {
        this.users = response.data;
      },
      error => {
        this.toastrService.error('Kullanıcılar yüklenirken bir hata oluştu', 'Hata');
      }
    );
  }

  getOperationClaims() {
    this.operationClaimService.getAll().subscribe(
      response => {
        this.operationClaims = response.data;
      },
      error => {
        this.toastrService.error('Roller yüklenirken bir hata oluştu', 'Hata');
      }
    );
  }

  addUserOperationClaim() {
    if (this.claimForm.valid) {
      this.isLoading = true;
      let claimModel = Object.assign({}, this.claimForm.value);
      this.userOperationClaimService.add(claimModel).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getUserOperationClaims();
          this.claimForm.reset();
        },
        error => {
          this.toastrService.error('Kullanıcı rolü eklenirken bir hata oluştu', 'Hata');
          this.isLoading = false;
        }
      );
    }
  }

  deleteUserOperationClaim(claim: UserOperationClaimDto) {
    if (confirm('Bu kullanıcı rolünü silmek istediğinizden emin misiniz?')) {
      this.userOperationClaimService.delete(claim.userOperationClaimId).subscribe(
        response => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getUserOperationClaims();
        },
        error => {
          this.toastrService.error('Kullanıcı rolü silinirken bir hata oluştu', 'Hata');
        }
      );
    }
  }
}