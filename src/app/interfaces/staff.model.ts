export interface StaffSignIn {
  id?: number;
  staffId: number;
  timestamp: string;
  method?: string;
  note?: string;
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  expectedStartTime?: string;
  signIns?: StaffSignIn[];
}