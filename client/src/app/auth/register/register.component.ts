import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {

  registerForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  // Username
  usernameChecking = false;
  usernameExists = false;
  usernameVerified = false;

  // Email
  emailChecking = false;
  emailExists = false;
  emailAvailable = false;

  // OTP
  otpSending = false;
  otpSent = false;
  otpSentMessage = '';
  otpCode = '';
  otpVerifying = false;
  otpVerified = false;
  otpError = '';
  otpTimer = 0;
  otpTimerInterval: any = null;

  // Phone
  phoneChecking = false;
  phoneExists = false;
  phoneVerified = false;

  // Password rules
  passwordRules = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  passwordTouched = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/)
      ]],
      contactNumber: ['', [Validators.pattern('^[6-9][0-9]{9}$')]],
      role: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.stopOtpTimer();
  }

    
  // NAVIGATION
    

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

    
  // USERNAME
    

  checkUsername(): void {
    const username = this.registerForm.get('username')?.value?.trim();
    this.usernameVerified = false;
    this.usernameExists = false;

    if (!username) return;

    this.usernameChecking = true;

    this.authService.checkUsername(username).subscribe({
      next: (res: any) => {
        this.usernameChecking = false;
        this.usernameExists = res.exists;
        this.usernameVerified = !res.exists;
      },
      error: () => {
        this.usernameChecking = false;
      }
    });
  }

    
  // EMAIL
    

  checkEmail(): void {
    const email = this.registerForm.get('email')?.value?.trim();
    this.emailAvailable = false;
    this.emailExists = false;
    this.otpSent = false;
    this.otpVerified = false;
    this.otpCode = '';
    this.otpError = '';
    this.otpSentMessage = '';
    this.stopOtpTimer();

    if (!email || this.registerForm.get('email')?.invalid) return;

    this.emailChecking = true;

    this.authService.checkEmail(email).subscribe({
      next: (res: any) => {
        this.emailChecking = false;
        this.emailExists = res.exists;
        this.emailAvailable = !res.exists;
      },
      error: () => {
        this.emailChecking = false;
      }
    });
  }

    
  // OTP
    

  sendOtp(): void {
    const email = this.registerForm.get('email')?.value?.trim();
    if (!email || this.emailExists) return;

    this.otpSending = true;
    this.otpError = '';
    this.otpSentMessage = '';

    this.authService.sendOtp(email).subscribe({
      next: () => {
        this.otpSending = false;
        this.otpSent = true;
        this.otpSentMessage = 'OTP sent to ' + email;
        this.startOtpTimer();
      },
      error: (error: any) => {
        this.otpSending = false;
        this.otpError = this.extractError(error) || 'Failed to send OTP.';
      }
    });
  }

  verifyOtp(): void {
    const email = this.registerForm.get('email')?.value?.trim();

    if (!email || !this.otpCode || this.otpCode.length !== 6) {
      this.otpError = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.otpVerifying = true;
    this.otpError = '';

    this.authService.verifyOtp(email, this.otpCode).subscribe({
      next: (res: any) => {
        this.otpVerifying = false;
        if (res.verified) {
          this.otpVerified = true;
          this.otpError = '';
          this.stopOtpTimer();
        } else {
          this.otpVerified = false;
          this.otpError = res.message || 'Invalid or expired OTP.';
        }
      },
      error: () => {
        this.otpVerifying = false;
        this.otpError = 'Verification failed.';
      }
    });
  }

  resendOtp(): void {
    this.otpCode = '';
    this.otpVerified = false;
    this.otpError = '';
    this.sendOtp();
  }

  startOtpTimer(): void {
    this.otpTimer = 60;
    this.otpTimerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) this.stopOtpTimer();
    }, 1000);
  }

  stopOtpTimer(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
    this.otpTimer = 0;
  }

    
  // PHONE
    

  checkPhone(): void {
    const phone = this.registerForm.get('contactNumber')?.value?.trim();
    this.phoneVerified = false;
    this.phoneExists = false;

    if (!phone || this.registerForm.get('contactNumber')?.invalid) return;

    this.phoneChecking = true;

    this.authService.checkPhone(phone).subscribe({
      next: (res: any) => {
        this.phoneChecking = false;
        this.phoneExists = res.exists;
        this.phoneVerified = !res.exists;
      },
      error: () => {
        this.phoneChecking = false;
      }
    });
  }

    
  // PASSWORD
    

  checkPasswordRules(): void {
    this.passwordTouched = true;
    const p = this.registerForm.get('password')?.value || '';

    this.passwordRules = {
      minLength: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*]/.test(p)
    };
  }

  get passedRules(): number {
    const r = this.passwordRules;
    return [r.minLength, r.uppercase, r.lowercase, r.number, r.special].filter(Boolean).length;
  }

    
  // REGISTER
    

  register(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    if (this.usernameExists) {
      this.errorMessage = 'Username is already taken.';
      return;
    }

    if (this.emailExists) {
      this.errorMessage = 'Email is already registered.';
      return;
    }

    if (!this.otpVerified) {
      this.errorMessage = 'Please verify your email with OTP.';
      return;
    }

    if (this.phoneExists) {
      this.errorMessage = 'Contact number is already registered.';
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error: any) => {
        this.errorMessage = this.extractError(error) || 'Registration failed.';
      }
    });
  }

    
  // HELPERS
    

  isInvalid(name: string): boolean {
    const c = this.registerForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched || this.submitted));
  }

  private extractError(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (typeof error?.error === 'string') return error.error;
    if (error?.message) return error.message;
    return '';
  }
}