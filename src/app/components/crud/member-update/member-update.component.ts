import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../../../services/member.service';

@Component({
  selector: 'app-member-update',
  templateUrl: './member-update.component.html',
  styleUrls: ['./member-update.component.css']
})
export class MemberUpdateComponent {
  updateForm: FormGroup;
  @ViewChild('updateButton') updateButton: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MemberUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private memberService: MemberService,
    private toastrService: ToastrService
  ) {
    this.updateForm = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(3)]],
      phoneNumber: [data.phoneNumber, [Validators.required, ]],
      gender: [this.genderTransform(data.gender), Validators.required],
      adress: [data.adress, [Validators.maxLength(200)]],
      birthDate: [data.birthDate],
      email: [data.email, [Validators.email]]
    });
  }

  ngAfterViewInit() {
    this.updateForm.valueChanges.subscribe(() => {
      if (this.updateForm.valid) {
        this.updateButton.nativeElement.focus();
      }
    });
  }

  genderTransform(value: string | number): number {
    return value === 'Erkek' ? 1 : value === 'Kadın' ? 2 : value as number;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateMember(): void {
    if (this.updateForm.valid) {
      const formValue = this.updateForm.value;
      const updatedMember = {
        ...this.data,
        ...formValue,
        gender: this.genderTransform(formValue.gender),
        birthDate: formValue.birthDate !== this.data.birthDate
          ? this.formatDateWithTimezone(formValue.birthDate)
          : this.data.birthDate
      };
  
      this.memberService.update(updatedMember).subscribe(
        (response: any) => {
          if (response.success) {
            console.log(response.message);
            this.toastrService.success(response.message, 'Başarılı');
            this.dialogRef.close(true);
          } else {
            this.toastrService.error(response.message || 'Güncelleme sırasında bir hata oluştu.', 'Hata');
          }
        },
        (responseError: any) => {
          console.log(responseError);
          if (responseError.error.Errors && responseError.error.Errors.length > 0) {
            for (const error of responseError.error.Errors) {
              this.toastrService.error(error.ErrorMessage, 'Hata');
            }
          } else {
            this.toastrService.error('Güncelleme sırasında bir hata oluştu.', 'Hata');
          }
        }
      );
    }
  }

  private formatDateWithTimezone(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
  }
}