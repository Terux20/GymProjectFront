import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { ToastrService } from 'ngx-toastr';
import { Company } from '../../../models/company';
import { MatDialog } from '@angular/material/dialog';
import { CompanyUpdateComponent } from '../company-update/company-update.component';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-company-add',
    templateUrl: './company-add.component.html',
    styleUrls: ['./company-add.component.css'],
    standalone: false
})
export class CompanyAddComponent implements OnInit {
  companyAddForm: FormGroup;
  isProcessCompleted: boolean = false;
  companies: Company[] = [];
  isSubmitting: boolean = false;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createCompanyAddForm();
    this.getCompanies();
  }

  createCompanyAddForm() {
    this.companyAddForm = this.formBuilder.group({
      companyName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    });
  }

  add() {
    if (this.companyAddForm.valid) {
      this.isSubmitting = true;
      let companyModel = Object.assign({}, this.companyAddForm.value);
      this.companyService.add(companyModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.isProcessCompleted = true;
          this.getCompanies();
          this.resetForm();
          this.isSubmitting = false;
        },
        (responseError) => {
          if (responseError.error.Errors.length > 0) {
            for (let i = 0; i < responseError.error.Errors.length; i++) {
              this.toastrService.error(
                responseError.error.Errors[i].ErrorMessage,
                'Hata'
              );
            }
          }
          this.isSubmitting = false;
        }
      );
    } else {
      this.toastrService.error('Formu eksiksiz doldurunuz', 'Hata');
    }
  }

  getCompanies() {
    this.isSubmitting = true;
    this.companyService.getCompanies().subscribe(
      (response) => {
        this.companies = response.data;
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Error fetching companies:', error);
        this.toastrService.error('Şirketler yüklenirken bir hata oluştu.', 'Hata');
        this.isSubmitting = false;
      }
    );
  }

  deleteCompany(company: Company) {
    if (confirm("Bu şirketi silmek istediğinizden emin misiniz?")) {
      this.isSubmitting = true;
      this.companyService.delete(company.companyID).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getCompanies();
        },
        (error) => {
          console.error('Error deleting company:', error);
          this.toastrService.error('Şirket silinirken bir hata oluştu.', 'Hata');
          this.isSubmitting = false;
        }
      );
    }
  }

  openUpdateDialog(company: Company): void {
    const dialogRef = this.dialog.open(CompanyUpdateComponent, {
      width: '400px',
      data: company
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSubmitting = true;
        this.companyService.update(result).subscribe(
          (response) => {
            this.toastrService.success(response.message, 'Başarılı');
            this.getCompanies();
          },
          (error) => {
            console.error('Error updating company:', error);
            this.toastrService.error('Şirket güncellenirken bir hata oluştu.', 'Hata');
            this.isSubmitting = false;
          }
        );
      }
    });
  }

  resetForm() {
    this.companyAddForm.reset({
      companyName: '',
      phoneNumber: ''
    });
  }
}