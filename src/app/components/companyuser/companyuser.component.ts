import { Component, OnInit } from '@angular/core';
import { CompanyUser } from '../../models/companyUser';
import { CompanyUserService } from '../../services/company-user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-companyuser',
  templateUrl: './companyuser.component.html',
  styleUrl: './companyuser.component.css',
})
export class CompanyuserComponent implements OnInit {
  companyUsers: CompanyUser[] = [];
  constructor(
    private companyuserService: CompanyUserService,
  ) {}
  ngOnInit(): void {
    this.getCompanyUsers();
  }
  getCompanyUsers() {
    this.companyuserService.getCompanyUsers().subscribe((response) => {
      this.companyUsers = response.data;
    });
  }
}
