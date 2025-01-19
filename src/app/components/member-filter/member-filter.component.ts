import { Component, OnInit, OnDestroy } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { MembershipType } from '../../models/membershipType';
import { MembershipTypeService } from '../../services/membership-type.service';
import { MatDialog } from '@angular/material/dialog';
import { MembershipUpdateComponent } from '../crud/membership-update/membership-update.component';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MembershipService } from '../../services/membership.service';
import { ToastrService } from 'ngx-toastr';
import { MemberFilter } from '../../models/memberFilter';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-member-filter',
    templateUrl: './member-filter.component.html',
    styleUrls: ['./member-filter.component.css'],
    standalone: false
})
export class MemberFilterComponent implements OnInit, OnDestroy {
  members: MemberFilter[] = [];
  activeMembersCount: number = 0;
  memberFilterText: string = '';
  private searchTextSubject = new Subject<string>();
  genderFilter: string = '';
  branchFilter: string = '';
  membershipTypes: MembershipType[] = [];
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  isLoading: boolean = false;
  currentPage = 1;
  totalPages = 0;
  totalItems = 0;
  totalActiveMembers: number = 0;

  genderCounts = {
    all: 0,
    male: 0,
    female: 0
  };
  branchCounts: { [key: string]: number } = {};

  constructor(
    private memberService: MemberService,
    private membershipTypeService: MembershipTypeService,
    private membershipService: MembershipService,
    private dialog: MatDialog,
    private toastrService: ToastrService
  ) {
    this.searchTextSubject.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.memberFilterText = searchText;
      this.currentPage = 1;
      this.loadMembers();
    });
  }

  ngOnInit(): void {
    this.getBranches();
    this.loadMembers();
    this.getTotalActiveMembers();
  }

  ngOnDestroy(): void {
    this.searchTextSubject.complete();
  }

  searchTextChanged(text: string) {
    this.searchTextSubject.next(text);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadMembers();
    this.getTotalActiveMembers();
  }

  getTotalActiveMembers() {
    this.memberService.getTotalActiveMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.totalActiveMembers = response.data;
          this.activeMembersCount = response.data;

        
        }
      },
      error: (error) => {
        console.error('Error fetching total members:', error);
      },
    });
  }

  loadMembers() {
    this.isLoading = true;
    const gender = this.genderFilter ? parseInt(this.genderFilter) : undefined;

    this.memberService
      .getMemberDetailsPaginated(
        this.currentPage,
        this.memberFilterText,
        gender,
        this.branchFilter
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.members = response.data.data;
            this.totalPages = response.data.totalPages;
            this.totalItems = response.data.totalCount;
            this.calculateActiveMembersCount();
            this.calculateFilterCounts();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching members:', error);
          this.toastrService.error(
            'Üyeler yüklenirken bir hata oluştu.',
            'Hata'
          );
          this.isLoading = false;
        },
      });
  }

  calculateFilterCounts() {
    this.genderCounts.all = this.totalItems;
  
    this.memberService.getActiveMemberCounts().subscribe({
      next: (response) => {
        if (response.success) {
          this.genderCounts.male = response.data['male'];
          this.genderCounts.female = response.data['female'];
        }
      },
      error: (error) => {
        console.error('Error fetching gender counts:', error);
      }
    });
  
    this.memberService.getBranchCounts().subscribe({
      next: (response) => {
        if (response.success) {
          this.branchCounts = response.data;
        }
      },
      error: (error) => {
        console.error('Error fetching branch counts:', error);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadMembers();
    }
  }

  getBranches() {
    this.membershipTypeService.getMembershipTypes().subscribe((response) => {
      this.membershipTypes = this.getUniqueBranches(response.data);
    });
  }

  getUniqueBranches(membershipTypes: MembershipType[]): MembershipType[] {
    const uniqueBranches: MembershipType[] = [];
    const branchMap = new Map<string, boolean>();

    membershipTypes.forEach((type) => {
      if (!branchMap.has(type.branch)) {
        branchMap.set(type.branch, true);
        uniqueBranches.push(type);
      }
    });

    return uniqueBranches;
  }

  calculateActiveMembersCount() {
    this.activeMembersCount = this.members.filter((member) => {
      return member.remainingDays >= 0;
    }).length;
  }

  openUpdateDialog(member: MemberFilter): void {
    const dialogRef = this.dialog.open(MembershipUpdateComponent, {
      width: '400px',
      data: {
        membershipID: member.membershipID,
        memberID: member.memberID,
        membershipTypeID: member.membershipTypeID,
        startDate: member.startDate,
        endDate: member.endDate,
        name: member.name,
        branch: member.branch,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMembers();
      }
    });
  }

  deleteMember(member: MemberFilter) {
    if (
      confirm(
        `${member.name} adlı üyenin üyeliğini silmek istediğinizden emin misiniz?`
      )
    ) {
      this.isLoading = true;
      this.membershipService.delete(member.membershipID).subscribe(
        (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastrService.success(response.message, 'Başarılı');
            this.loadMembers();
          } else {
            this.toastrService.error(response.message, 'Hata');
          }
        },
        (error) => {
          this.isLoading = false;
          this.toastrService.error('Üye silinirken bir hata oluştu.', 'Hata');
        }
      );
    }
  }
}