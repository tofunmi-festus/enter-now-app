import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  constructor(private fb: FormBuilder, private router: Router){}
  loginForm! : FormGroup

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(){
    this.loginForm = this.fb.group({
      emailAdd: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  onSubmit(): void {
    // if (this.loginForm.valid) {
    //   // simulate login logic or API call
    //   const { emailAdd, password } = this.loginForm.value;

    //   // (Optional) Check credentials or call backend here

    //   // ✅ Navigate to another page (e.g., admin dashboard)
    //   this.router.navigate(['/admin/home']);
    // } else {
    //   // mark all fields as touched to show validation errors
    //   this.loginForm.markAllAsTouched();
    // }
    this.router.navigate(['/admin/home']);
  }
}
