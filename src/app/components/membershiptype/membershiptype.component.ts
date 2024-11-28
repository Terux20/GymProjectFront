
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MembershipType } from '../../models/membershipType';
import { MembershipTypeService } from '../../services/membership-type.service';
import { ResponseModel } from '../../models/responseModel';
import { ToastrService } from 'ngx-toastr';
import { MembershiptypeUpdateComponent } from '../crud/membershiptype-update/membershiptype-update.component';
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-membershiptype',
  templateUrl: './membershiptype.component.html',
  styleUrls: ['./membershiptype.component.css']
})
export class MembershiptypeComponent implements OnInit {
  membershipTypes: MembershipType[] = [];
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  constructor(
    private membershipTypeService: MembershipTypeService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getMembershipTypes();
  }

  getMembershipTypes() {
    this.membershipTypeService.getMembershipTypes().subscribe((response) => {
      this.membershipTypes = response.data;
    });
  }

  openUpdateDialog(membershipType: MembershipType) {
    const dialogRef = this.dialog.open(MembershiptypeUpdateComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: membershipType
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getMembershipTypes();
      }
    });
  }

  deleteMembershipType(membershipType: MembershipType) {
    this.membershipTypeService.delete(membershipType.membershipTypeID).subscribe(
      (response: ResponseModel) => {
        if (response.success) {
          this.membershipTypes = this.membershipTypes.filter(
            (m) => m.membershipTypeID !== membershipType.membershipTypeID
          );
          this.toastrService.success(response.message, 'Başarılı');
        } else {
          this.toastrService.error(response.message, 'Hata');
        }
      },
      (error) => {
        this.toastrService.error('Üyelik Paketi Bir Üyeye Bağlı, Silinemez.', 'Hata');
      }
    );
  }

  getDayDisplay(day: number): string {
    return (day === 30 || day === 31) ? '1 Ay' : `${day} Gün`;
  }
}
