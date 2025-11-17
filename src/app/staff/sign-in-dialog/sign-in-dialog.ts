import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Staff, StaffSignIn } from '../../interfaces/staff.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StaffService } from '../../services/staff.services';

@Component({
  selector: 'app-sign-in-dialog',
  standalone: false,
  templateUrl: './sign-in-dialog.html',
  styleUrl: './sign-in-dialog.css',
})
export class SignInDialog {
signInForm!: FormGroup;
  staffList: Staff[] = [];
  message = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SignInDialog>,
    private staffService: StaffService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      staffId: ['', Validators.required],
      method: ['', Validators.required],
      note: [''],
      timestamp: [this.getLocalDateTimeString(), Validators.required]
    });

    this.staffService.getStaff().subscribe(res => (this.staffList = res));

    // Update note dynamically when method changes
    this.signInForm.get('method')?.valueChanges.subscribe((method) => {
      const noteField = this.signInForm.get('note');
      const staffId = +this.signInForm.get('staffId')?.value;
      const staff = this.staffList.find(s => s.id === staffId);

      let autoNote = '';
      if (method === 'self') {
        autoNote = staff ? `Signed in by ${staff.firstName}` : 'Signed in by self';
      } else if (method === 'security') {
        autoNote = 'Signed in by security personnel';
      } else {
        autoNote = 'Signed in through alternate method';
      }

      if (!noteField?.value || noteField.value.startsWith('Signed in')) {
        noteField?.setValue(autoNote);
      }
    });
  }

  getLocalDateTimeString(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  }

  submit(): void {
    const data = this.signInForm.value;
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
          method: data.method?.toLowerCase() as 'self' | 'security',
          note: data.note,
        };

        this.staffService.addSignIn(signIn).subscribe({
          next: (createdSignIn) => {
            this.staffService
              .appendSignInToStaff(createdSignIn.staffId, createdSignIn)
              .subscribe(() => {
                this.message = `Sign-in recorded for ${staff.firstName} ${staff.lastName}.`;
                this.signInForm.reset({
                  staffId: '',
                  timestamp: this.getLocalDateTimeString(),
                  method: '',
                  note: '',
                });
                this.dialogRef.close(true);  // close modal and send 'true' to parent
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
  

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
