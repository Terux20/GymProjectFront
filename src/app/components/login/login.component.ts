import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TokenResponse } from '../../models/refreshToken';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(event: Event) {
    event.preventDefault();
    
    if (!this.loginForm.valid) {
      this.toastrService.error('Lütfen tüm alanları doldurun');
      return;
    }

    this.isLoading = true;
    const loginModel = Object.assign({}, this.loginForm.value);

    this.authService.login(loginModel)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: TokenResponse) => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            this.toastrService.success(response.message || 'Giriş başarılı');
            
            this.router.navigate(['/todayentries'])
              .then(() => {
                console.log('Navigation successful');
              })
              .catch(err => {
                console.error('Navigation error:', err);
                this.authService.clearSession();
              });
          } else {
            this.toastrService.error(response.message || 'Giriş başarısız');
          }
        },
        error: (error) => {
          if (error.error && error.error.message) {
            this.toastrService.error(error.error.message);
          } else {
            this.toastrService.error('Bir hata oluştu');
          }
          this.authService.clearSession();
        }
      });
  }
}
