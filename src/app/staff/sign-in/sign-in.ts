import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StaffService } from '../../services/staff.services';
import { Staff, StaffSignIn } from '../../interfaces/staff.model';

@Component({
  selector: 'app-sign-in',
  standalone: false,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn implements OnInit {
  staffList: Staff[] = [];
  form!: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private staffService: StaffService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      staffId: ['', Validators.required],
      timestamp: [this.getLocalDateTimeString(), Validators.required],
      method: ['', Validators.required],
      note: [''],
    });

    this.loadStaff();
    this.listenToMethodChanges();
    this.listenToStaffChanges();
  }

  // --- Auto-update note when method changes
  private listenToMethodChanges() {
    this.form.get('method')?.valueChanges.subscribe((method) => {
      if (!method) return;

      const staffId = +this.form.get('staffId')?.value;
      const staff = this.staffList.find((s) => s.id === staffId);

      let autoNote = '';
      switch (method) {
        case 'self':
          autoNote = staff
            ? `Signed in by ${staff.firstName} ${staff.lastName}`
            : 'Signed in by self';
          break;
        case 'security':
          autoNote = 'Signed in by security personnel';
          break;
      }

      const currentNote = this.form.get('note')?.value?.trim();
      const wasAutoFilled =
        !currentNote ||
        currentNote === 'Signed in by self' ||
        currentNote === 'Signed in by security personnel' ||
        currentNote?.startsWith('Signed in by');

      if (wasAutoFilled) {
        this.form.get('note')?.setValue(autoNote);
      }
    });
  }

  // --- Auto-update when staff changes
  private listenToStaffChanges() {
    this.form.get('staffId')?.valueChanges.subscribe(() => {
      const currentMethod = this.form.get('method')?.value;
      if (currentMethod) {
        // force trigger the valueChanges again for method
        this.form.get('method')?.setValue(currentMethod);
      }
    });
  }

  // --- Utility for local datetime
  getLocalDateTimeString(): string {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  // --- Load staff list from backend
  loadStaff() {
    this.staffService.getStaff().subscribe((res) => (this.staffList = res));
  }

  // --- Handle form submission
  submit() {
    const data = this.form.value;
    const selectedStaffId = +data.staffId;

    const now = new Date();
    const chosenDateTime = data.timestamp ? new Date(data.timestamp) : now;

    // Prevent future sign-ins
    if (chosenDateTime > now) {
      this.message = 'You cannot sign in for a future time.';
      return;
    }

    // Prevent past-day sign-ins
    const today = now.toISOString().split('T')[0];
    const chosenDate = chosenDateTime.toISOString().split('T')[0];
    if (chosenDate !== today) {
      this.message = 'You can only sign in for today.';
      return;
    }

    this.staffService.getStaffById(selectedStaffId).subscribe({
      next: (staff) => {
        const alreadySignedIn = staff.signIns?.some((signIn) => {
          const signInDate = new Date(signIn.timestamp).toISOString().split('T')[0];
          return signInDate === today;
        });

        if (alreadySignedIn) {
          this.message = `${staff.firstName} ${staff.lastName} has already signed in today.`;
          return;
        }

        const signIn: StaffSignIn = {
          staffId: selectedStaffId,
          timestamp: chosenDateTime.toISOString(),
          method: data.method?.toLowerCase() as 'self' | 'security' | 'other',
          note: data.note,
        };

        this.staffService.addSignIn(signIn).subscribe({
          next: (createdSignIn) => {
            this.staffService
              .appendSignInToStaff(createdSignIn.staffId, createdSignIn)
              .subscribe(() => {
                this.message = `Sign-in recorded for ${staff.firstName} ${staff.lastName}.`;
                this.form.reset({
                  staffId: '',
                  timestamp: this.getLocalDateTimeString(),
                  method: '',
                  note: '',
                });
              });
          },
          error: () => {
            this.message = 'Failed to record sign-in.';
          },
        });
      },
      error: () => {
        this.message = 'Could not verify staff record.';
      },
    });
  }
}

// export class SignIn implements OnInit{
//   // constructor(private fb: FormBuilder){  }
//   // signInForm! : FormGroup;

//   // ngOnInit(): void {
//   //   this.buildForm();
//   // }

//   // buildForm(){
//   //   this.signInForm = this.fb.group({
//   //     staffId: ['', [Validators.required]],
//   //     password: ['', [Validators.required, Validators.minLength(8)]]
//   //   })
//   // }

//   // submitForm(){
//   //   // console.log(this.signInForm.value)
//   // }

//   staffList: Staff[] = [];
//   form!: FormGroup;
//   message = '';

//   constructor(private fb: FormBuilder, private staffService: StaffService) {}

//  ngOnInit(): void {
//   this.form = this.fb.group({
//     staffId: [''],
//     timestamp: [this.getLocalDateTimeString()],
//     method: [''],
//     note: ['']
//   });

//   this.loadStaff();

//   // Listen for method changes
//  this.form.get('method')?.valueChanges.subscribe((method) => {
//   if (!method) return;

//   const staffId = +this.form.get('staffId')?.value;
//   const staff = this.staffList.find(s => s.id === staffId);

