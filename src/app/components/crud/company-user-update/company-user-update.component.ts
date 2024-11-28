import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyUserDetail } from '../../../models/companyUserDetails';
import { CityService } from '../../../services/city.service';
import { TownService } from '../../../services/town.service';
import { City } from '../../../models/city';
import { Town } from '../../../models/town';

@Component({
  selector: 'app-company-user-update',
  templateUrl: './company-user-update.component.html',
  styleUrls: ['./company-user-update.component.css']
})
export class CompanyUserUpdateComponent implements OnInit {
  updateForm: FormGroup;
  cities: City[] = [];
  towns: Town[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyUserUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyUserDetail,
    private cityService: CityService,
    private townService: TownService
  ) {}

  ngOnInit(): void {
    this.createUpdateForm();
    this.getCities();
    this.getTowns();
  }

  createUpdateForm() {
    this.updateForm = this.formBuilder.group({
      companyUserId: [this.data.companyUserId],
      name: [this.data.companyUserName, Validators.required],
      cityID: ['', Validators.required],
      townID: ['', Validators.required],
      phoneNumber: [this.data.companyUserPhoneNumber, Validators.required],
      email: [this.data.companyUserEmail, [Validators.required, Validators.email]]
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

  onCityChange() {
    // İl değiştiğinde ilçeleri güncelle
    this.getTowns();
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