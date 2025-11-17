import { Component } from '@angular/core';
import { StaffService } from '../../services/staff.services';
import { Staff, StaffSignIn } from '../../interfaces/staff.model';

// export interface StaffRecord {
//   id: string;
//   name: string;
//   department: string;
//   signin: string;
//   lateness: number;
// }

// const DATA_SOURCE: StaffRecord[] = [
//   { id: 'ST001', name: 'John Doe', department: 'IT', signin: '07:45 AM', lateness: 0 },
//   { id: 'ST002', name: 'Mary Jane', department: 'HR', signin: '08:10 AM', lateness: 3 },
//   { id: 'ST003', name: 'Sam Okoro', department: 'Finance', signin: '08:02 AM', lateness: 1 },
//   { id: 'ST004', name: 'Chioma Ade', department: 'Admin', signin: '07:58 AM', lateness: 0 },
//   { id: 'ST005', name: 'David Musa', department: 'Marketing', signin: '08:20 AM', lateness: 5 },
//   { id: 'ST006', name: 'Ruth Emmanuel', department: 'HR', signin: '08:12 AM', lateness: 4 },
//   { id: 'ST007', name: 'Peter Bello', department: 'Finance', signin: '07:50 AM', lateness: 0 },
//   { id: 'ST008', name: 'Joy Ikenna', department: 'Admin', signin: '08:05 AM', lateness: 2 },
//   { id: 'ST0010', name: 'John Doe', department: 'IT', signin: '07:45 AM', lateness: 0 },
//   { id: 'ST0020', name: 'Mary Jane', department: 'HR', signin: '08:10 AM', lateness: 3 },
//   { id: 'ST0030', name: 'Sam Okoro', department: 'Finance', signin: '08:02 AM', lateness: 1 },
//   { id: 'ST0040', name: 'Chioma Ade', department: 'Admin', signin: '07:58 AM', lateness: 0 },
//   { id: 'ST0050', name: 'David Musa', department: 'Marketing', signin: '08:20 AM', lateness: 5 },
//   { id: 'ST0060', name: 'Ruth Emmanuel', department: 'HR', signin: '08:12 AM', lateness: 4 },
//   { id: 'ST0070', name: 'Peter Bello', department: 'Finance', signin: '07:50 AM', lateness: 0 },
//   { id: 'ST0080', name: 'Joy Ikenna', department: 'Admin', signin: '08:05 AM', lateness: 2 },
// ];

@Component({
  selector: 'app-staff',
  standalone: false,
  templateUrl: './staff.html',
  styleUrl: './staff.css',
})
export class StaffDashboard {
  // displayedColumns: string[] = ['id', 'name', 'department', 'signin', 'lateness'];
  // dataSource = DATA_SOURCE;

  staffList: Staff[] = [];

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.staffService.getStaff().subscribe((res) => (this.staffList = res));
  }

  getStats(signIns: StaffSignIn[] = [], expectedStart = '09:00') {
    const total = signIns.length;
    let lateCount = 0;

    signIns.forEach((s) => {
      const t = new Date(s.timestamp);
      const [h, m] = expectedStart.split(':').map(Number);
      const expected = new Date(t);
      expected.setHours(h, m, 0, 0);
      if (t > expected) lateCount++;
    });

    return {
      total,
      lateCount,
      deduction: lateCount * 1000,
    };
  }

  hasSignedInToday(staff: Staff): boolean {
    if (!staff.signIns || staff.signIns.length === 0) return false;
    const today = new Date().toISOString().split('T')[0];
    return staff.signIns.some(
      (signIn) => new Date(signIn.timestamp).toISOString().split('T')[0] === today
    );
  }
}
