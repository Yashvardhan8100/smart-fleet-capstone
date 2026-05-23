import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../model/user';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public serverName = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ✅ FIXED — Removed auto login (NO tap, NO saveLoginData here)
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.serverName}/api/auth/login`,
      loginRequest
    );
  }

  // ✅ Only called AFTER OTP verification
  saveLoginData(response: LoginResponse): void {
    if (response) {
      const token = response.token || response.jwtToken;

      if (token) {
        this.setToken(token);
      }

      if (response.role) {
        this.setRole(response.role);
      }

      if (response.userId !== undefined && response.userId !== null) {
        this.setUserId(response.userId);
      }

      if (response.username) {
        this.setUsername(response.username);
      }
    }
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(
      `${this.serverName}/api/auth/register`,
      user
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      `${this.serverName}/api/auth/user`,
      { headers: this.getAuthHeaders() }
    );
  }

  getLoggedInUser(): Observable<User> {
    return this.getCurrentUser();
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? Number(userId) : null;
  }

  setUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    }

    return new HttpHeaders();
  }

  // ✅ Validation APIs
  checkUsername(username: string): Observable<any> {
    return this.http.get<any>(
      `${this.serverName}/api/auth/check-username?username=${username}`
    );
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get<any>(
      `${this.serverName}/api/auth/check-email?email=${email}`
    );
  }

  checkPhone(contactNumber: string): Observable<any> {
    return this.http.get<any>(
      `${this.serverName}/api/auth/check-phone?contactNumber=${contactNumber}`
    );
  }

  // ✅ EMAIL OTP
  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(
      `${this.serverName}/api/auth/send-otp?email=${email}`,
      {}
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(
      `${this.serverName}/api/auth/verify-otp?email=${email}&otp=${otp}`,
      {}
    );
  }

  // ✅ Forgot password
  forgotPasswordSendOtp(email: string): Observable<any> {
    return this.http.post<any>(
      `${this.serverName}/api/auth/forgot-password/send-otp?email=${email}`,
      {}
    );
  }

  forgotPasswordVerifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(
      `${this.serverName}/api/auth/forgot-password/verify-otp?email=${email}&otp=${otp}`,
      {}
    );
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.serverName}/api/auth/forgot-password/reset?email=${email}&newPassword=${newPassword}`,
      {}
    );
  }
}