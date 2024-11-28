import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserCompanyService } from '../../../services/usercompany.service'; 
import { CompanyUserService } from '../../../services/company-user.service';
import { CompanyService } from '../../../services/company.service';
import { CompanyUser } from '../../../models/companyUser';
import { Company } from '../../../models/company';
import { UserCompany } from '../../../models/usercompany';
import { UserCompanyDetail } from '../../../models/userCompanyDetailDto';
import { MatDialog } from '@angular/material/dialog';
import { UserCompanyUpdateComponent } from '../user-company-update/user-company-update.component';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ResponseModel } from '../../../models/responseModel';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-usercompany-add',
  templateUrl: './usercompany-add.component.html',
  styleUrls: ['./usercompany-add.component.css']
})
export class UsercompanyAddComponent implements OnInit {
  userCompanyAddForm: FormGroup;
  userCompanies: UserCompanyDetail[] = [];
  companyUsers: CompanyUser[] = [];
  companies: Company[] = [];
  isSubmitting: boolean = false;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  filteredCompanyUsers: Observable<CompanyUser[]>;
  filteredCompanies: Observable<Company[]>;

  constructor(
    private formBuilder: FormBuilder,
    private userCompanyService: UserCompanyService,
    private companyUserService: CompanyUserService,
    private companyService: CompanyService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createUserCompanyAddForm();
    this.getCompanyUsers();
    this.getCompanies();
    this.getUserCompanies();

    this.filteredCompanyUsers = this.userCompanyAddForm.get('userID')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterCompanyUsers(name) : this.companyUsers.slice())
    );

    this.filteredCompanies = this.userCompanyAddForm.get('companyId')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.companyName),
      map(name => name ? this._filterCompanies(name) : this.companies.slice())
    );
  }

  createUserCompanyAddForm() {
    this.userCompanyAddForm = this.formBuilder.group({
      userID: ['', Validators.required],
      companyId: ['', Validators.required],
    });
  }

  add() {
    if (this.userCompanyAddForm.valid) {
      this.isSubmitting = true;
      let userCompanyModel = Object.assign({}, this.userCompanyAddForm.value);
      userCompanyModel.userID = userCompanyModel.userID.companyUserID;
      userCompanyModel.companyId = userCompanyModel.companyId.companyID;
      this.userCompanyService.add(userCompanyModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getUserCompanies();
          this.resetForm();
          this.isSubmitting = false;
        },
        (responseError) => {
          if (responseError.error.Errors.length > 0) {
            for (let i = 0; i < responseError.error.Errors.length; i++) {
              this.toastrService.error(
                responseError.error.Errors[i].ErrorMessage,
                'Doğrulama hatası'
              );
            }
          }
          this.isSubmitting = false;
        }
      );
    } else {
      this.toastrService.error('Formunuz eksik', 'Dikkat');
    }
  }

  getCompanyUsers() {
    this.companyUserService.getCompanyUsers().subscribe((response) => {
      this.companyUsers = response.data;
    });
  }

  getCompanies() {
    this.companyService.getCompanies().subscribe((response) => {
      this.companies = response.data;
    });
  }

  getUserCompanies() {
    this.isSubmitting = true;
    this.userCompanyService.getUserCompanyDetails().subscribe(
      response => {
        this.userCompanies = response.data;
        this.isSubmitting = false;
      },
      error => {
        console.error('Error fetching user companies:', error);
        this.toastrService.error('Kullanıcı şirketleri yüklenirken bir hata oluştu.', 'Hata');
        this.isSubmitting = false;
      }
    );
  }

  deleteUserCompany(userCompany: UserCompanyDetail) {
    if (confirm("Bu kullanıcı-şirket ilişkisini silmek istediğinizden emin misiniz?")) {
      this.isSubmitting = true;
      this.userCompanyService.delete(userCompany.userCompanyId).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getUserCompanies();
        },
        (error) => {
          console.error('Error deleting user company:', error);
          this.toastrService.error('Kullanıcı-şirket ilişkisi silinirken bir hata oluştu.', 'Hata');
          this.isSubmitting = false;
        }
      );
    }
  }

  openUpdateDialog(userCompany: UserCompanyDetail): void {
    const dialogRef = this.dialog.open(UserCompanyUpdateComponent, {
      width: '400px',
      data: {
        userCompany: userCompany,
        companyUsers: this.companyUsers,
        companies: this.companies
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSubmitting = true;
        this.userCompanyService.update(result).subscribe(
          (response:ResponseModel) => {
            this.toastrService.success(response.message, 'Başarılı');
            this.getUserCompanies();
          },
          (error) => {
            console.error('Error updating user company:', error);
            this.toastrService.error('Kullanıcı-şirket ilişkisi güncellenirken bir hata oluştu.', 'Hata');
            this.isSubmitting = false;
          }
        );
      }
    });
  }

  displayCompanyUser(user: CompanyUser): string {
    return user && user.name ? user.name : '';
  }

  displayCompany(company: Company): string {
    return company && company.companyName ? company.companyName : '';
  }

  private _filterCompanyUsers(name: string): CompanyUser[] {
    const filterValue = name.toLowerCase();
    return this.companyUsers.filter(user => user.name.toLowerCase().includes(filterValue));
  }

  private _filterCompanies(name: string): Company[] {
    const filterValue = name.toLowerCase();
    return this.companies.filter(company => company.companyName.toLowerCase().includes(filterValue));
  }

  resetForm() {
    this.userCompanyAddForm.reset({
      userID: '',
      companyId: ''
    });
  }
}