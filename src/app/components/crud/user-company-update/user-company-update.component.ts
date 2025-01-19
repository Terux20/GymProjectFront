import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserCompanyDetail } from '../../../models/userCompanyDetailDto';
import { CompanyUser } from '../../../models/companyUser';
import { Company } from '../../../models/company';

@Component({
    selector: 'app-user-company-update',
    templateUrl: './user-company-update.component.html',
    styleUrls: ['./user-company-update.component.css'],
    standalone: false
})
export class UserCompanyUpdateComponent implements OnInit {
  updateForm: FormGroup;
  companyUsers: CompanyUser[];
  companies: Company[];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserCompanyUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      userCompany: UserCompanyDetail,
      companyUsers: CompanyUser[],
      companies: Company[]
    }
  ) {
    this.companyUsers = data.companyUsers;
    this.companies = data.companies;
  }

  ngOnInit(): void {
    this.createUpdateForm();
  }

  createUpdateForm() {
    this.updateForm = this.formBuilder.group({
      userCompanyId: [this.data.userCompany.userCompanyId],
      userID: [this.data.userCompany.companyUserName, Validators.required],
      companyId: [this.data.userCompany.companyName, Validators.required],
      isActive: [this.data.userCompany.isActive, Validators.required],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      this.dialogRef.close(this.updateForm.value);
    }
  }
}