//   let autoNote = '';
//   switch (method) {
//     case 'self':
//       if (staff) {
//         autoNote = `Signed in by ${staff.firstName} ${staff.lastName}`;
//       } else {
//         autoNote = 'Signed in by self';
//       }
//       break;
//     case 'security':
//       autoNote = 'Signed in by security personnel';
//       break;
//     case 'other':
//       autoNote = 'Signed in through alternate method';
//       break;
//   }

//   const currentNote = this.form.get('note')?.value?.trim();

//   // ✅ Update if:
//   // 1. The note is empty, or
//   // 2. The note exactly matches a previous auto-note (so user didn’t customize it)
//   const wasAutoFilled =
//     currentNote === 'Signed in by self' ||
//     currentNote === 'Signed in by security personnel' ||
//     currentNote?.startsWith('Signed in by');

//   if (!currentNote || wasAutoFilled) {
//     this.form.get('note')?.setValue(autoNote);
//   }
// });

//   // Also listen for staff selection changes
//   this.form.get('staffId')?.valueChanges.subscribe(() => {
//     // Re-trigger note update if method is already selected
//     const currentMethod = this.form.get('method')?.value;
//     if (currentMethod) {
//       this.form.get('method')?.updateValueAndValidity({ onlySelf: true });
//     }
//   });
// }

// getLocalDateTimeString(): string {
//   const now = new Date();
//   const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
//   const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
//   return localISOTime;
// }

//   loadStaff() {
//     this.staffService.getStaff().subscribe(res => (this.staffList = res));
//   }

//   submit() {
//   const data = this.form.value;
//   const selectedStaffId = +data.staffId;

//   // Get current date/time
//   const now = new Date();

//   // If timestamp manually chosen, parse it, else use now
//   const chosenDateTime = data.timestamp ? new Date(data.timestamp) : now;

//   // Check #1 — Prevent future sign-ins
//   if (chosenDateTime > now) {
//     this.message = 'You cannot sign in for a future time.';
//     return;
//   }

//   // Check #2 — Prevent past sign-ins (for previous days)
//   const today = now.toISOString().split('T')[0];
//   const chosenDate = chosenDateTime.toISOString().split('T')[0];
//   if (chosenDate !== today) {
//     this.message = 'You can only sign in for today.';
//     return;
//   }

//   // Proceed to verify if staff already signed in today
//   this.staffService.getStaffById(selectedStaffId).subscribe({
//     next: (staff) => {
//       const alreadySignedIn = staff.signIns?.some(signIn => {
//         const signInDate = new Date(signIn.timestamp).toISOString().split('T')[0];
//         return signInDate === today;
//       });

//       if (alreadySignedIn) {
//         this.message = `${staff.firstName} ${staff.lastName} has already signed in today.`;
//         return;
//       }

//       // Create sign-in record
//       const signIn: StaffSignIn = {
//         staffId: selectedStaffId,
//         timestamp: chosenDateTime.toISOString(),
//         method: data.method?.toLowerCase() as 'self' | 'security' | 'other',
//         note: data.note
//       };

//       // Save sign-in
//       this.staffService.addSignIn(signIn).subscribe({
//         next: (createdSignIn) => {
//           this.staffService.appendSignInToStaff(createdSignIn.staffId, createdSignIn)
//             .subscribe(() => {
//               this.message = `Sign-in recorded for ${staff.firstName} ${staff.lastName}.`;
//               this.form.reset();
//             });
//         },
//         error: (err) => {
//           // console.error(err);
//           this.message = 'Failed to record sign-in.';
//         }
//       });
//     },
//     error: (err) => {
//       // console.error('Error fetching staff:', err);
//       this.message = 'Could not verify staff record.';
//     }
//   });

//   this.form.reset({
//   timestamp: [this.getLocalDateTimeString()],
//   method: '',
//   note: ''
// });

// }

// }

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { StaffService } from '../../services/staff.services';
// import { Staff } from '../../interfaces/staff.model';

// @Component({
//   selector: 'app-staff-sign-in',
//   templateUrl: './sign-in.html',
//   styleUrls: ['./sign-in.css']
// })
// export class SignIn implements OnInit {
// staffList: Staff[] = [];
// form!: FormGroup;
// message = '';

// constructor(private fb: FormBuilder, private staffService: StaffService) {}

// ngOnInit(): void {
//   this.form = this.fb.group({
//     staffId: [''],
//     timestamp: [''],
//     note: ['']
//   });
//   this.loadStaff();
// }

// loadStaff() {
//   this.staffService.getStaff().subscribe(res => (this.staffList = res));
// }

// submit() {
//   const data = this.form.value;
//   const signIn = {
//     staffId: +data.staffId,
//     timestamp: data.timestamp
//       ? new Date(data.timestamp).toISOString()
//       : new Date().toISOString(),
//     method: 'security', // since security can sign in for staff
//     note: data.note || 'Signed in by security'
//   };
//   this.staffService.addSignIn(signIn).subscribe(res => {
//     this.message = `Sign-in recorded for staff ID ${res.staffId}`;
//     this.form.reset();
//   });
// }
// }
