import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignIn } from './sign-in/sign-in';
import { Reports } from './reports/reports';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { StaffDashboard } from './staff/staff';
import { AdminLayout } from './layout/admin-layout/admin-layout';

const routes: Routes = [
  {
    path: 'home',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'staff',
        component: StaffDashboard,
      },
      {
        path: "sign-in",
        component: SignIn
      },
      {
        path: 'reports',
        component: Reports,
      },
    ],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
