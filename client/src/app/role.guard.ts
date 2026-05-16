import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const allowedRoles = route.data['roles'] as string[];
        const userRole = this.authService.getRole();

        if (!userRole || !allowedRoles) {
            this.router.navigate(['/login']);
            return false;
        }

        if (allowedRoles.includes(userRole)) {
            return true;
        }

        this.router.navigate(['/dashboard']);
        return false;
    }
}