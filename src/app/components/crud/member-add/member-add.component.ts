// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MemberService } from '../../../services/member.service';
// import { ToastrService } from 'ngx-toastr';

// @Component({
//   selector: 'app-member-add',
//   templateUrl: './member-add.component.html',
//   styleUrls: ['./member-add.component.css'],
// })
// export class MemberAddComponent implements OnInit {
//   memberAddForm: FormGroup;
//   isProcessCompleted: boolean = false;
//   isSubmitting: boolean = false; // Form gönderimi sırasında kullanılacak değişken

//   constructor(
//     private formBuilder: FormBuilder,
//     private memberService: MemberService,
//     private toastrService: ToastrService
//   ) {}

//   ngOnInit(): void {
//     this.createMemberAddForm();
//   }

//   createMemberAddForm() {
//     this.memberAddForm = this.formBuilder.group({
//       name: ['', Validators.required],
//       adress: [''],
//       gender: ['', Validators.required],
//       phoneNumber: ['', Validators.required],
//       email: [''],
//       birthDate: [''],
//     });
//   }

//   add() {
//     if (this.memberAddForm.invalid) {  // Form geçerli değilse
//       this.toastrService.error('Gerekli alanları doldurunuz', 'Dikkat');
//       this.isSubmitting = false; // Butonu tekrar etkinleştir
//       return;
//     }

//     this.isSubmitting = true; // İstek başlamadan önce butonu devre dışı bırakıyoruz
//     let memberModel = Object.assign({}, this.memberAddForm.value);

//     // Ad Soyad'ı büyük harfe çevir
//     if (memberModel.name) {
//       memberModel.name = memberModel.name.toUpperCase();
//     }

//     if (memberModel.birthDate === '') {
//       memberModel.birthDate = null;
//     }
//     if (memberModel.adress === '') {
//       memberModel.adress = null;
//     }
//     if (memberModel.email === '') {
//       memberModel.email = null;
//     }

//     this.memberService.add(memberModel).subscribe(
//       (response) => {
//         this.toastrService.success(response.message, 'Başarılı');
//         this.isProcessCompleted = true;
//         this.isSubmitting = false; // İstek tamamlandığında butonu tekrar etkinleştiriyoruz

//       },
//       (responseError) => {
//         console.log(responseError);
//         if (responseError.error && responseError.error.Errors) {
//           for (let i = 0; i < responseError.error.Errors.length; i++) {
//             this.toastrService.error(
//               responseError.error.Errors[i].ErrorMessage,
//               'Hata'
//             );
//           }
//         } else {
//           this.toastrService.error('Beklenmedik bir hata oluştu', 'Hata');
//         }
//         this.isSubmitting = false; // Hata durumunda da butonu tekrar etkinleştiriyoruz
//       }
//     );
//   }
// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from '../../../services/member.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-add',
  templateUrl: './member-add.component.html',
  styleUrls: ['./member-add.component.css'],
})
export class MemberAddComponent implements OnInit {
  memberAddForm: FormGroup;
  isProcessCompleted: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createMemberAddForm();
  }

  createMemberAddForm() {
    this.memberAddForm = this.formBuilder.group({
      name: ['', Validators.required],
      adress: [''],
      gender: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: [''],
      birthDate: [''],
    });
  }

  add() {
    if (this.memberAddForm.invalid) {
      this.toastrService.error('Gerekli alanları doldurunuz', 'Dikkat');
      this.isSubmitting = false;
      return;
    }

    this.isSubmitting = true;
    let memberModel = Object.assign({}, this.memberAddForm.value);

    if (memberModel.name) {
      memberModel.name = memberModel.name.toUpperCase();
    }

    if (memberModel.birthDate === '') {
      memberModel.birthDate = null;
    }
    if (memberModel.adress === '') {
      memberModel.adress = null;
    }
    if (memberModel.email === '') {
      memberModel.email = null;
    }

    this.memberService.add(memberModel).subscribe(
      (response) => {
        this.toastrService.success(response.message, 'Başarılı');
        this.isProcessCompleted = true;
        this.isSubmitting = false;
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      },
      (responseError) => {
        console.log(responseError);
        if (responseError.error && responseError.error.Errors) {
          for (let i = 0; i < responseError.error.Errors.length; i++) {
            this.toastrService.error(
              responseError.error.Errors[i].ErrorMessage,
              'Hata'
            );
          }
        } else {
          this.toastrService.error('Beklenmedik bir hata oluştu', 'Hata');
        }
        this.isSubmitting = false;
      }
    );
  }

  resetForm() {
    this.memberAddForm.reset({
      name: '',
      adress: '',
      gender: '',
      phoneNumber: '',
      email: '',
      birthDate: '',
    });
  }
}
