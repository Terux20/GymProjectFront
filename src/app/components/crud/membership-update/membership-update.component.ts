import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MembershipService } from '../../../services/membership.service';
import { ToastrService } from 'ngx-toastr';
import { ResponseModel } from '../../../models/responseModel';

@Component({
    selector: 'app-membership-update',
    templateUrl: './membership-update.component.html',
    styleUrls: ['./membership-update.component.css'],
    standalone: false
})
export class MembershipUpdateComponent implements OnInit {
  updateForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MembershipUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private toastrService: ToastrService
  ) {
    this.updateForm = this.fb.group({
      membershipID: [this.data.membershipID, Validators.required],
      memberID: [this.data.memberID, Validators.required],
      membershipTypeID: [this.data.membershipTypeID, Validators.required],
      memberName: [this.data.name, Validators.required],
      branch: [this.data.branch, Validators.required],
      startDate: [new Date(this.data.startDate), Validators.required],
      endDate: [new Date(this.data.endDate), Validators.required]
    }, { validators: this.dateValidator });
  }

  ngOnInit() {
    this.updateForm.get('memberName')?.disable();
    this.updateForm.get('branch')?.disable();
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { 'dateInvalid': true };
    }

    return null;
  }

  setToday(controlName: 'startDate' | 'endDate'): void {
    const today = new Date();
    this.updateForm.get(controlName)?.setValue(today);
    this.updateForm.get(controlName)?.updateValueAndValidity();
    this.updateForm.updateValueAndValidity();
  }

  onDateChange(event: any, controlName: 'startDate' | 'endDate'): void {
    this.updateForm.get(controlName)?.setValue(event.value);
    this.updateForm.get(controlName)?.updateValueAndValidity();
    this.updateForm.updateValueAndValidity();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateMembership(): void {
    if (this.updateForm.valid) {
      const updatedMembership = {
        membershipID: this.updateForm.get('membershipID')?.value,
        memberID: this.updateForm.get('memberID')?.value,
        membershipTypeID: this.updateForm.get('membershipTypeID')?.value,
        startDate: this.updateForm.get('startDate')?.value,
        endDate: this.updateForm.get('endDate')?.value
      };

      this.membershipService.update(updatedMembership).subscribe(
        (response: ResponseModel) => {
          if (response.success) {
            this.toastrService.success(response.message, 'Başarılı');
            this.dialogRef.close(true);
          } else {
            this.toastrService.error(response.message, 'Hata');
          }
        },
        (error) => {
          this.toastrService.error('Güncelleme sırasında bir hata oluştu.', 'Hata');
        }
      );
    } else {
      if (this.updateForm.errors?.['dateInvalid']) {
        this.toastrService.error('Başlangıç tarihi, bitiş tarihinden sonra olamaz.', 'Hata');
      }
    }
  }
}