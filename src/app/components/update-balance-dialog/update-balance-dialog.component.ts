import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-update-balance-dialog',
    template: `
    <h2 mat-dialog-title>Bakiye Güncelle</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field>
          <input matInput type="number" placeholder="Yeni Bakiye" formControlName="newBalance">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onNoClick()">İptal</button>
      <button mat-button [disabled]="!form.valid" (click)="onSubmit()">Güncelle</button>
    </mat-dialog-actions>
  `,
    standalone: false
})
export class UpdateBalanceDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateBalanceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member: any },
    private fb: FormBuilder,
    private memberService: MemberService,
    private toastrService: ToastrService
  ) {
    this.form = this.fb.group({
      newBalance: [data.member.balance, [Validators.required]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const updatedMember = {
        ...this.data.member,
        balance: this.form.get('newBalance')?.value
      };

      this.memberService.update(updatedMember).subscribe(
        response => {
          this.toastrService.success('Bakiye güncellendi', 'Başarılı');
          this.dialogRef.close(true);
        },
        error => {
          this.toastrService.error('Bakiye güncellenemedi', 'Hata');
        }
      );
    }
  }
}