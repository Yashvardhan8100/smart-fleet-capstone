import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'SmartFleet Pro';

  private timeout: any;
  private idleTime = 5 * 60 * 1000; // ✅ 5 minutes

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.startIdleTimer();
  }

  // ✅ Detect user activity and reset timer
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('document:click')
  @HostListener('document:scroll')
  resetIdleTimer() {
    clearTimeout(this.timeout);
    this.startIdleTimer();
  }

  // ✅ Start auto logout timer
  startIdleTimer() {
    this.timeout = setTimeout(() => {
      this.autoLogout();
    }, this.idleTime);
  }

  // ✅ AUTO LOGOUT (NO CONFIRMATION)
  autoLogout(): void {
    alert('Session expired due to inactivity.');

    this.authService.logout();
    this.router.navigate(['/']);
  }

  // ✅ Manual logout (your existing logic)
  logout(): void {
    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  // ✅ Role getter (unchanged)
  get role(): string | null {
    return this.authService.getRole();
  }
}