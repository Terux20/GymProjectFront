import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Member } from '../../../models/member'; 
import { MembershipType } from '../../../models/membershipType'; 
import { MemberService } from '../../../services/member.service';
import { MembershipService } from '../../../services/membership.service'; 
import { MembershipTypeService } from '../../../services/membership-type.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-membership-add',
  templateUrl: './membership-add.component.html',
  styleUrls: ['./membership-add.component.css'],
  standalone: false
})
export class MembershipAddComponent implements OnInit {
  membershipAddForm: FormGroup;
  members: Member[] = [];
  membershipTypes: MembershipType[] = [];
  filteredMembers: Observable<Member[]>;
  filteredMembershipTypes: Observable<MembershipType[]>;
  showBranchList: boolean = false;
  lastMembershipInfo: string | null = null;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private membershipService: MembershipService,
    private membershipTypeService: MembershipTypeService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createMembershipAddForm();
    this.getMembers();
    this.getMembershipTypes();
    this.setupMemberAutocomplete();
    this.setupMembershipTypeAutocomplete();
    this.setupMembershipEndDateCalculation();
  }

  createMembershipAddForm() {
    this.membershipAddForm = this.formBuilder.group({
      memberID: ['', Validators.required],
      membershipTypeID: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [''],
      day: [''],
      price: [''],
      PaymentMethod: ['', Validators.required],
      paymentStatus: ['Completed'] // Yeni alan eklendi
    });
  
    const memberIdControl = this.membershipAddForm.get('memberID');
    if (memberIdControl) {
      memberIdControl.valueChanges.subscribe(value => {
        if (value && typeof value === 'object') {
          this.getLastMembershipInfo(value.memberID);
        }
      });
    }
  }

  getMembers() {
    this.memberService.getMembers().subscribe(response => {
      this.members = response.data;
    });
  }

  getMembershipTypes() {
    this.membershipTypeService.getMembershipTypes().subscribe(response => {
      this.membershipTypes = response.data;
    });
  }

  setupMemberAutocomplete() {
    const memberIdControl = this.membershipAddForm.get('memberID');
    if (memberIdControl) {
      this.filteredMembers = memberIdControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const name = typeof value === 'string' ? value : value?.name;
          return name ? this._filterMembers(name) : this.members.slice();
        })
      );
    }
  }

  setupMembershipTypeAutocomplete() {
    const membershipTypeControl = this.membershipAddForm.get('membershipTypeID');
    if (membershipTypeControl) {
      this.filteredMembershipTypes = membershipTypeControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const type = typeof value === 'string' ? value : '';
          return this._filterMembershipTypes(type);
        })
      );

      membershipTypeControl.valueChanges.subscribe(value => {
        if (value) {
          const selectedType = this.membershipTypes.find(
            type => `${type.branch} - ${type.typeName}` === value
          );
          if (selectedType) {
            this.membershipAddForm.patchValue({
              day: selectedType.day,
              price: selectedType.price
            });
            this.calculateEndDate();
          }
        }
      });
    }
  }

  setupMembershipEndDateCalculation() {
    const dayControl = this.membershipAddForm.get('day');
    const startDateControl = this.membershipAddForm.get('startDate');

    if (dayControl) {
      dayControl.valueChanges.subscribe(() => {
        this.calculateEndDate();
      });
    }

    if (startDateControl) {
      startDateControl.valueChanges.subscribe(() => {
        this.calculateEndDate();
      });
    }
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = value.toLowerCase();
    return this.members.filter(member =>
      member.name.toLowerCase().includes(filterValue) ||
      member.phoneNumber.includes(filterValue)
    );
  }

  private _filterMembershipTypes(value: string): MembershipType[] {
    const filterValue = value.toLowerCase();
    return this.membershipTypes.filter(type =>
      `${type.branch} - ${type.typeName}`.toLowerCase().includes(filterValue)
    );
  }

  displayMember(member: Member): string {
    return member && member.name ? `${member.name} - ${member.phoneNumber}` : '';
  }

  calculateEndDate() {
    const startDateControl = this.membershipAddForm.get('startDate');
    const dayControl = this.membershipAddForm.get('day');

    if (startDateControl?.value && dayControl?.value) {
      const startDate = new Date(startDateControl.value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(dayControl.value));
      this.membershipAddForm.patchValue({ endDate: endDate });
    }
  }

  getLastMembershipInfo(memberId: number) {
    this.membershipService.getLastMembershipInfo(memberId).subscribe(
      response => {
        if (response.success) {
          const data = response.data;
          if (data.lastEndDate) {
            const endDate = new Date(data.lastEndDate);
            const now = new Date();
            if (endDate > now) {
              this.lastMembershipInfo = `Aktif üyelik mevcut. Bitiş: ${endDate.toLocaleDateString()}`;
            } else {
              this.lastMembershipInfo = `Son üyelik ${endDate.toLocaleDateString()} tarihinde sona erdi.`;
            }
          } else {
            this.lastMembershipInfo = "Daha önce üyelik kaydı bulunmuyor.";
          }
        }
      },
      (error: any) => {
        console.error('Error fetching last membership info:', error);
        this.lastMembershipInfo = null;
      }
    );
  }

  add() {
    if (this.membershipAddForm.valid) {
      this.isSubmitting = true;
      let membershipModel = Object.assign({}, this.membershipAddForm.value);
      
      // memberID işlemi
      if (typeof membershipModel.memberID === 'object') {
        membershipModel.memberID = membershipModel.memberID.memberID;
      }
  
      // PaymentStatus belirleme
      if (membershipModel.PaymentMethod === 'Borç') {
        membershipModel.paymentStatus = 'Pending';
      } else {
        membershipModel.paymentStatus = 'Completed';
      }
  
      // Membership type işlemleri
      const selectedType = this.membershipTypes.find(
        type => `${type.branch} - ${type.typeName}` === membershipModel.membershipTypeID
      );
      if (selectedType) {
        membershipModel.membershipTypeID = selectedType.membershipTypeID;
        membershipModel.day = selectedType.day;
        membershipModel.price = selectedType.price;
      }
  
      // Tarih işlemleri
      if (membershipModel.startDate) {
        membershipModel.startDate = new Date(membershipModel.startDate);
      }
      if (membershipModel.endDate) {
        membershipModel.endDate = new Date(membershipModel.endDate);
      }
  
      this.membershipService.add(membershipModel).subscribe(
        response => {
          this.toastrService.success(response.message, "Başarılı");
          this.resetForm();
          this.isSubmitting = false;
        },
        responseError => {
          if (responseError.error.Errors && responseError.error.Errors.length > 0) {
            responseError.error.Errors.forEach((error: { ErrorMessage: string | undefined; }) => {
              this.toastrService.error(error.ErrorMessage, "Doğrulama hatası");
            });
          } else {
            this.toastrService.error(responseError.error.message || "Bir hata oluştu", "Hata");
          }
          this.isSubmitting = false;
        }
      );
    } else {
      this.toastrService.error("Lütfen tüm zorunlu alanları doldurun", "Form Eksik");
    }
  }
  

  resetForm() {
    this.membershipAddForm.reset();
    this.membershipAddForm.patchValue({
      startDate: new Date()
    });
    this.lastMembershipInfo = null;
  }

  isFormValid(): boolean {
    const memberIdControl = this.membershipAddForm.get('memberID');
    const membershipTypeIdControl = this.membershipAddForm.get('membershipTypeID');
    const startDateControl = this.membershipAddForm.get('startDate');
    const paymentMethodControl = this.membershipAddForm.get('PaymentMethod');

    return !!(memberIdControl?.valid && 
             membershipTypeIdControl?.valid && 
             startDateControl?.valid && 
             paymentMethodControl?.valid);
  }
}