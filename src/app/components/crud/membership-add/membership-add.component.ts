import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembershipService } from '../../../services/membership.service';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../../../models/member';
import { MemberService } from '../../../services/member.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MembershipType } from '../../../models/membershipType';
import { MembershipTypeService } from '../../../services/membership-type.service';

@Component({
  selector: 'app-membership-add',
  templateUrl: './membership-add.component.html',
  styleUrls: ['./membership-add.component.css'],
})
export class MembershipAddComponent implements OnInit {
  membershipAddForm: FormGroup;
  members: Member[] = [];
  membershipTypes: MembershipType[] = [];
  filteredMembers: Observable<Member[]>;
  filteredMembershipTypes: Observable<MembershipType[]>;
  showBranchList: boolean = false;
  isSubmitting = false;
  selectedMembershipType: MembershipType | null = null;
  lastMembershipInfo: string = '';

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private toastrService: ToastrService,
    private memberService: MemberService,
    private membershipTypeService: MembershipTypeService
  ) {}

  ngOnInit(): void {
    this.createMembershipAddForm();
    this.getMembers();
    this.getMembershipTypes();

    const memberControl = this.membershipAddForm.get('memberID');
    if (memberControl) {
      this.filteredMembers = memberControl.valueChanges.pipe(
        startWith(''),
        map((value) => (typeof value === 'string' ? value : value.name)),
        map((name) => (name ? this._filterMembers(name) : this.members.slice()))
      );

      memberControl.valueChanges.subscribe((value) => {
        if (typeof value === 'object' && value && value.memberID) {
          this.getLastMembershipInfo(value.memberID);
        }
      });
    }

    const membershipTypeControl =
      this.membershipAddForm.get('membershipTypeID');
    if (membershipTypeControl) {
      this.filteredMembershipTypes = membershipTypeControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterMembershipTypes(value))
      );

      membershipTypeControl.valueChanges.subscribe((value) => {
        this.onMembershipTypeSelected(value);
      });
    }
  }

  createMembershipAddForm() {
    this.membershipAddForm = this.fb.group({
      memberID: ['', Validators.required],
      membershipTypeID: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      PaymentMethod: ['', Validators.required],
      day: ['', Validators.required],
      price: ['', Validators.required],
    });
  }

  displayMember(member: Member | string): string {
    if (typeof member === 'string') return member;
    return member ? member.name : '';
  }

  onMembershipTypeSelected(value: string) {
    const [branch, typeName] = value.split(' - ');
    const selectedMembershipType = this.membershipTypes.find(
      (membershipType) =>
        membershipType.branch === branch && membershipType.typeName === typeName
    );

    if (selectedMembershipType) {
      let days = selectedMembershipType.day;

      if (days === 30 || days === 31) {
        days = this.getDaysInCurrentMonth();
      }

      this.membershipAddForm.patchValue({
        day: days,
        price: selectedMembershipType.price,
      });
      this.calculateEndDate();
    }
  }

  getDaysInCurrentMonth(): number {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  calculateEndDate() {
    const startDate = this.membershipAddForm.get('startDate')?.value;
    const days = parseInt(this.membershipAddForm.get('day')?.value, 10);
    if (startDate && !isNaN(days)) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      this.membershipAddForm.patchValue({
        endDate: endDate.toISOString().split('T')[0],
      });
    }
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = value.toLowerCase();
    return this.members.filter(
      (member) =>
        member.name.toLowerCase().includes(filterValue) ||
        member.phoneNumber.toLowerCase().includes(filterValue)
    );
  }

  private _filterMembershipTypes(value: string): MembershipType[] {
    const filterValue = value.toLowerCase();
    return this.membershipTypes.filter((membershipType) =>
      (membershipType.branch + ' - ' + membershipType.typeName)
        .toLowerCase()
        .includes(filterValue)
    );
  }

  getMembershipTypes() {
    this.membershipTypeService.getMembershipTypes().subscribe((response) => {
      this.membershipTypes = response.data.filter(
        (membershipType) => membershipType.typeName
      );
    });
  }

  getMembers() {
    this.memberService.getMembers().subscribe((response) => {
      this.members = response.data;
    });
  }

  getLastMembershipInfo(memberId: number) {
    this.membershipService.getLastMembershipInfo(memberId).subscribe(
      (response) => {
        if (response.success) {
          const data = response.data;
          if (data.lastEndDate) {
            const lastEndDate = new Date(data.lastEndDate);
            if (data.isActive) {
              this.lastMembershipInfo = `Müşterinin üyeliğinin bitmesine ${
                data.daysRemaining + 1
              } gün var (${lastEndDate.toLocaleDateString()})`;
            } else {
              const daysSinceEnd = -data.daysRemaining;
              this.lastMembershipInfo = `Müşterinin son üyeliği ${daysSinceEnd} gün önce bitti (${lastEndDate.toLocaleDateString()})`;
            }
          } else {
            this.lastMembershipInfo =
              'Bu üyenin daha önce üyeliği bulunmamaktadır.';
          }
        } else {
          this.lastMembershipInfo = 'Üyelik bilgisi alınamadı.';
        }
      },
      (error) => {
        console.error('Error fetching last membership info', error);
        this.toastrService.error('Üyelik bilgileri alınamadı', 'Hata');
      }
    );
  }

  add() {
    this.calculateEndDate();

    const membershipModel = Object.assign({}, this.membershipAddForm.value);

    // Ödeme türü kontrolü
    if (!membershipModel.PaymentMethod) {
      this.toastrService.error('Formu tam doldurunuz.', 'Hata');
      return;
    }

    let price = membershipModel.price;
    let PaymentMethod = membershipModel.PaymentMethod;
    if (PaymentMethod === '') {
      PaymentMethod = null;
    }

    const selectedMember = membershipModel.memberID;
    if (selectedMember && typeof selectedMember !== 'string') {
      membershipModel.memberID = selectedMember.memberID;
    }

    const selectedMembershipTypeName = membershipModel.membershipTypeID;
    const selectedMembershipType = this.membershipTypes.find(
      (membershipType) =>
        membershipType.branch + ' - ' + membershipType.typeName ===
        selectedMembershipTypeName
    );
    if (selectedMembershipType) {
      membershipModel.membershipTypeID =
        selectedMembershipType.membershipTypeID;
    }

    membershipModel.price = price;
    membershipModel.PaymentMethod = PaymentMethod;

    // Form gönderimi başlat
    this.isSubmitting = true;

    this.membershipService.add(membershipModel).subscribe(
      (response) => {
        this.toastrService.success(response.message, 'Başarılı');
        this.isSubmitting = false; // Form gönderimi tamamlandı
        setTimeout(() => {
          this.resetForm();
        }, 2000);
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
        this.isSubmitting = false; // Form gönderimi tamamlandı
      }
    );
  }

  resetForm() {
    this.membershipAddForm.reset({
      memberID: '',
      membershipTypeID: '',
      startDate: '',
      endDate: '',
      paymentStatus: '',
      PaymentMethod: '',
      day: '',
      price: '',
    });
    this.lastMembershipInfo = '';
    this.showBranchList = false;
  }
}
