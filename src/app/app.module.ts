import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompanyuserComponent } from './components/companyuser/companyuser.component';
import { NaviComponent } from './components/navi/navi.component';
import { MemberComponent } from './components/member/member.component';
import { CompanyUserDetailsComponent } from './components/company-user-details/company-user-details.component';
import { MembershiptypeComponent } from './components/membershiptype/membershiptype.component';
import { MemberentryexithistoryComponent } from './components/memberentryexithistory/memberentryexithistory.component';
import { MemberRemainingDayComponent } from './components/member-remaining-day/member-remaining-day.component';
import { CityComponent } from './components/city/city.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipePipe } from './pipes/companyuser-filter-pipe.pipe';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MemberFilterPipePipe } from './pipes/memberfilter-pipe.pipe';
import { MemberFilterComponent } from './components/member-filter/member-filter.component';
import { AllmemberfilterpipePipe } from './pipes/allmemberfilterpipe.pipe';
import { ActiveMembersPipe } from './pipes/active-members.pipe';
import { PaymentHistoryComponent } from './components/payment-history/payment-history.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyadressAddComponent } from './components/crud/companyadress-add/companyadress-add.component';
import { CompanyAddComponent } from './components/crud/company-add/company-add.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MemberAddComponent } from './components/crud/member-add/member-add.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CompanyuserAddComponent } from './components/crud/companyuser-add/companyuser-add.component';
import { UsercompanyAddComponent } from './components/crud/usercompany-add/usercompany-add.component';
import { MembershiptypeAddComponent } from './components/crud/membershiptype-add/membershiptype-add.component';
import { MembershipAddComponent } from './components/crud/membership-add/membership-add.component';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaymenthistoryfilterPipePipe } from './pipes/paymenthistoryfilter-pipe.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MemberUpdateComponent } from './components/crud/member-update/member-update.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { MembershiptypeUpdateComponent } from './components/crud/membershiptype-update/membershiptype-update.component';
import { MembershipUpdateComponent } from './components/crud/membership-update/membership-update.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppUnauthorizedComponent } from './components/app-unauthorized/app-unauthorized.component';
import { MemberQRCodeComponent } from './components/member-qrcode/member-qrcode.component';
import { DebtorMemberComponent } from './components/debtor-member/debtor-member.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TodayEntriesComponent } from './components/today-entries/today-entries.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductUpdateComponent } from './components/crud/product-update/product-update.component';
import { ProductAddComponent } from './components/crud/product-add/product-add.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { MemberBalanceTopupComponent } from './components/member-balance-topup/member-balance-topup.component';
import { ProductSaleComponent } from './components/product-sale/product-sale.component';
import { UpdateBalanceDialogComponent } from './components/update-balance-dialog/update-balance-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { CompanyUpdateComponent } from './components/crud/company-update/company-update.component';
import { CompanyAdressUpdateComponent } from './components/crud/company-adress-update/company-adress-update.component';
import { CompanyUserUpdateComponent } from './components/crud/company-user-update/company-user-update.component';
import { UserCompanyUpdateComponent } from './components/crud/user-company-update/user-company-update.component';
import { OperationClaimComponent } from './components/operation-claim/operation-claim.component';
import { UserOperationClaimComponent } from './components/user-operation-claim/user-operation-claim.component';
import { MatIconModule } from '@angular/material/icon';
import { TransactionPaymentDialogComponent } from './components/transaction-payment-dialog/transaction-payment-dialog.component';
import { DebtPaymentDialogComponent } from './components/debt-payment-dialog/debt-payment-dialog.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { VisitStatsComponent } from './components/visit-stats/visit-stats.component';
registerLocaleData(localeTr);

@NgModule({
  declarations: [
    AppComponent,
    CompanyuserComponent,
    NaviComponent,
    MemberComponent,
    CompanyUserDetailsComponent,
    MembershiptypeComponent,
    MemberentryexithistoryComponent,
    MemberRemainingDayComponent,
    CityComponent,
    FilterPipePipe,
    MemberFilterPipePipe,
    MemberFilterComponent,
    AllmemberfilterpipePipe,
    ActiveMembersPipe,
    PaymentHistoryComponent,
    CompanyadressAddComponent,
    CompanyAddComponent,
    MemberAddComponent,
    CompanyuserAddComponent,
    UsercompanyAddComponent,
    MembershiptypeAddComponent,
    MembershipAddComponent,
    PaymenthistoryfilterPipePipe,
    MemberUpdateComponent,
    MembershiptypeUpdateComponent,
    MembershipUpdateComponent,
    LoginComponent,
    AppUnauthorizedComponent,
    MemberQRCodeComponent,
    DebtorMemberComponent,
    ConfirmationDialogComponent,
    TodayEntriesComponent,
    ProductListComponent,
    ProductUpdateComponent,
    ProductAddComponent,
    TransactionListComponent,
    MemberBalanceTopupComponent,
    ProductSaleComponent,
    UpdateBalanceDialogComponent,
    LoadingSpinnerComponent,
    CompanyUpdateComponent,
    CompanyAdressUpdateComponent,
    CompanyUserUpdateComponent,
    UserCompanyUpdateComponent,
    OperationClaimComponent,
    UserOperationClaimComponent,
    TransactionPaymentDialogComponent,
    DebtPaymentDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule,
    ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
    }),
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatSlideToggleModule,
    NgxPaginationModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    FontAwesomeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    NgxPaginationModule,
    QRCodeComponent,
    VisitStatsComponent
],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    { provide: LOCALE_ID, useValue: 'tr-TR' },
    { provide: MAT_DATE_LOCALE, useValue: 'tr-TR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}