import { Component, OnInit } from '@angular/core';
import { CompanyDetail } from '../../models/companyDetail';
import { CompanyUserDetailService } from '../../services/company-user-detail.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-company-user-details',
    templateUrl: './company-user-details.component.html',
    styleUrls: ['./company-user-details.component.css'],
    standalone: false
})
export class CompanyUserDetailsComponent implements OnInit {
  companyUserDetails: CompanyDetail[] = [];
  filterText: string;

  constructor(
    private companyUserDetailService: CompanyUserDetailService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['cityID']) {
        this.getCompanyUserDetailsByCity(params['cityID']);
      } else {
        this.getCompanyUserDetails();
      }
    });
  }

  getCompanyUserDetails() {
    this.companyUserDetailService
      .getCompanyUserDetails()
      .subscribe((response) => {
        this.companyUserDetails = response.data;
      });
  }

  getCompanyUserDetailsByCity(cityId: number) {
    this.companyUserDetailService
      .getCompanyUserDetailsByCity(cityId)
      .subscribe((response) => {
        this.companyUserDetails = response.data;
      });
  }
}
