import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { TransactionService } from '../../services/transaction.service';
import { ToastrService } from 'ngx-toastr';
import { Member } from '../../models/member';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { UpdateBalanceDialogComponent } from '../update-balance-dialog/update-balance-dialog.component';

@Component({
  selector: 'app-member-balance-topup',
  templateUrl: './member-balance-topup.component.html',
  styleUrls: ['./member-balance-topup.component.css']
})
export class MemberBalanceTopupComponent implements OnInit {
  topupForm: FormGroup;
  memberControl = new FormControl();
  members: Member[] = [];
  filteredMembers: Observable<Member[]>;
  membersWithBalance: Member[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private transactionService: TransactionService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.createTopupForm();
    this.getMembers();
    
    this.filteredMembers = this.memberControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterMembers(name) : this.members.slice())
    );
  }

  createTopupForm() {
    this.topupForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  getMembers() {
    this.isLoading = true;
    this.memberService.getMembers().subscribe(
      response => {
        this.members = response.data;
        this.updateMembersWithBalance();
        this.isLoading = false;
      },
      error => {
        this.toastrService.error('Üye bilgileri yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    );
  }

  updateMembersWithBalance() {
    this.membersWithBalance = this.members.filter(member => member.balance > 0 || member.balance < 0);
  }

  displayMember(member: Member): string {
    return member && member.name ? `${member.name} - ${member.phoneNumber}` : '';
  }

  private _filterMembers(name: string): Member[] {
    const filterValue = name.toLowerCase();
    return this.members.filter(member => 
      member.name.toLowerCase().includes(filterValue) || 
      member.phoneNumber.includes(filterValue)
    );
  }

  topup() {
    if (this.topupForm.valid && this.memberControl.value) {
      this.isLoading = true;
      const selectedMember = this.memberControl.value;
      const topupData = {
        memberID: selectedMember.memberID,
        amount: this.topupForm.get('amount')?.value,
        transactionType: 'Bakiye Yükleme'
      };

      this.transactionService.addTransaction(topupData).subscribe(
        response => {
          this.toastrService.success('Bakiye yükleme başarılı', 'Başarılı');
          this.topupForm.reset({amount: ''});
          this.memberControl.reset();
          this.getMembers();
          this.isLoading = false;
        },
        error => {
          this.toastrService.error('Bakiye yükleme başarısız', 'Hata');
          this.isLoading = false;
        }
      );
    }
  }

  openUpdateDialog(member: Member) {
    const dialogRef = this.dialog.open(UpdateBalanceDialogComponent, {
      width: '300px',
      data: { member: member }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getMembers();
      }
    });
  }
}