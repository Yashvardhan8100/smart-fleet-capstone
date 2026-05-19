import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PhoneOtpService {

    private base = 'http://localhost:8080/api/otp/phone';

    constructor(private http: HttpClient) { }

    sendOtp(phone: string, purpose: 'REGISTER' | 'LOGIN'): Observable<any> {
        return this.http.post(`${this.base}/send`, { phone, purpose });
    }

    verifyOtp(txnId: string, otp: string): Observable<any> {
        return this.http.post(`${this.base}/verify`, { txnId, otp });
    }

    registerWithOtp(payload: any): Observable<any> {
        return this.http.post(`${this.base}/register`, payload);
    }
}