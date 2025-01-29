import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navi',
    templateUrl: './navi.component.html',
    styleUrls: ['./navi.component.css'],
    standalone: false
})
export class NaviComponent implements OnInit {
  isOwner: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isOwner = this.authService.hasRole('owner');
    this.isAdmin = this.authService.hasRole('admin');
  }

  logout(event: Event) {
    event.preventDefault(); 
    this.authService.logout();
}

isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
}
}