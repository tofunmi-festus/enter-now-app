import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IStaff } from '../interfaces/staff';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  constructor(private httpClient: HttpClient) {}

  private baseUrl = 'https://jsonplaceholder.typicode.com/users';

  /** GET all staff */
  getStaff(): Observable<IStaff[]> {
    return this.httpClient.get<IStaff[]>(this.baseUrl);
  }

  /** CREATE a new staff record */
  createStaff(staff: IStaff): Observable<IStaff> {
    return this.httpClient.post<IStaff>(this.baseUrl, staff);
  }

  /** EDIT (UPDATE) an existing staff record */
  editStaff(id: number, staff: Partial<IStaff>): Observable<IStaff> {
    const url = `${this.baseUrl}/${id}`;
    return this.httpClient.patch<IStaff>(url, staff);
  }

  /** DELETE a staff record */
  deleteStaff(id: number): Observable<IStaff> {
    const url = `${this.baseUrl}/${id}`;
    return this.httpClient.delete<IStaff>(url);
  }
}
