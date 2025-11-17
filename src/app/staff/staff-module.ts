import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing-module';
import { FaceCapture } from './face-capture/face-capture';
import { SignIn } from './sign-in/sign-in';
import { SignOut } from './sign-out/sign-out';
import { MaterialModule } from '../material/material-module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SignInDialog } from './sign-in-dialog/sign-in-dialog';


@NgModule({
  declarations: [
    FaceCapture,
    SignIn,
    SignInDialog,
    SignOut
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  
  exports: [SignInDialog]
})
export class StaffModule { }
