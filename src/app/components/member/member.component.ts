import { Component, OnInit, OnDestroy } from '@angular/core';
import { Member } from '../../models/member'; 
import { MemberService } from '../../services/member.service'; 
import { ToastrService } from 'ngx-toastr';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { MemberUpdateComponent } from '../crud/member-update/member-update.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  searchText = '';
  isLoading = false;
  
  faTrashAlt = faTrashAlt;
  faEdit = faEdit;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private memberService: MemberService,
    private toastrService: ToastrService,
    public dialog: MatDialog
  ) {
    this.searchSubject.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(searchValue => {
      this.searchText = searchValue;
      this.currentPage = 1;
      this.loadMembers();
    });
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMembers() {
    this.isLoading = true;
    this.memberService.getAllPaginated(this.currentPage, this.searchText).subscribe({
      next: (response) => {
        if (response.success) {
          this.members = response.data.data;
          this.totalPages = response.data.totalPages;
          this.totalItems = response.data.totalCount;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching members:', error);
        this.toastrService.error('Üyeler yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadMembers();
    }
  }

  onSearch(event: any): void {
    const searchValue = event.target.value;
    this.searchSubject.next(searchValue);
  }

  onDelete(member: Member): void {
    if (confirm(`${member.name} adlı üyeyi silmek istediğinizden emin misiniz?`)) {
      this.memberService.delete(member.memberID).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastrService.success('Üye başarıyla silindi');
            this.loadMembers();
          }
        },
        error: (error) => {
          this.toastrService.error('Üye silinirken bir hata oluştu');
        }
      });
    }
  }

  openUpdateDialog(member: Member): void {
    const dialogRef = this.dialog.open(MemberUpdateComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: member
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers(); 
      }
    });
  }
}