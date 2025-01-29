// components/devices/devices.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserDevice } from '../../models/userDevice';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css'],
  standalone:false
})
export class DevicesComponent implements OnInit {
  devices: UserDevice[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading = true;
    this.authService.getUserDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Cihaz listesi alınamadı: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  revokeDevice(deviceId: number): void {
    if (confirm('Bu cihazın oturumunu sonlandırmak istediğinize emin misiniz?')) {
      this.authService.revokeDevice(deviceId).subscribe({
        next: () => {
          this.toastr.success('Cihaz oturumu sonlandırıldı');
          this.loadDevices();
        },
        error: (error) => {
          this.toastr.error('İşlem başarısız: ' + error.message);
        }
      });
    }
  }

  revokeAllDevices(): void {
    if (confirm('Tüm cihazların oturumunu sonlandırmak istediğinize emin misiniz? (Mevcut cihaz hariç)')) {
      this.authService.revokeAllDevices().subscribe({
        next: () => {
          this.toastr.success('Tüm cihaz oturumları sonlandırıldı');
          this.loadDevices();
        },
        error: (error) => {
          this.toastr.error('İşlem başarısız: ' + error.message);
        }
      });
    }
  }
}