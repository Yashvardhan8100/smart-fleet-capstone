import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  submitted: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  launching: boolean = false;

  // Username verification
  usernameChecking: boolean = false;
  usernameExists: boolean = false;
  usernameVerified: boolean = false;

  // Email verification
  emailChecking: boolean = false;
  emailExists: boolean = false;
  emailAvailable: boolean = false;

  // OTP states
  otpSending: boolean = false;
  otpSent: boolean = false;
  otpSentMessage: string = '';
  otpCode: string = '';
  otpVerifying: boolean = false;
  otpVerified: boolean = false;
  otpError: string = '';
  otpTimer: number = 0;
  otpTimerInterval: any = null;

  // Phone verification
  phoneChecking: boolean = false;
  phoneExists: boolean = false;
  phoneVerified: boolean = false;

  passwordRules = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  passwordTouched: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      )]],
      contactNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
      role: ['ADMIN', Validators.required]
    });
  }

  checkPasswordRules(): void {
    this.passwordTouched = true;
    const password = this.registerForm.get('password')?.value || '';

    this.passwordRules = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
  }

  get passedRules(): number {
    const r = this.passwordRules;
    return [r.minLength, r.uppercase, r.lowercase, r.number, r.special].filter(Boolean).length;
  }

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
        this.otpError = this.extractBackendMessage(error) || 'Failed to send OTP. Please try again.';
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
        this.otpError = 'Verification failed. Please try again.';
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

  register(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    if (this.usernameExists) return void (this.errorMessage = 'Username is already taken.');
    if (this.emailExists) return void (this.errorMessage = 'Email is already registered.');
    if (!this.otpVerified) return void (this.errorMessage = 'Please verify your email with OTP before registering.');
    if (this.phoneExists) return void (this.errorMessage = 'Contact number is already registered.');

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = 'Access granted. Redirecting to login...';
        this.launching = true;
        setTimeout(() => this.router.navigate(['/login']), 2200);
      },
      error: (error: any) => {
        // ✅ CLEAN VALIDATION MESSAGE FROM BACKEND
        this.errorMessage = this.extractBackendMessage(error) || 'Registration failed. Please try again.';
      }
    });
  }

  private extractBackendMessage(error: any): string {
    // backend returns {message:"..."} or plain string
    if (error?.error?.message) return error.error.message;
    if (typeof error?.error === 'string') return error.error;
    if (error?.message) return error.message;
    return '';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }
}