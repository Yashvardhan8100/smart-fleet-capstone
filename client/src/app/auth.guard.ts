import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {

    // ✅ DIRECTLY READ TOKEN from localStorage (NO timing issue)
    const token = localStorage.getItem('token');

    if (token && token !== '') {
      return true;
    }

    this.router.navigateByUrl('/login');
    return false;
  }
}