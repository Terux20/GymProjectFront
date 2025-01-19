import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Member } from '../../models/member';
import { MemberService } from '../../services/member.service';
import { MemberEntryService } from '../../services/member-entry.service';
import { ToastrService } from 'ngx-toastr';
import { MemberEntry } from '../../models/memberEntry';

@Component({
    selector: 'app-today-entries',
    templateUrl: './today-entries.component.html',
    styleUrls: ['./today-entries.component.css'],
    standalone: false
})
export class TodayEntriesComponent implements OnInit {
  entries: MemberEntry[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  memberControl = new FormControl();
  members: Member[] = [];
  filteredMembers: Observable<Member[]>;
  selectedMember: Member | null = null;
  memberStats = {
    monthlyVisits: 0,
    averageStayTime: 0,
    lastVisit: null as Date | null
  };

  constructor(
    private memberService: MemberService,
    private memberEntryService: MemberEntryService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getMembers();
    this.getTodayEntries();

    this.filteredMembers = this.memberControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterMembers(name) : this.members.slice();
      }),
    );

    // Seçili üye değiştiğinde istatistikleri güncelle
    this.memberControl.valueChanges.subscribe(member => {
      if (member && typeof member !== 'string') {
        this.selectedMember = member;
        this.calculateMemberStats(member);
      }
    });
  }

  getTotalVisitorsToday(): number {
    const uniqueVisitors = new Set(this.entries.map(entry => entry.phoneNumber));
    return uniqueVisitors.size;
  }
  calculateMemberStats(member: Member) {
    const memberEntries = this.entries.filter(entry => 
      entry.name === member.name && entry.phoneNumber === member.phoneNumber
    );

    // Aylık toplam ziyaret
    this.memberStats.monthlyVisits = memberEntries.length;

    // Ortalama kalış süresi hesaplama
    let totalMinutes = 0;
    let validEntries = 0;
    memberEntries.forEach(entry => {
      if (entry.exitTime && entry.entryTime) {
        const duration = this.calculateDurationInMinutes(entry.entryTime, entry.exitTime);
        if (duration <= 300) { // 5 saatten kısa olan girişleri say
          totalMinutes += duration;
          validEntries++;
        }
      }
    });
    this.memberStats.averageStayTime = validEntries > 0 ? Math.round(totalMinutes / validEntries) : 0;

    // Son ziyaret tarihi
    if (memberEntries.length > 0) {
      this.memberStats.lastVisit = new Date(memberEntries[0].entryTime);
    }
  }

  calculateDurationInMinutes(entryTime: Date, exitTime: Date): number {
    return Math.floor((new Date(exitTime).getTime() - new Date(entryTime).getTime()) / (1000 * 60));
  }

  getMembers() {
    this.memberService.getMembers().subscribe({
      next: (response) => {
        this.members = response.data;
      },
      error: (error) => {
        console.error('Error fetching members:', error);
        this.toastrService.error('Üyeler yüklenirken bir hata oluştu.', 'Hata');
      }
    });
  }

  calculateDuration(entryTime: Date, exitTime: Date | null): string {
    if (!exitTime) {
      return '-';
    }

    const duration = this.calculateDurationInMinutes(entryTime, exitTime);
    if (duration >= 301) {
      return '-';
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours} saat ${minutes} dakika` : `${minutes} dakika`;
  }

  displayMember(member: Member): string {
    return member ? `${member.name} - ${member.phoneNumber}` : '';
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = value.toLowerCase();
    return this.members.filter(member => 
      member.name.toLowerCase().includes(filterValue) ||
      member.phoneNumber.includes(filterValue)
    );
  }

  onDateChange() {
    if (!this.memberControl.value) {
      this.getTodayEntries();
    }
  }

  searchMember() {
    const selectedMember = this.memberControl.value;
    if (selectedMember && (selectedMember.name || selectedMember.phoneNumber)) {
      this.isLoading = true;
      const searchText = selectedMember.phoneNumber || selectedMember.name;
      this.memberEntryService.getMemberEntriesBySearch(searchText).subscribe({
        next: (response) => {
          this.entries = response.data;
          this.calculateMemberStats(selectedMember);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching member entries:', error);
          this.toastrService.error('Üye girişleri yüklenirken bir hata oluştu.', 'Hata');
          this.isLoading = false;
        }
      });
    } else {
      this.getTodayEntries();
    }
  }

  getTodayEntries() {
    this.isLoading = true;
    this.memberEntryService.getTodayEntries(this.selectedDate).subscribe({
      next: (response) => {
        this.entries = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching today entries:', error);
        this.toastrService.error('Bugünkü girişler yüklenirken bir hata oluştu.', 'Hata');
        this.isLoading = false;
      }
    });
  }

  clearSearch() {
    this.memberControl.reset();
    this.selectedMember = null;
    this.memberStats = {
      monthlyVisits: 0,
      averageStayTime: 0,
      lastVisit: null
    };
    this.getTodayEntries();
  }

  isActiveEntry(entry: MemberEntry): boolean {
    return !entry.exitTime;
  }

  shouldShowQRWarning(entry: MemberEntry): boolean {
    if (!entry.exitTime) return false;
    const duration = this.calculateDurationInMinutes(entry.entryTime, entry.exitTime);
    return duration >= 301;
  }
}