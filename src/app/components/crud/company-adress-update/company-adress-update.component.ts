import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyAdressDetailDto } from '../../../models/companyAdressDetailDto';
import { CityService } from '../../../services/city.service';
import { TownService } from '../../../services/town.service';
import { CompanyService } from '../../../services/company.service';
import { City } from '../../../models/city';
import { Town } from '../../../models/town';
import { Company } from '../../../models/company';

@Component({
    selector: 'app-company-adress-update',
    templateUrl: './company-adress-update.component.html',
    styleUrls: ['./company-adress-update.component.css'],
    standalone: false
})
export class CompanyAdressUpdateComponent implements OnInit {
  updateForm: FormGroup;
  cities: City[] = [];
  towns: Town[] = [];
  companies: Company[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyAdressUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyAdressDetailDto,
    private cityService: CityService,
    private townService: TownService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.createUpdateForm();
    this.getCities();
    this.getTowns();
    this.getCompanies();
  }

  createUpdateForm() {
    this.updateForm = this.formBuilder.group({
      companyAdressID: [this.data.companyAdressID],
      companyID: ['', Validators.required],
      cityID: ['', Validators.required],
      townID: ['', Validators.required],
      adress: [this.data.adress, Validators.required],
      isActive: [this.data.isActive],   
    });

    this.updateForm.patchValue({
      companyID: this.companies.find(c => c.companyName === this.data.companyName)?.companyID,
      cityID: this.cities.find(c => c.cityName === this.data.cityName)?.cityID,
      townID: this.towns.find(t => t.townName === this.data.townName)?.townID
    });
  }

  getCities() {
    this.cityService.getCities().subscribe(response => {
      this.cities = response.data;
      this.updateCitySelection();
    });
  }

  getTowns() {
    this.townService.getTowns().subscribe(response => {
      this.towns = response.data;
      this.updateTownSelection();
    });
  }

  getCompanies() {
    this.companyService.getCompanies().subscribe(response => {
      this.companies = response.data;
      this.updateCompanySelection();
    });
  }

  updateCitySelection() {
    const cityID = this.cities.find(c => c.cityName === this.data.cityName)?.cityID;
    if (cityID) {
      this.updateForm.patchValue({ cityID: cityID });
    }
  }

  updateTownSelection() {
    const townID = this.towns.find(t => t.townName === this.data.townName)?.townID;
    if (townID) {
      this.updateForm.patchValue({ townID: townID });
    }
  }

  updateCompanySelection() {
    const companyID = this.companies.find(c => c.companyName === this.data.companyName)?.companyID;
    if (companyID) {
      this.updateForm.patchValue({ companyID: companyID });
    }
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