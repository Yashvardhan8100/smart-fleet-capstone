import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // Forgot password
  forgotMode = false;
  forgotStep: 'email' | 'otp' | 'reset' | 'success' = 'email';
  forgotEmail = '';
  forgotOtpCode = '';
  forgotNewPassword = '';
  forgotConfirmPassword = '';
  forgotError = '';
  forgotMessage = '';
  forgotOtpSending = false;
  forgotOtpVerifying = false;
  forgotOtpVerified = false;
  forgotResetting = false;
  forgotOtpTimer = 0;
  forgotOtpTimerInterval: any = null;
  forgotPasswordRules = {
    minLength: false, uppercase: false, lowercase: false, number: false, special: false
  };
  forgotPasswordTouched = false;


  loginForm: FormGroup;
  loginSubmitted = false;
  loginError = '';
  loginLoading = false;
  loginSuccess = false;


  loginStep: 'credentials' | 'otp' = 'credentials';
  loginOtpCode = '';
  loginOtpMessage = '';
  loginOtpTimer = 0;
  loginOtpTimerInterval: any = null;
  private storedLoginResponse: any = null;
  private loginUserEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  ngOnInit(): void {
    this.loginStep = 'credentials';
    this.loginSuccess = false;
    this.loginError = '';
  }

  ngOnDestroy(): void {
    this.stopForgotOtpTimer();
    this.stopLoginOtpTimer();
  }


  goHome(): void { this.router.navigateByUrl('/'); }
  goRegister(): void { this.router.navigateByUrl('/register'); }


  handleLogin(): void {
    this.loginSubmitted = true;
    this.loginError = '';
    if (this.loginForm.invalid) return;

    this.loginLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.storedLoginResponse = res;
        this.loginUserEmail = res.email;

        this.authService.sendOtp(this.loginUserEmail).subscribe({
          next: () => {
            this.loginLoading = false;
            this.loginStep = 'otp';
            this.loginOtpMessage = 'OTP sent to ' + this.maskEmail(this.loginUserEmail);
            this.startLoginOtpTimer();
          },
          error: () => {
            this.loginLoading = false;
            this.loginError = 'Failed to send OTP';
          }
        });
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'Invalid username/email or password';
      }
    });
  }


  loginVerifyOtp(): void {
    if (!this.loginOtpCode || this.loginOtpCode.length !== 6) {
      this.loginError = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.loginLoading = true;
    this.loginError = '';
    this.loginOtpMessage = '';

    this.authService.verifyOtp(this.loginUserEmail, this.loginOtpCode).subscribe({
      next: (res: any) => {
        this.loginLoading = false;

        if (res?.verified) {
          this.loginSuccess = true;

      
          this.authService.saveLoginData(this.storedLoginResponse);

          this.stopLoginOtpTimer();


          this.router.navigateByUrl('/dashboard');

        } else {
          this.loginError = res?.message || 'Invalid OTP';
        }
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'OTP verification failed';
      }
    });
  }

  loginResendOtp(): void {
    this.loginOtpCode = '';
    this.loginError = '';
    this.loginOtpMessage = '';
    this.loginLoading = true;

    this.authService.sendOtp(this.loginUserEmail).subscribe({
      next: () => {
        this.loginLoading = false;
        this.loginOtpMessage = 'OTP resent to ' + this.maskEmail(this.loginUserEmail);
        this.startLoginOtpTimer();
      },
      error: () => {
        this.loginLoading = false;
        this.loginError = 'Failed to resend OTP';
      }
    });
  }

  loginBackToCredentials(): void {
    this.loginStep = 'credentials';
    this.loginOtpCode = '';
    this.loginError = '';
    this.loginOtpMessage = '';
    this.storedLoginResponse = null;
    this.loginUserEmail = '';
    this.stopLoginOtpTimer();
  }

  maskEmail(email: string): string {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return email;
    return name.substring(0, 2) + '****@' + domain;
  }

  startLoginOtpTimer(): void {
    this.stopLoginOtpTimer();
    this.loginOtpTimer = 60;
    this.loginOtpTimerInterval = setInterval(() => {
      this.loginOtpTimer--;
      if (this.loginOtpTimer <= 0) this.stopLoginOtpTimer();
    }, 1000);
  }

  stopLoginOtpTimer(): void {
    if (this.loginOtpTimerInterval) {
      clearInterval(this.loginOtpTimerInterval);
      this.loginOtpTimerInterval = null;
    }
    this.loginOtpTimer = 0;
  }

  // Forgot password (unchanged)
  showForgot(): void { this.forgotMode = true; this.forgotStep = 'email'; this.resetForgotState(); }
  backToLogin(): void { this.forgotMode = false; this.resetForgotState(); }

  resetForgotState(): void {
    this.forgotEmail = '';
    this.forgotOtpCode = '';
    this.forgotNewPassword = '';
    this.forgotConfirmPassword = '';
    this.forgotError = '';
    this.forgotMessage = '';
    this.forgotOtpSending = false;
    this.forgotOtpVerifying = false;
    this.forgotOtpVerified = false;
    this.forgotResetting = false;
    this.forgotPasswordTouched = false;
    this.forgotPasswordRules = {
      minLength: false, uppercase: false, lowercase: false, number: false, special: false
    };
    this.stopForgotOtpTimer();
  }

  forgotSendOtp(): void {
    this.forgotError = '';
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError = 'Please enter a valid email.';
      return;
    }
    this.forgotOtpSending = true;

    this.authService.forgotPasswordSendOtp(this.forgotEmail).subscribe({
      next: () => {
        this.forgotOtpSending = false;
        this.forgotStep = 'otp';
        this.forgotMessage = 'OTP sent to ' + this.forgotEmail;
        this.startForgotOtpTimer();
      },
      error: (e: any) => {
        this.forgotOtpSending = false;
        this.forgotError = e?.status === 404
          ? 'No account found with this email.'
          : (e?.error?.message || 'Failed to send OTP.');
      }
    });
  }

  forgotVerifyOtp(): void {
    this.forgotError = '';
    if (!this.forgotOtpCode || this.forgotOtpCode.length !== 6) {
      this.forgotError = 'Enter a valid 6-digit OTP.';
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
        this.forgotError = 'Verification failed.';
      }
    });
  }

  forgotResetPassword(): void {
    this.forgotError = '';
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!pattern.test(this.forgotNewPassword)) {
      this.forgotError = 'Password does not meet requirements.';
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
        setTimeout(() => this.backToLogin(), 3000);
      },
      error: (e: any) => {
        this.forgotResetting = false;
        this.forgotError = e?.error?.message || 'Failed to reset password.';
      }
    });
  }

  forgotResendOtp(): void { this.forgotOtpCode = ''; this.forgotError = ''; this.forgotSendOtp(); }

  startForgotOtpTimer(): void {
    this.forgotOtpTimer = 60;
    this.forgotOtpTimerInterval = setInterval(() => {
      this.forgotOtpTimer--;
      if (this.forgotOtpTimer <= 0) this.stopForgotOtpTimer();
    }, 1000);
  }

  stopForgotOtpTimer(): void {
    if (this.forgotOtpTimerInterval) {
      clearInterval(this.forgotOtpTimerInterval);
      this.forgotOtpTimerInterval = null;
    }
    this.forgotOtpTimer = 0;
  }

  get forgotPassedRules(): number {
    const r = this.forgotPasswordRules;
    return [r.minLength, r.uppercase, r.lowercase, r.number, r.special].filter(Boolean).length;
  }

  isLoginInvalid(name: string): boolean {
    const c = this.loginForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched || this.loginSubmitted));
  }
}
