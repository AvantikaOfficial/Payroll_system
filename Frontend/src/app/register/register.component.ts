import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreeTerms: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister() {
    this.errorMessage = '';

    // Validation
    if (!this.fullName.trim()) {
      this.errorMessage = 'Please enter your full name';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Please enter your password';
      return;
    }
    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (!this.agreeTerms) {
      this.errorMessage = 'You must agree to the terms and privacy policy';
      return;
    }

    const user = {
      username: this.fullName.trim(),  // Use fullName as username
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/register', user).subscribe({
      next: (res) => {
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.errorMessage = err.error?.error || 'Registration failed.';
      }
    });
  }
}
