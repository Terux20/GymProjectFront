import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CityService } from '../../../services/city.service';
import { TownService } from '../../../services/town.service';
import { CompanyService } from '../../../services/company.service';
import { City } from '../../../models/city';
import { Town } from '../../../models/town';
import { Company } from '../../../models/company';
import { ListResponseModel } from '../../../models/listResponseModel';
import { CompanyadressService } from '../../../services/companyadress.service';
import { CompanyAdressDetailDto } from '../../../models/companyAdressDetailDto';
import { MatDialog } from '@angular/material/dialog';
import { CompanyAdressUpdateComponent } from '../company-adress-update/company-adress-update.component';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
    selector: 'app-companyadress-add',
    templateUrl: './companyadress-add.component.html',
    styleUrls: ['./companyadress-add.component.css'],
    standalone: false
})
export class CompanyadressAddComponent implements OnInit {
  companyAdressAddForm: FormGroup;
  cities: City[] = [];
  towns: Town[] = [];
  companies: Company[] = [];
  companyAddresses: CompanyAdressDetailDto[] = [];
  isSubmitting: boolean = false;
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  filteredCompanies: Observable<Company[]>;
  filteredCities: Observable<City[]>;
  filteredTowns: Observable<Town[]>;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private companyAdressService: CompanyadressService,
    private cityService: CityService,
    private townService: TownService,
    private companyService: CompanyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createCompanyAdressAddForm();
    this.getCities();
    this.getTowns();
    this.getCompanies();
    this.getCompanyAddresses();

    this.filteredCompanies = this.companyAdressAddForm.get('company')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.companyName),
      map(name => name ? this._filterCompanies(name) : this.companies.slice())
    );

    this.filteredCities = this.companyAdressAddForm.get('city')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.cityName),
      map(name => name ? this._filterCities(name) : this.cities.slice())
    );

    this.filteredTowns = this.companyAdressAddForm.get('town')!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.townName),
      map(name => name ? this._filterTowns(name) : this.towns.slice())
    );
  }

  createCompanyAdressAddForm() {
    this.companyAdressAddForm = this.formBuilder.group({
      company: ['', Validators.required],
      city: ['', Validators.required],
      town: ['', Validators.required],
      adress: ['', Validators.required],
    });
  }

  add() {
    if (this.companyAdressAddForm.valid) {
      this.isSubmitting = true;
      let companyAdressModel = {
        companyID: this.companyAdressAddForm.get('company')!.value.companyID,
        cityID: this.companyAdressAddForm.get('city')!.value.cityID,
        townID: this.companyAdressAddForm.get('town')!.value.townID,
        adress: this.companyAdressAddForm.get('adress')!.value
      };
      this.companyAdressService.add(companyAdressModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getCompanyAddresses();
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
      this.toastrService.error('Formu eksiksiz doldurunuz', 'Hata');
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

  getCompanies() {
    this.companyService.getCompanies().subscribe((response) => {
      this.companies = response.data;
    });
  }

  getCompanyAddresses() {
    this.isSubmitting = true;
    this.companyAdressService.getCompanyAdressesDetails().subscribe(
      (response) => {
        this.companyAddresses = response.data;
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Error fetching company addresses:', error);
        this.toastrService.error('Şirket adresleri yüklenirken bir hata oluştu.', 'Hata');
        this.isSubmitting = false;
      }
    );
  }

  deleteCompanyAddress(companyAddress: CompanyAdressDetailDto) {
    if (confirm("Bu şirket adresini silmek istediğinizden emin misiniz?")) {
      this.isSubmitting = true;
      this.companyAdressService.delete(companyAddress.companyAdressID).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.getCompanyAddresses();
        },
        (error) => {
          console.error('Error deleting company address:', error);
          this.toastrService.error('Şirket adresi silinirken bir hata oluştu.', 'Hata');
          this.isSubmitting = false;
        }
      );
    }
  }

  openUpdateDialog(companyAddress: CompanyAdressDetailDto): void {
    const dialogRef = this.dialog.open(CompanyAdressUpdateComponent, {
      width: '400px',
      data: companyAddress
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSubmitting = true;
        this.companyAdressService.update(result).subscribe(
          (response) => {
            this.toastrService.success(response.message, 'Başarılı');
            this.getCompanyAddresses();
          },
          (error) => {
            console.error('Error updating company address:', error);
            this.toastrService.error('Şirket adresi güncellenirken bir hata oluştu.', 'Hata');
            this.isSubmitting = false;
          }
        );
      }
    });
  }

  displayCompany(company: Company): string {
    return company && company.companyName ? company.companyName : '';
  }

  displayCity(city: City): string {
    return city && city.cityName ? city.cityName : '';
  }

  displayTown(town: Town): string {
    return town && town.townName ? town.townName : '';
  }

  private _filterCompanies(name: string): Company[] {
    const filterValue = name.toLowerCase();
    return this.companies.filter(company => company.companyName.toLowerCase().includes(filterValue));
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
    this.companyAdressAddForm.reset({
      company: '',
      city: '',
      town: '',
      adress: ''
    });
  }
}