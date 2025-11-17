import { Component, OnInit } from '@angular/core';
import { SignInDialog } from '../../staff/sign-in-dialog/sign-in-dialog';
import { StaffService } from '../../services/staff.services';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { Staff, StaffSignIn } from '../../interfaces/staff.model';

interface StaffRecord {
  id: string;
  name: string;
  signin: string; // formatted "hh:mm AM/PM"
  lateness: number; // minutes late
}

interface EarlyStaffRecord {
  staffName: string;
  signInTime: string; // ISO string format
  date: string;
  minutesEarly: number;
}

interface LateStaffRecord {
  staffName: string;
  signInTime: string; // ISO string format
  date: string;
  minutesLate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  staffRecords: StaffRecord[] = [];
  earliestStaff: StaffRecord[] = [];
  lateStaff: StaffRecord[] = [];
  showAllEarliest = false;
  showAllLate = false;

  earlyStaffRecords: EarlyStaffRecord[] = [];
  earlyStaffCount: number = 0;
  percentEarlyStaff: number = 0;
  showAllEarly: boolean = false;

  lateStaffRecords: LateStaffRecord[] = [];
  lateStaffCount: number = 0;
  percentLateStaff: number = 0;

  // staffRecords: StaffRecord[] = [
  //   { id: 'ST001', name: 'John Doe', department: 'IT', signin: '07:45 AM', lateness: 0 },
  //   { id: 'ST002', name: 'Mary Jane', department: 'HR', signin: '08:10 AM', lateness: 3 },
  //   { id: 'ST003', name: 'Sam Okoro', department: 'Finance', signin: '08:02 AM', lateness: 1 },
  //   { id: 'ST004', name: 'Chioma Ade', department: 'Admin', signin: '07:58 AM', lateness: 0 },
  //   { id: 'ST005', name: 'David Musa', department: 'Marketing', signin: '08:20 AM', lateness: 5 },
  //   { id: 'ST006', name: 'Ruth Emmanuel', department: 'HR', signin: '08:12 AM', lateness: 4 },
  //   { id: 'ST007', name: 'Peter Bello', department: 'Finance', signin: '07:50 AM', lateness: 0 },
  //   { id: 'ST008', name: 'Joy Ikenna', department: 'Admin', signin: '08:05 AM', lateness: 2 },
  // ];

  constructor(private dialog: MatDialog, private staffService: StaffService) {}

