import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // Phase control
  phase: 'splash' | 'auth' = 'splash';
  splashTimer: any = null;

  // Auth tab
  activeTab: 'login' | 'register' = 'login';

  // ✅ Forgot password mode
  forgotMode: boolean = false;
  forgotStep: 'email' | 'otp' | 'reset' | 'success' = 'email';
  forgotEmail: string = '';
  forgotOtpCode: string = '';
  forgotNewPassword: string = '';
  forgotConfirmPassword: string = '';
  forgotError: string = '';
  forgotMessage: string = '';
  forgotOtpSending: boolean = false;
  forgotOtpSent: boolean = false;
  forgotOtpVerifying: boolean = false;
  forgotOtpVerified: boolean = false;
  forgotResetting: boolean = false;
  forgotOtpTimer: number = 0;
  forgotOtpTimerInterval: any = null;

  // Forgot password validation
  forgotPasswordRules = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  forgotPasswordTouched: boolean = false;

  // Login form
  loginForm: FormGroup;
  loginSubmitted: boolean = false;
  loginError: string = '';
  loginLoading: boolean = false;
  loginSuccess: boolean = false;

  // Register form
  registerForm: FormGroup;
  registerSubmitted: boolean = false;
  registerError: string = '';
  registerSuccess: string = '';
  registerLoading: boolean = false;

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

  // Password validation
  passwordRules = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };
  passwordTouched: boolean = false;

  // Splash counters
  counterVehicles: number = 0;
  counterFleets: number = 0;
  counterUptime: number = 0;
  counterDrivers: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

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

  ngOnInit(): void {
    this.startCounters();

    this.splashTimer = setTimeout(() => {
      this.phase = 'auth';
    }, 7500);
  }

  ngOnDestroy(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
    }

    this.stopOtpTimer();
    this.stopForgotOtpTimer();
  }

  // ==========================================
  // SPLASH
  // ==========================================

  skipToAuth(): void {
    if (this.splashTimer) {
      clearTimeout(this.splashTimer);
    }

    this.phase = 'auth';
  }

  startCounters(): void {
    this.animateCounter('counterVehicles', 2847, 3000);
    this.animateCounter('counterFleets', 14302, 3500);
    this.animateCounter('counterUptime', 99, 2000);
    this.animateCounter('counterDrivers', 8421, 3200);
  }

  animateCounter(property: string, target: number, duration: number): void {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        (this as any)[property] = target;
        clearInterval(timer);
      } else {
        (this as any)[property] = Math.floor(current);
      }
    }, interval);
  }

  // ==========================================
  // TAB SWITCH
  // ==========================================

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.loginSubmitted = false;
    this.registerSubmitted = false;
    this.loginSuccess = false;
    this.forgotMode = false;
    this.resetForgotState();
  }

  // ==========================================
  // LOGIN
  // ==========================================

  handleLogin(): void {
    this.loginSubmitted = true;
    this.loginError = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loginLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loginLoading = false;
        this.loginSuccess = true;

        this.authService.saveLoginData(response);

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'Invalid username/email or password';
      }
    });
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  showForgot(): void {
    this.forgotMode = true;
    this.forgotStep = 'email';
    this.resetForgotState();
  }

  backToLogin(): void {
    this.forgotMode = false;
    this.resetForgotState();
  }

  resetForgotState(): void {
    this.forgotEmail = '';
    this.forgotOtpCode = '';
    this.forgotNewPassword = '';
    this.forgotConfirmPassword = '';
    this.forgotError = '';
    this.forgotMessage = '';
    this.forgotOtpSending = false;
    this.forgotOtpSent = false;
    this.forgotOtpVerifying = false;
    this.forgotOtpVerified = false;
    this.forgotResetting = false;
    this.forgotPasswordTouched = false;
    this.forgotPasswordRules = {
      minLength: false, uppercase: false,
      lowercase: false, number: false, special: false
    };
    this.stopForgotOtpTimer();
  }

  // Step 1 — Send OTP to email
  forgotSendOtp(): void {
    this.forgotError = '';
    this.forgotMessage = '';

    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError = 'Please enter a valid email address.';
      return;
    }

    this.forgotOtpSending = true;

    this.authService.forgotPasswordSendOtp(this.forgotEmail).subscribe({
      next: () => {
        this.forgotOtpSending = false;
        this.forgotOtpSent = true;
        this.forgotStep = 'otp';
        this.forgotMessage = 'OTP sent to ' + this.forgotEmail;
        this.startForgotOtpTimer();
      },
      error: (error: any) => {
        this.forgotOtpSending = false;

        if (error?.status === 404) {
          this.forgotError = 'No account found with this email.';
        } else {
          this.forgotError = error?.error?.message || 'Failed to send OTP.';
        }
      }
    });
  }

  // Step 2 — Verify OTP
  forgotVerifyOtp(): void {
    this.forgotError = '';
    this.forgotMessage = '';

    if (!this.forgotOtpCode || this.forgotOtpCode.length !== 6) {
      this.forgotError = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.forgotOtpVerifying = true;

    this.authService.forgotPasswordVerifyOtp(this.forgotEmail, this.forgotOtpCode).subscribe({
      next: (res: any) => {
        this.forgotOtpVerifying = false;

        if (res.verified) {
          this.forgotOtpVerified = true;
          this.forgotStep = 'reset';
          this.forgotMessage = 'OTP verified! Set your new password.';
          this.stopForgotOtpTimer();
        } else {
          this.forgotError = res.message || 'Invalid or expired OTP.';
        }
      },
      error: () => {
        this.forgotOtpVerifying = false;
        this.forgotError = 'Verification failed. Please try again.';
      }
    });
  }

  // Step 3 — Reset Password
  forgotResetPassword(): void {
    this.forgotError = '';
    this.forgotMessage = '';

    if (!this.forgotNewPassword) {
      this.forgotError = 'Please enter a new password.';
      return;
    }

    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!pattern.test(this.forgotNewPassword)) {
      this.forgotError = 'Password does not meet all requirements.';
      return;
    }

    if (this.forgotNewPassword !== this.forgotConfirmPassword) {
      this.forgotError = 'Passwords do not match.';
      return;
    }

    this.forgotResetting = true;

    this.authService.resetPassword(this.forgotEmail, this.forgotNewPassword).subscribe({
      next: () => {
        this.forgotResetting = false;
        this.forgotStep = 'success';
        this.forgotMessage = 'Password reset successfully!';

        setTimeout(() => {
          this.backToLogin();
        }, 3000);
      },
      error: (error: any) => {
        this.forgotResetting = false;
        this.forgotError = error?.error?.message || 'Failed to reset password.';
      }
    });
  }

  // Resend forgot OTP
  forgotResendOtp(): void {
    this.forgotOtpCode = '';
    this.forgotError = '';
    this.forgotStep = 'otp';
    this.forgotSendOtp();
  }

  // Forgot OTP timer
  startForgotOtpTimer(): void {
    this.forgotOtpTimer = 60;

    this.forgotOtpTimerInterval = setInterval(() => {
      this.forgotOtpTimer--;

      if (this.forgotOtpTimer <= 0) {
        this.stopForgotOtpTimer();
      }
    }, 1000);
  }

  stopForgotOtpTimer(): void {
    if (this.forgotOtpTimerInterval) {
      clearInterval(this.forgotOtpTimerInterval);
      this.forgotOtpTimerInterval = null;
    }

    this.forgotOtpTimer = 0;
  }

  // Forgot password validation
  checkForgotPasswordRules(): void {
    this.forgotPasswordTouched = true;
    const password = this.forgotNewPassword || '';

    this.forgotPasswordRules = {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
  }

  get forgotPassedRules(): number {
    const r = this.forgotPasswordRules;
    return [r.minLength, r.uppercase, r.lowercase, r.number, r.special]
      .filter(Boolean).length;
  }

  // ==========================================
  // REGISTER
  // ==========================================

  handleRegister(): void {
    this.registerSubmitted = true;
    this.registerError = '';
    this.registerSuccess = '';

    if (this.registerForm.invalid) {
      return;
    }

    if (this.usernameExists) {
      this.registerError = 'Username is already taken.';
      return;
    }

    if (this.emailExists) {
      this.registerError = 'Email is already registered.';
      return;
    }

    if (!this.otpVerified) {
      this.registerError = 'Please verify your email with OTP before registering.';
      return;
    }

    if (this.phoneExists) {
      this.registerError = 'Contact number is already registered.';
      return;
    }

    this.registerLoading = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.registerLoading = false;
        this.registerSuccess = 'Registration successful! Switching to login...';

        setTimeout(() => {
          this.switchTab('login');
          this.registerSuccess = '';
        }, 2000);
      },
      error: (error) => {
        this.registerLoading = false;

        if (error.error && typeof error.error === 'string') {
          this.registerError = error.error;
        } else if (error.error?.message) {
          this.registerError = error.error.message;
        } else {
          this.registerError = 'Registration failed. Please try again.';
        }
      }
    });
  }

  // ==========================================
  // USERNAME CHECK
  // ==========================================

  checkUsername(): void {
    const username = this.registerForm.get('username')?.value?.trim();

    this.usernameVerified = false;
    this.usernameExists = false;

    if (!username) {
      return;
    }

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

  // ==========================================
  // EMAIL CHECK
  // ==========================================

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

    if (!email || this.registerForm.get('email')?.invalid) {
      return;
    }

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

  // ==========================================
  // OTP (Register)
  // ==========================================

  sendOtp(): void {
    const email = this.registerForm.get('email')?.value?.trim();

    if (!email || this.emailExists) {
      return;
    }

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
        this.otpError = error?.error?.message || 'Failed to send OTP.';
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

      if (this.otpTimer <= 0) {
        this.stopOtpTimer();
      }
    }, 1000);
  }

  stopOtpTimer(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }

    this.otpTimer = 0;
  }

  // ==========================================
  // PHONE CHECK
  // ==========================================

  checkPhone(): void {
    const phone = this.registerForm.get('contactNumber')?.value?.trim();

    this.phoneVerified = false;
    this.phoneExists = false;

    if (!phone || this.registerForm.get('contactNumber')?.invalid) {
      return;
    }

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

  // ==========================================
  // PASSWORD VALIDATION (Register)
  // ==========================================

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
    return [r.minLength, r.uppercase, r.lowercase, r.number, r.special]
      .filter(Boolean).length;
  }

  // ==========================================
  // HELPERS
  // ==========================================

  isLoginInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.loginSubmitted)
    );
  }

  isRegisterInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.registerSubmitted)
    );
  }
}