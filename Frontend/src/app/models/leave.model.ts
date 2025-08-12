export interface Leave {
  NoofDays: string;
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  status: string;
  reason: string;
  leave_type?: string;
  days?: number;
  remaining_days?: number;
  duration?: string; // <-- Add this
}