  openSignInModal() {
    const dialogRef = this.dialog.open(SignInDialog, {
      width: '420px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert('✅ Sign-in recorded successfully!');
        this.loadStaffSignIns(); // refresh dashboard stats
      }
    });
  }

  ngOnInit() {
    this.loadStaffSignIns();
  }

  loadStaffSignIns() {
    this.staffService.getStaff().subscribe((staffList) => {
      // Flatten all signIns from all staff
      const allSignIns = staffList.flatMap((staff) =>
        (staff.signIns || []).map((signIn) => ({
          id: signIn.id,
          staffId: staff.id,
          name: `${staff.firstName} ${staff.lastName}`,
          timestamp: signIn.timestamp,
          expectedStartTime: staff.expectedStartTime || '08:00',
        }))
      );

      // Map signIns to StaffRecord with signin time & lateness
      this.staffRecords = allSignIns.map((signIn) => {
        const signinTime = this.formatTime(signIn.timestamp);
        const lateness = this.calculateLateness(signIn.timestamp, signIn.expectedStartTime);
        return {
          id: String(signIn.staffId), // <-- convert number to string here
          name: signIn.name,
          signin: signinTime,
          lateness,
        };
      });

      this.processStaffData();
      this.processEarlyStaff(staffList);
      this.processLateStaff(staffList);
    });
  }

  processStaffData() {
    // Sort by signin time ascending
    const sorted = [...this.staffRecords].sort(
      (a, b) => this.toMinutes(a.signin) - this.toMinutes(b.signin)
    );

    this.earliestStaff = sorted;
    this.lateStaff = sorted.slice().reverse();

    // Count late staff as those with lateness >= 5 minutes
    this.lateStaffCount = this.staffRecords.filter((r) => r.lateness >= 5).length;
  }

  processEarlyStaff(staffList: Staff[]) {
  const EARLY_TIME = '08:00:00'; // 8 AM
  const earlyStaffRecords: EarlyStaffRecord[] = [];

  staffList.forEach(staff => {
    if (!staff.signIns?.length) return;

    staff.signIns.forEach((signIn: StaffSignIn) => {
      const localTime = new Date(signIn.timestamp);
      const localHours = localTime.getHours().toString().padStart(2, '0');
      const localMinutes = localTime.getMinutes().toString().padStart(2, '0');
      const localTimeString = `${localHours}:${localMinutes}:00`;

      if (localTimeString < EARLY_TIME) {
        const expectedTime = new Date(localTime);
        expectedTime.setHours(8, 0, 0, 0);
        const diffMs = expectedTime.getTime() - localTime.getTime();
        const minutesEarly = Math.floor(diffMs / 60000);

        earlyStaffRecords.push({
          staffName: `${staff.firstName} ${staff.lastName}`,
          signInTime: localTime.toISOString(),
          date: localTime.toLocaleDateString(),
          minutesEarly
        });
      }
    });
  });

  // Sort from earliest to latest
  this.earlyStaffRecords = earlyStaffRecords.sort(
    (a, b) => new Date(a.signInTime).getTime() - new Date(b.signInTime).getTime()
  );

  this.earlyStaffCount = this.earlyStaffRecords.length;
  this.percentEarlyStaff = this.staffRecords.length
    ? (this.earlyStaffCount / this.staffRecords.length) * 100
    : 0;
}

processLateStaff(staffList: Staff[]) {
  const LATE_TIME = '08:00:00'; // 8 AM
  const lateStaffRecords: LateStaffRecord[] = [];

  staffList.forEach(staff => {
    if (!staff.signIns?.length) return;

    staff.signIns.forEach((signIn: StaffSignIn) => {
      const localTime = new Date(signIn.timestamp);
      const localHours = localTime.getHours().toString().padStart(2, '0');
      const localMinutes = localTime.getMinutes().toString().padStart(2, '0');
      const localTimeString = `${localHours}:${localMinutes}:00`;

      if (localTimeString > LATE_TIME) {
        const expectedTime = new Date(localTime);
        expectedTime.setHours(8, 0, 0, 0);
        const diffMs = localTime.getTime() - expectedTime.getTime();
        const minutesLate = Math.floor(diffMs / 60000);

        lateStaffRecords.push({
          staffName: `${staff.firstName} ${staff.lastName}`,
          signInTime: localTime.toISOString(),
          date: localTime.toLocaleDateString(),
          minutesLate
        });
      }
    });
  });

  // Sort by lateness descending (latest arrivals first)
  this.lateStaffRecords = lateStaffRecords.sort(
    (a, b) => b.minutesLate - a.minutesLate
  );

  this.lateStaffCount = this.lateStaffRecords.length;
  this.percentLateStaff = this.staffRecords.length
    ? (this.lateStaffCount / this.staffRecords.length) * 100
    : 0;
}

  

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  calculateLateness(signinTimestamp: string, expectedStart: string): number {
    const signin = new Date(signinTimestamp);
    const [expHours, expMinutes] = expectedStart.split(':').map(Number);

    const expected = new Date(signin);
    expected.setHours(expHours, expMinutes, 0, 0);

    const diffMs = signin.getTime() - expected.getTime();
    return diffMs > 0 ? Math.floor(diffMs / 60000) : 0; // difference in minutes, 0 if early
  }

  toMinutes(time: string): number {
    const [raw, modifier] = time.split(' ');
    let [hours, minutes] = raw.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  toggleView(section: 'earliest' | 'late'): void {
    if (section === 'earliest') this.showAllEarliest = !this.showAllEarliest;
    if (section === 'late') this.showAllLate = !this.showAllLate;
  }
}
