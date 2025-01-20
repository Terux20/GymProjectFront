import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberComponent } from './components/member/member.component';
import { CompanyuserComponent } from './components/companyuser/companyuser.component';
import { CompanyUserDetailsComponent } from './components/company-user-details/company-user-details.component';
import { MemberRemainingDayComponent } from './components/member-remaining-day/member-remaining-day.component';
import { MemberentryexithistoryComponent } from './components/memberentryexithistory/memberentryexithistory.component';
import { MemberFilterComponent } from './components/member-filter/member-filter.component';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { CompanyadressAddComponent } from './components/crud/companyadress-add/companyadress-add.component';
import { CompanyAddComponent } from './components/crud/company-add/company-add.component';
import { MemberAddComponent } from './components/crud/member-add/member-add.component';
import { CompanyuserAddComponent } from './components/crud/companyuser-add/companyuser-add.component';
import { UsercompanyAddComponent } from './components/crud/usercompany-add/usercompany-add.component';
import { MembershiptypeAddComponent } from './components/crud/membershiptype-add/membershiptype-add.component';
import { MembershipAddComponent } from './components/crud/membership-add/membership-add.component';
import { LoginComponent } from './components/login/login.component';
import { AppUnauthorizedComponent } from './components/app-unauthorized/app-unauthorized.component';
import { LoginGuard } from './guards/login.guard';
import { antiLoginGuard } from './guards/anti-login.guard';
import { roleGuard } from './guards/role-guard.guard';
import { MemberQRCodeComponent } from './components/member-qrcode/member-qrcode.component';
import { DebtorMemberComponent } from './components/debtor-member/debtor-member.component';
import { TodayEntriesComponent } from './components/today-entries/today-entries.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { MemberBalanceTopupComponent } from './components/member-balance-topup/member-balance-topup.component';
import { ProductSaleComponent } from './components/product-sale/product-sale.component';
import { OperationClaimComponent } from './components/operation-claim/operation-claim.component';
import { UserOperationClaimComponent } from './components/user-operation-claim/user-operation-claim.component';

const routes: Routes = [
  { path: "", component: LoginComponent, canActivate: [antiLoginGuard]},
  // { path: "memberentryexithistory", component: MemberentryexithistoryComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "companyuserdetails", component: CompanyUserDetailsComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "companyuser", component: CompanyuserComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "companyuser/getcompanyuserdetailsbycityid/:cityID", component: CompanyUserDetailsComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "allmembers", component: MemberComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "memberremainingday", component: MemberRemainingDayComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "memberfilter", component: MemberFilterComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "paymenthistory", component: PaymentHistoryComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "company/add", component: CompanyAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "companyadress/add", component: CompanyadressAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "member/add", component: MemberAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "companyuser/add", component: CompanyuserAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "usercompany/add", component: UsercompanyAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' }},
  { path: "membershiptype/add", component: MembershiptypeAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "membership/add", component: MembershipAddComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: "login", component: LoginComponent, canActivate: [antiLoginGuard]},
  { path: "unauthorized", component: AppUnauthorizedComponent },
  { path: "debtormember", component: DebtorMemberComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: 'todayentries', component: TodayEntriesComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] }},
  { path: 'products', component: ProductListComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] } },
  { path: 'transactions', component: TransactionListComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] } },
  { path: 'memberbalancetopup', component: MemberBalanceTopupComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] } },
  { path: 'product-sale', component: ProductSaleComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] } },
  { path: 'qr', component: MemberQRCodeComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: ['owner','admin'] } },
  { path: 'roles', component: OperationClaimComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' } },
  { path: 'user-roles', component: UserOperationClaimComponent, canActivate: [LoginGuard, roleGuard], data: { expectedRole: 'owner' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }