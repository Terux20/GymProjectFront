// today-entries.component.ts
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
  styleUrls: ['./today-entries.component.css']
})
export class TodayEntriesComponent implements OnInit {
  entries: MemberEntry[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  memberControl = new FormControl();
  members: Member[] = [];
  filteredMembers: Observable<Member[]>;

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
  calculateDuration(entryTime: Date, exitTime: Date): string {
    const entry = new Date(entryTime);
    const exit = new Date(exitTime);
    const diffInMinutes = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60));
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    }
    return `${minutes} dakika`;
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

  clearSearch() {
    this.memberControl.reset();
    this.getTodayEntries();
  }
}