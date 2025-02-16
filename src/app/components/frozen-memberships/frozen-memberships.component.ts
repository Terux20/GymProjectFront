import { Component, OnInit } from '@angular/core';
import { MembershipService } from '../../services/membership.service';
import { MembershipFreezeHistoryService } from '../../services/membership-freeze-history.service';
import { ToastrService } from 'ngx-toastr';
import { MembershipFreezeHistory } from '../../models/membershipFreezeHistory';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-frozen-memberships',
  templateUrl: './frozen-memberships.component.html',
  styleUrls: ['./frozen-memberships.component.css'],
  standalone: false,
})
export class FrozenMembershipsComponent implements OnInit {
  frozenMemberships: any[] = [];
  freezeHistories: MembershipFreezeHistory[] = [];
  isProcessing: boolean = false;
  isLoading: boolean = false;
  selectedMembershipId: number | null = null;
  showHistoryModal: boolean = false;
  showFrozenMemberships: boolean = true;
  searchText: string = '';
  filteredHistories: MembershipFreezeHistory[] = [];

  constructor(
    private membershipService: MembershipService,
    private freezeHistoryService: MembershipFreezeHistoryService,
    private toastr: ToastrService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadFrozenMemberships();
  }

  toggleView() {
    this.showFrozenMemberships = !this.showFrozenMemberships;
    if (!this.showFrozenMemberships && this.freezeHistories.length === 0) {
      this.loadFreezeHistories();
    }
  }

  loadFrozenMemberships(): void {
    this.isLoading = true;
    this.membershipService.getFrozenMemberships().subscribe({
      next: (response) => {
        if (response.success) {
          this.frozenMemberships = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Dondurulmuş üyelikler yüklenirken bir hata oluştu.');
        this.isLoading = false;
      },
    });
  }

  loadFreezeHistories(): void {
    this.isLoading = true;
    this.freezeHistoryService.getFreezeHistories().subscribe({
      next: (response) => {
        if (response.success) {
          this.freezeHistories = response.data;
          this.filteredHistories = this.freezeHistories;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Dondurma geçmişi yüklenirken bir hata oluştu.');
        this.isLoading = false;
      },
    });
  }

  filterHistories(searchText: string): void {
    if (!searchText.trim()) {
      this.filteredHistories = this.freezeHistories;
    } else {
      const searchLower = searchText.toLowerCase().trim();
      this.filteredHistories = this.freezeHistories.filter((history) =>
        history.memberName.toLowerCase().includes(searchLower)
      );
    }
  }

  onSearchChange(event: any): void {
    this.searchText = event.target.value;
    this.filterHistories(this.searchText);
  }

  getRemainingDays(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }

  cancelFreeze(membership: any): void {
    this.dialogService
      .confirmFreezeCancel(membership.memberName, 0)
      .subscribe((result) => {
        if (result) {
          this.isProcessing = true;
          this.membershipService
            .cancelFreeze(membership.membershipID)
            .subscribe({
              next: (response) => {
                if (response.success) {
                  this.toastr.success(
                    'Üyelik dondurma işlemi tamamen iptal edildi.'
                  );
                  this.loadFrozenMemberships();
                  if (!this.showFrozenMemberships) {
                    this.loadFreezeHistories();
                  }
                } else {
                  this.toastr.error(response.message);
                }
                this.isProcessing = false;
              },
              error: (error) => {
                this.toastr.error('İşlem sırasında bir hata oluştu.');
                this.isProcessing = false;
              },
            });
        }
      });
  }

  reactivateFromToday(membership: any): void {
    const usedDays = Math.floor(
      (new Date().getTime() - new Date(membership.freezeStartDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    this.dialogService
      .confirmReactivateFromToday(membership.memberName, usedDays)
      .subscribe((result) => {
        if (result) {
          this.isProcessing = true;
          this.membershipService
            .reactivateFromToday(membership.membershipID)
            .subscribe({
              next: (response) => {
                if (response.success) {
                  this.toastr.success('Üyelik bugünden itibaren aktif edildi.');
                  this.loadFrozenMemberships();
                  if (!this.showFrozenMemberships) {
                    this.loadFreezeHistories();
                  }
                } else {
                  this.toastr.error(response.message);
                }
                this.isProcessing = false;
              },
              error: (error) => {
                this.toastr.error('İşlem sırasında bir hata oluştu.');
                this.isProcessing = false;
              },
            });
        }
      });
  }
  showHistory(membershipId: number): void {
    this.selectedMembershipId = membershipId;
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedMembershipId = null;
  }

  getFilteredHistory(): MembershipFreezeHistory[] {
    if (!this.selectedMembershipId) return [];
    return this.freezeHistories
      .filter(
        (h) =>
          h.memberName ===
          this.frozenMemberships.find(
            (m) => m.membershipID === this.selectedMembershipId
          )?.memberName
      )
      .sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('tr-TR');
  }

  calculateUsedDays(history: MembershipFreezeHistory): number {
    if (!history.actualEndDate) return 0;
    const start = new Date(history.startDate);
    const end = new Date(history.actualEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
