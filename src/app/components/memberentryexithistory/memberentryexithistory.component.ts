import { Component, OnInit } from '@angular/core';
import { MemberEntryExitHistoryService } from '../../services/member-entry-exit-history.service';
import { memberEntryExitHistory } from '../../models/memberEntryExitHistory';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-memberentryexithistory',
  templateUrl: './memberentryexithistory.component.html',
  styleUrl: './memberentryexithistory.component.css'
})
export class MemberentryexithistoryComponent implements OnInit {
  memberEntryExitHistories: memberEntryExitHistory[] = [];
  isLoading: boolean = false;

  constructor(
    private memberEntryExitHistoryService: MemberEntryExitHistoryService,
    private toastrService: ToastrService
  ){}

  ngOnInit(): void {
    this.getMemberEntryExitHistories();
  }

  getMemberEntryExitHistories() {
    this.isLoading = true;
    this.memberEntryExitHistoryService.getMemberEntryExitHistories().subscribe(
      (response) => {
        this.memberEntryExitHistories = response.data.filter(history => history.isActive==true);
        this.calculateTimeDifferences();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching member entry exit histories:', error);
        this.toastrService.error('Üye giriş çıkış geçmişi yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    );
  }

  calculateTimeDifferences() {
    const now = new Date();
    this.memberEntryExitHistories.forEach(history => {
      const entryDate = new Date(history.entryDate);
      const diffInMs = now.getTime() - entryDate.getTime();
      history.timeDifferenceInMinutes = Math.floor(diffInMs / (1000 * 60));
    });
  }
}