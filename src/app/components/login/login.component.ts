import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { response } from 'express';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
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
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  login() {
    if (this.loginForm.valid) {
      let loginModel = Object.assign({}, this.loginForm.value);
      console.log(loginModel);
      this.authService.login(loginModel).subscribe(
        (response) => {
          console.log(response);
          this.toastrService.info(response.message);
          localStorage.setItem('token', response.data.token);

          this.router.navigate(['/todayentries']); 

        },
        (responseError) => {
          console.log(responseError);
          this.toastrService.error(responseError.error.message);
        }
      );
    }
  }
  
}
