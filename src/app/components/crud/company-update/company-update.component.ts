import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Company } from '../../../models/company';

@Component({
    selector: 'app-company-update',
    template: `
    <h2 mat-dialog-title>Şirket Güncelle</h2>
    <mat-dialog-content>
      <form [formGroup]="updateForm">
        <mat-form-field>
          <input matInput placeholder="Şirket Adı" formControlName="companyName">
        </mat-form-field>
        <mat-form-field>
          <input matInput placeholder="Telefon Numarası" formControlName="phoneNumber">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onNoClick()">İptal</button>
      <button mat-button [disabled]="!updateForm.valid" (click)="onSubmit()">Güncelle</button>
    </mat-dialog-actions>
  `,
    standalone: false
})
export class CompanyUpdateComponent {
  updateForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CompanyUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Company
  ) {
    this.updateForm = this.formBuilder.group({
      companyID: [data.companyID],
      companyName: [data.companyName, Validators.required],
      phoneNumber: [data.phoneNumber, Validators.required],
      isActive: [data.isActive],

    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      this.dialogRef.close(this.updateForm.value);
    }
  }
}