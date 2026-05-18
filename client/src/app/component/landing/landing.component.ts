import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  mobileMenuOpen = false;

  // Counters
  vehiclesActive = 0;
  fleetsManaged = 0;
  uptimeVal = 0;
  driversOnline = 0;

  // Contact
  contactForm: FormGroup;
  contactSent = false;

  private timers: any[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.animateCount('vehiclesActive', 2847, 1500);
    this.animateCount('fleetsManaged', 14302, 1800);
    this.animateCount('uptimeVal', 99, 1000);
    this.animateCount('driversOnline', 8421, 1600);
  }

  ngAfterViewInit(): void {
    const video = document.querySelector('.hero-video') as HTMLVideoElement;

    if (video) {
      video.muted = true;
      video.play().catch(() => {
        document.addEventListener('click', () => {
          video.play();
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearInterval(t));
  }

  // Navigation
  goRegister(): void { this.router.navigate(['/register']); }
  goLogin(): void { this.router.navigate(['/login']); }

  toggleMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }

  scrollTo(id: string): void {
    this.mobileMenuOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  // ✅ ✅ CONTACT FORM SUBMIT (WORKING VERSION)
  sendContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const payload = this.contactForm.value;

    console.log("📤 Sending payload:", payload); // ✅ DEBUG
    this.http.post(
      `${environment.apiUrl}/api/contact`,
      payload,
      { responseType: 'text' }  // ✅ Add this
    )
      .subscribe({
        next: (res) => {
          console.log('✅ Response:', res);
          this.contactSent = true;
          this.contactForm.reset();
          setTimeout(() => this.contactSent = false, 3000);
        },
        error: (err) => {
          console.error('❌ ERROR:', err);
          alert('Failed to send message. Please check backend.');
        }
      });
  }

  // ✅ ✅ ✅ THIS WAS MISSING (CAUSE OF YOUR ERROR)
  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  // Counter animation
  private animateCount(prop: string, target: number, duration: number): void {
    const steps = 60;
    const inc = target / steps;
    const interval = duration / steps;
    let current = 0;

    const t = setInterval(() => {
      current += inc;
      if (current >= target) {
        (this as any)[prop] = target;
        clearInterval(t);
      } else {
        (this as any)[prop] = Math.floor(current);
      }
    }, interval);

    this.timers.push(t);
  }
}