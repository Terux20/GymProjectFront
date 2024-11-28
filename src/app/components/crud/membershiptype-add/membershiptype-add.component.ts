import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MembershipTypeService } from '../../../services/membership-type.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-membershiptype-add',
  templateUrl: './membershiptype-add.component.html',
  styleUrls: ['./membershiptype-add.component.css'],
})
export class MembershiptypeAddComponent implements OnInit {
  membershipTypeAddForm: FormGroup;
  isSubmitting = false; // Yeni eklenen özellik

  constructor(
    private formBuilder: FormBuilder,
    private membershipTypeService: MembershipTypeService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createMembershipTypeAddForm();
  }

  createMembershipTypeAddForm() {
    this.membershipTypeAddForm = this.formBuilder.group({
      branch: ['', Validators.required],
      typeName: ['', Validators.required],
      year: ['0', Validators.required],
      month: ['0', Validators.required],
      day: ['0', Validators.required],
      price: ['', Validators.required],
    });
  }

  add() {
    if (this.membershipTypeAddForm.valid) {
      this.isSubmitting = true; // Form gönderimi başladığında
      let membershipTypeModel = Object.assign(
        {},
        this.membershipTypeAddForm.value
      );

      const totalDays =
        parseInt(membershipTypeModel.year) * 365 +
        parseInt(membershipTypeModel.month) * 30 +
        parseInt(membershipTypeModel.day);

      membershipTypeModel.day = totalDays.toString();

      delete membershipTypeModel.year;
      delete membershipTypeModel.month;

      this.membershipTypeService.add(membershipTypeModel).subscribe(
        (response) => {
          this.toastrService.success(response.message, 'Başarılı');
          this.isSubmitting = false; // Form gönderimi tamamlandığında
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        (responseError) => {
          this.isSubmitting = false; // Hata durumunda
          if (
            responseError.error.Errors &&
            responseError.error.Errors.length > 0
          ) {
            for (let i = 0; i < responseError.error.Errors.length; i++) {
              this.toastrService.error(
                responseError.error.Errors[i].ErrorMessage,
                'Hata'
              );
            }
          } else {
            this.toastrService.error('Bir hata oluştu', 'Hata');
          }
        }
      );
    } else {
      this.toastrService.error('Formu eksiksiz doldurunuz', 'Hata');
    }
  }
}