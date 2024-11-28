import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MembershipTypeService } from '../../../services/membership-type.service'; 
import { MembershipType } from '../../../models/membershipType'; 
import { ResponseModel } from '../../../models/responseModel';

@Component({
  selector: 'app-membershiptype-update',
  templateUrl: './membershiptype-update.component.html',
  styleUrls: ['./membershiptype-update.component.css']
})
export class MembershiptypeUpdateComponent {
  updateForm: FormGroup;
  @ViewChild('updateButton') updateButton: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MembershiptypeUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MembershipType,
    private fb: FormBuilder,
    private membershipTypeService: MembershipTypeService,
    private toastrService: ToastrService
  ) {
    this.updateForm = this.fb.group({
      branch: [data.branch, Validators.required],
      typeName: [data.typeName, Validators.required],
      year: [Math.floor(data.day / 365), Validators.required],
      month: [Math.floor((data.day % 365) / 30), Validators.required],
      day: [data.day % 30, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]]
    });
  }

  ngAfterViewInit() {
    this.updateForm.valueChanges.subscribe(() => {
      if (this.updateForm.valid) {
        this.updateButton.nativeElement.focus();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateMembershipType(): void {
    if (this.updateForm.valid) {
      const updatedType = { ...this.data, ...this.updateForm.value };
      
      const totalDays =
        parseInt(updatedType.year) * 365 +
        parseInt(updatedType.month) * 30 +
        parseInt(updatedType.day);

      updatedType.day = totalDays.toString();

      delete updatedType.year;
      delete updatedType.month;

      this.membershipTypeService.update(updatedType).subscribe(
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
    }
  }
}