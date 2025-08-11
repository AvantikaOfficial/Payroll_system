import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../Services/Login-serivces/login.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';

    // Client-side validation
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.loginService.login(this.email, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/dashboard']);  // or your intended route
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = 'An error occurred during login. Please try again.';
      }
    });
  }
}
