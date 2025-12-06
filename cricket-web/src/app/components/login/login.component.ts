import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiServiceService } from '../../services/api-service.service';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordFieldType: string = 'password';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: ApiServiceService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  userLogin(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.loginService
        .usersLogin({ email, password })
        .pipe(
          catchError((error) => {
            if (error.status === 401) {
              Swal.fire({
                icon: 'error',
                title: 'Password not match',
                text: 'Please enter correct password',
                showConfirmButton: true,
                confirmButtonText: 'OK',
              });
            } else if (error.status === 400) {
              Swal.fire({
                icon: 'error',
                title: 'User not exists',
                text: 'User not found. Please Register first.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'An error occurred. Please try again.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
              });
            }
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (res) => {
            console.log(res, 'login data');
            Swal.fire({
              icon: 'success',
              title: 'Login Successfully..!',
              text: 'Welcome back!',
              showConfirmButton: true,
              confirmButtonText: 'OK',
            });
            this.loginService.login(res.token, res.user);
            this.router.navigate(['matches']);
          },
          error: (err) => {
            console.error('Login Failed', err);
          }
        });
    }
  }

  togglePasswordView(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }
}
