import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'gymproject';
  showNavbar: boolean = false; // Başlangıçta false olarak ayarla

  constructor(private router: Router) {}

  ngOnInit() {
    // NavigationStart ve NavigationEnd eventlerini dinle
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.showNavbar = !['/login', '/', '/qr'].includes(currentUrl);
      }
    });
  }
}