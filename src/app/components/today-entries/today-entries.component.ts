import { Component, OnInit } from '@angular/core';
import { MemberEntryService } from '../../services/member-entry.service';
import { MemberEntry } from '../../models/memberEntry';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-today-entries',
  templateUrl: './today-entries.component.html',
  styleUrls: ['./today-entries.component.css']
})
export class TodayEntriesComponent implements OnInit {
  entries: MemberEntry[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;

  constructor(
    private memberEntryService: MemberEntryService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getTodayEntries();
  }

  getTodayEntries() {
    this.isLoading = true;
    this.memberEntryService.getTodayEntries(this.selectedDate).subscribe(
      response => {
        this.entries = response.data;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching today entries:', error);
        this.toastrService.error('Bugünkü girişler yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    );
  }

  onDateChange() {
    this.getTodayEntries();
  }
}