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
  standalone: false,
})
export class TodayEntriesComponent implements OnInit {
  entries: MemberEntry[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  memberControl = new FormControl();
  members: Member[] = [];
  filteredMembers: Observable<Member[]>;
  selectedMember: Member | null = null;
  isSearched: boolean = false;
  chartData: any[] = [];

  memberStats = {
    monthlyVisits: 0,
    averageStayTime: 0,
    lastVisit: null as Date | null,
    averageVisitsPerWeek: 0,
    mostFrequentDay: '',
    totalMonthlyDuration: 0
  };

  constructor(
    private memberService: MemberService,
    private memberEntryService: MemberEntryService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getMembers();
    this.getTodayEntries();
    this.initializeFilteredMembers();
    this.setupMemberControlSubscription();
  }

  private initializeFilteredMembers() {
    this.filteredMembers = this.memberControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterMembers(name) : this.members.slice();
      })
    );
  }

  private setupMemberControlSubscription() {
    this.memberControl.valueChanges.subscribe((member) => {
      if (member && typeof member !== 'string') {
        this.selectedMember = member;
        this.calculateMemberStats(member);
      }
    });
  }

  calculateMemberStats(member: Member) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Sadece bu ayki girişleri filtrele
    const memberEntries = this.entries.filter((entry) => {
      const entryDate = new Date(entry.entryTime);
      return (
        entry.name === member.name &&
        entry.phoneNumber === member.phoneNumber &&
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    });

    // Aylık toplam ziyaret
    this.memberStats.monthlyVisits = memberEntries.length;

    // Ortalama kalış süresi hesaplama
    let totalMinutes = 0;
    let validEntries = 0;
    const visitsByDate = new Map<string, number>();
    const visitDurations = new Map<string, number>();

    memberEntries.forEach((entry) => {
      // Ziyaret sayılarını tarihe göre topla
      const dateKey = new Date(entry.entryTime).toISOString().split('T')[0];
      visitsByDate.set(dateKey, (visitsByDate.get(dateKey) || 0) + 1);

      if (entry.exitTime && entry.entryTime) {
        const duration = this.calculateDurationInMinutes(
          entry.entryTime,
          entry.exitTime
        );
        if (duration <= 300) {
          totalMinutes += duration;
          validEntries++;
          visitDurations.set(dateKey, (visitDurations.get(dateKey) || 0) + duration);
        }
      }
    });

    // İstatistikleri güncelle
    this.memberStats.averageStayTime =
      validEntries > 0 ? Math.round(totalMinutes / validEntries) : 0;
    this.memberStats.totalMonthlyDuration = totalMinutes;
    this.memberStats.averageVisitsPerWeek = this.calculateAverageVisitsPerWeek(visitsByDate);
    this.memberStats.mostFrequentDay = this.findMostFrequentDay(visitsByDate);

    // Son ziyaret tarihi
    if (memberEntries.length > 0) {
      this.memberStats.lastVisit = new Date(memberEntries[0].entryTime);
    }

    // Grafik verilerini hazırla
    this.prepareChartData(visitsByDate, visitDurations);
  }

  private calculateAverageVisitsPerWeek(visitsByDate: Map<string, number>): number {
    const totalVisits = Array.from(visitsByDate.values()).reduce((a, b) => a + b, 0);
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const weeksSoFar = Math.ceil((currentDate.getTime() - firstDayOfMonth.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.round((totalVisits / weeksSoFar) * 10) / 10;
  }

  private findMostFrequentDay(visitsByDate: Map<string, number>): string {
    const dayCount = new Map<string, number>();
    for (const [dateStr, count] of visitsByDate) {
      const day = new Date(dateStr).toLocaleString('tr-TR', { weekday: 'long' });
      dayCount.set(day, (dayCount.get(day) || 0) + count);
    }
    
    let maxDay = '';
    let maxCount = 0;
    for (const [day, count] of dayCount) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    }
    return maxDay;
  }

  private prepareChartData(visitsByDate: Map<string, number>, durations: Map<string, number>) {
    this.chartData = Array.from(visitsByDate.entries())
      .map(([date, visits]) => ({
        date: new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        visits: visits,
        duration: Math.round((durations.get(date) || 0) / visits)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getTotalVisitorsToday(): number {
    const uniqueVisitors = new Set(
      this.entries.map((entry) => entry.phoneNumber)
    );
    return uniqueVisitors.size;
  }

  displayMember(member: Member): string {
    return member ? `${member.name} - ${member.phoneNumber}` : '';
  }

  private _filterMembers(value: string): Member[] {
    const filterValue = value.toLowerCase();
    return this.members.filter(
      (member) =>
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
      this.isSearched = true;
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
        this.toastrService.error(
          'Bugünkü girişler yüklenirken bir hata oluştu.',
          'Hata'
        );
        this.isLoading = false;
      },
    });
  }

  clearSearch() {
    this.memberControl.reset();
    this.selectedMember = null;
    this.memberStats = {
      monthlyVisits: 0,
      averageStayTime: 0,
      lastVisit: null,
      averageVisitsPerWeek: 0,
      mostFrequentDay: '',
      totalMonthlyDuration: 0
    };
    this.isSearched = false;
    this.getTodayEntries();
  }

  getMembers() {
    this.memberService.getMembers().subscribe({
      next: (response) => {
        this.members = response.data;
      },
      error: (error) => {
        console.error('Error fetching members:', error);
        this.toastrService.error('Üyeler yüklenirken bir hata oluştu.', 'Hata');
      },
    });
  }

  calculateDurationInMinutes(entryTime: Date, exitTime: Date): number {
    return Math.floor(
      (new Date(exitTime).getTime() - new Date(entryTime).getTime()) /
        (1000 * 60)
    );
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

  isActiveEntry(entry: MemberEntry): boolean {
    return !entry.exitTime;
  }

  shouldShowQRWarning(entry: MemberEntry): boolean {
    if (!entry.exitTime) return false;
    const duration = this.calculateDurationInMinutes(
      entry.entryTime,
      entry.exitTime
    );
    return duration >= 301;
  }
}