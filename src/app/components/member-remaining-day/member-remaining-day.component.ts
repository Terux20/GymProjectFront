import { Component, OnInit } from '@angular/core';
import { memberRemainingDay } from '../../models/memberRemainingDay';
import { MemberRemainingDayService } from '../../services/member-remaining-day.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-member-remaining-day',
    templateUrl: './member-remaining-day.component.html',
    styleUrls: ['./member-remaining-day.component.css'],
    standalone: false
})
export class MemberRemainingDayComponent implements OnInit {
  memberRemainingDays: memberRemainingDay[] = [];
  isLoading: boolean = false;

  constructor(
    private memberRemainingDayService: MemberRemainingDayService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getMemberRemainingDay();
  }

  getMemberRemainingDay() {
    this.isLoading = true;
    this.memberRemainingDayService.getMemberRemainingDays().subscribe(
      (response) => {
        console.log(response.data);
        this.memberRemainingDays = response.data;
        this.memberRemainingDays.sort((a, b) => a.remainingDays - b.remainingDays);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching remaining days:', error);
        this.toastrService.error('Üye bilgileri yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    );
  }
}
