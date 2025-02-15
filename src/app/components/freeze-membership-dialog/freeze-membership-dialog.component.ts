import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-freeze-membership-dialog',
  template: `
    <h2 mat-dialog-title>Üyelik Dondurma</h2>
    <form [formGroup]="freezeForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <p>{{ data.memberName }} isimli üyenin üyeliğini dondurmak üzeresiniz.</p>
        <mat-form-field>
          <mat-label>Dondurma Süresi (Gün)</mat-label>
          <input matInput type="number" formControlName="freezeDays" min="1" max="365">
          <mat-error *ngIf="freezeForm.get('freezeDays')?.hasError('required')">
            Dondurma süresi gereklidir
          </mat-error>
          <mat-error *ngIf="freezeForm.get('freezeDays')?.hasError('min')">
            En az 1 gün olmalıdır
          </mat-error>
          <mat-error *ngIf="freezeForm.get('freezeDays')?.hasError('max')">
            En fazla 365 gün olabilir
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button type="button" (click)="onNoClick()">İptal</button>
        <button mat-button color="primary" type="submit" [disabled]="!freezeForm.valid">
          Dondur
        </button>
      </mat-dialog-actions>
    </form>
  `,  
  standalone:false

})
export class FreezeMembershipDialogComponent {
  freezeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<FreezeMembershipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.freezeForm = this.fb.group({
      freezeDays: ['', [Validators.required, Validators.min(1), Validators.max(365)]]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.freezeForm.valid) {
      this.dialogRef.close(this.freezeForm.value.freezeDays);
    }
  }
}
