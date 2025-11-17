import { Component, OnInit } from '@angular/core';
import { Admin } from '../../services/admin';
import { IStaff } from '../../interfaces/staff';

export interface StaffRecord {
  id: string;
  name: string;
  department: string;
  signin: string;
}

const DATA_SOURCE: StaffRecord[] = [
  { id: 'ST001', name: 'John Doe', department: 'IT', signin: '07:45 AM'},
  { id: 'ST002', name: 'Mary Jane', department: 'HR', signin: '08:10 AM'},
  { id: 'ST003', name: 'Sam Okoro', department: 'Finance', signin: '08:02 AM'},
  { id: 'ST004', name: 'Chioma Ade', department: 'Admin', signin: '07:58 AM'},
  { id: 'ST005', name: 'David Musa', department: 'Marketing', signin: '08:20 AM'},
  { id: 'ST006', name: 'Ruth Emmanuel', department: 'HR', signin: '08:12 AM'},
  { id: 'ST007', name: 'Peter Bello', department: 'Finance', signin: '07:50 AM'},
  { id: 'ST008', name: 'Joy Ikenna', department: 'Admin', signin: '08:05 AM'},
  { id: 'ST0010', name: 'John Doe', department: 'IT', signin: '07:45 AM'},
  { id: 'ST0020', name: 'Mary Jane', department: 'HR', signin: '08:10 AM'},
  { id: 'ST0030', name: 'Sam Okoro', department: 'Finance', signin: '08:02 AM'},
  { id: 'ST0040', name: 'Chioma Ade', department: 'Admin', signin: '07:58 AM'},
  { id: 'ST0050', name: 'David Musa', department: 'Marketing', signin: '08:20 AM'},
  { id: 'ST0060', name: 'Ruth Emmanuel', department: 'HR', signin: '08:12 AM'},
  { id: 'ST0070', name: 'Peter Bello', department: 'Finance', signin: '07:50 AM'},
  { id: 'ST0080', name: 'Joy Ikenna', department: 'Admin', signin: '08:05 AM'},
];

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})

export class SignIn implements OnInit{

  dataSource! : IStaff[];
  displayedColumns: string[] = ['id', 'name', 'username', 'email', 'address'];

  constructor(private adminService : Admin){}
  ngOnInit(): void {
    this.onGetSignIns();
  }
  
  onGetSignIns(){
    this.adminService.getStaff().subscribe((res) => {
      this.dataSource = res;
    })
  }

  
}


