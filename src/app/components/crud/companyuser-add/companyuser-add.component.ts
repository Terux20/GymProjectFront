import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CompanyUserService } from '../../../services/company-user.service';
import { CityService } from '../../../services/city.service';
import { TownService } from '../../../services/town.service';
import { City } from '../../../models/city';
import { Town } from '../../../models/town';
import { CompanyUser } from '../../../models/companyUser';
import { ListResponseModel } from '../../../models/listResponseModel';
import { CompanyUserDetail } from '../../../models/companyUserDetails';
import { MatDialog } from '@angular/material/dialog';
import { CompanyUserUpdateComponent } from '../company-user-update/company-user-update.component';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-companyuser-add',
  templateUrl: './companyuser-add.component.html',
  styleUrls: ['./companyuser-add.component.css'],
})
export class CompanyuserAddComponent implements OnInit {
  companyUserAddForm: FormGroup;
  cities: City[] = [];
  towns: Town[] = [];
  companyUsers: CompanyUser[] = [];
  isSubmitting: boolean = false;
  companyUserDetails: CompanyUserDetail[] = [];
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  filteredCities: Observable<City[]>;
  filteredTowns: Observable<Town[]>;

  constructor(
    private formBuilder: FormBuilder,
    private companyUserService: CompanyUserService,
    private toastrService: ToastrService,
    private cityService: CityService,
    private townService: TownService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createCompanyUserAddForm();
    this.getCities();
    this.getTowns();
    this.getCompanyUsers();

    this.filteredCities = this.companyUserAddForm.get('cityID')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.cityName),
      map(name => name ? this._filterCities(name) : this.cities.slice())
    );

    this.filteredTowns = this.companyUserAddForm.get('townID')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.townName),
      map(name => name ? this._filterTowns(name) : this.towns.slice())
    );
  }

  createCompanyUserAddForm() {
    this.companyUserAddForm = this.formBuilder.group({
      name: ['', Validators.required],
      cityID: ['', Validators.required],
      townID: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  add() {
    if (this.companyUserAddForm.valid) {
      this.isSubmitting = true;
      let companyUserModel = Object.assign({}, this.companyUserAddForm.value);
      companyUserModel.cityID = companyUserModel.cityID.cityID;
      companyUserModel.townID = companyUserModel.townID.townID;
      this.companyUserService.add(companyUserModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getCompanyUsers();
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

  getCities() {
    this.cityService
      .getCities()
      .subscribe((response: ListResponseModel<City>) => {
        this.cities = response.data;
      });
  }

  getTowns() {
    this.townService
      .getTowns()
      .subscribe((response: ListResponseModel<Town>) => {
        this.towns = response.data;
      });
  }

  getCompanyUsers() {
    this.isSubmitting = true;
    this.companyUserService.getCompanyUserDetails().subscribe(
      (response) => {
        this.companyUserDetails = response.data;
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Error fetching company users:', error);
        this.toastrService.error('Şirket kullanıcıları yüklenirken bir hata oluştu.', 'Hata');
        this.isSubmitting = false;
      }
    );
  }

  deleteCompanyUser(companyUser: CompanyUserDetail) {
    if (confirm("Bu şirket kullanıcısını silmek istediğinizden emin misiniz?")) {
      this.isSubmitting = true;
      this.companyUserService.delete(companyUser.companyUserId).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getCompanyUsers();
        },
        (error) => {
          console.error('Error deleting company user:', error);
          this.toastrService.error('Şirket kullanıcısı silinirken bir hata oluştu.', 'Hata');
          this.isSubmitting = false;
        }
      );
    }
  }

  openUpdateDialog(companyUser: CompanyUserDetail): void {
    const dialogRef = this.dialog.open(CompanyUserUpdateComponent, {
      width: '400px',
      data: companyUser
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSubmitting = true;
        this.companyUserService.update(result).subscribe(
          (response) => {
            this.toastrService.success(response.message, 'Başarılı');
            this.getCompanyUsers();
          },
          (error) => {
            console.error('Error updating company user:', error);
            this.toastrService.error('Şirket kullanıcısı güncellenirken bir hata oluştu.', 'Hata');
            this.isSubmitting = false;
          }
        );
      }
    });
  }

  displayCity(city: City): string {
    return city && city.cityName ? city.cityName : '';
  }

  displayTown(town: Town): string {
    return town && town.townName ? town.townName : '';
  }

  private _filterCities(name: string): City[] {
    const filterValue = name.toLowerCase();
    return this.cities.filter(city => city.cityName.toLowerCase().includes(filterValue));
  }

  private _filterTowns(name: string): Town[] {
    const filterValue = name.toLowerCase();
    return this.towns.filter(town => town.townName.toLowerCase().includes(filterValue));
  }

  resetForm() {
    this.companyUserAddForm.reset({
      name: '',
      cityID: '',
      townID: '',
      phoneNumber: '',
      email: ''
    });
  }
}