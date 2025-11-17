import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { SignIn } from './sign-in/sign-in';
import { Reports } from './reports/reports';
import { Login } from './login/login';
import { MaterialModule } from '../material/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffDashboard } from './staff/staff';
import { AdminHeader } from './layout/admin-header/admin-header';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { AdminSideNav } from './layout/admin-side-nav/admin-side-nav';
import { StaffModule } from '../staff/staff-module';


@NgModule({
  declarations: [
    Dashboard,
    SignIn,
    Reports,
    Login,
    StaffDashboard,
    AdminHeader,
    AdminLayout,
    AdminSideNav,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    StaffModule
  ]
})
export class AdminModule { }
