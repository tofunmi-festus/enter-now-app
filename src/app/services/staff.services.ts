import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Staff, StaffSignIn } from '../interfaces/staff.model';
import { Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class StaffService {
  private apiBase = 'https://enter-now-backend.onrender.com/api'; // json-server or real API

  constructor(private http: HttpClient) {}

  getStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiBase}/staff`);
  }

  getStaffById(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiBase}/staff/${id}`);
  }

  getSignIns(): Observable<StaffSignIn[]> {
    return this.http.get<StaffSignIn[]>(`${this.apiBase}/signins`);
  }
  
  addSignIn(signIn: StaffSignIn): Observable<StaffSignIn> {
    return this.http.post<StaffSignIn>(`${this.apiBase}/signins`, signIn);
  }

  updateStaffSignIns(staffId: number, signIns: StaffSignIn[]): Observable<Staff> {
    return this.http.patch<Staff>(`${this.apiBase}/staff/${staffId}`, { signIns });
  }

  appendSignInToStaff(staffId: number, signIn: StaffSignIn) {
    return this.getStaffById(staffId).pipe(
      switchMap((staff) => {
        const updatedSignIns = [...(staff.signIns || []), signIn];
        return this.http.patch<Staff>(`${this.apiBase}/staff/${staffId}`, {
          signIns: updatedSignIns,
        });
      })
    );
  }
}