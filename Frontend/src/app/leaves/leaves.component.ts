import { Component } from '@angular/core';
import { LeavesService } from '../Services/Leaves-services/leaves.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeesService } from '../Services/Employees-serives/employees.service';
import { Leave } from '../models/leave.model';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent {
  leaves: Leave[] = [];
  leaveForm!: FormGroup;
  employees: any[] = [];
  selectedLeaveIdToDelete: number | null = null;
  isEditMode: boolean = false;
  remainingLeaves: number = 0;

  constructor(
    private fb: FormBuilder,
    private leavesService: LeavesService,
    private employeesService: EmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLeaves();
    this.loadEmployees();
  }

  loadLeaves(): void {
    this.leavesService.getAllLeaves().subscribe({
      next: (data) => {
        this.leaves = data.map(leave => ({
          ...leave,
          leave_type: leave.leave_type || 'N/A',
          days: this.calculateDays(leave.start_date, leave.end_date),
          remaining_days: leave.remaining_days ?? 0
        }));
      },
      error: (err) => console.error('Error loading leaves:', err)
    });
  }

  calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
  }

  loadEmployees(): void {
    this.employeesService.getEmployees().subscribe({
      next: (data: any) => (this.employees = data),
      error: (err: any) => console.error('Error loading employees:', err)
    });
  }

  initForm(): void {
    this.leaveForm = this.fb.group({
      id: [null],
      employee_id: ['', Validators.required],
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      duration: ['', Validators.required],
      reason: ['']
    });
  }

  findInvalidControls(): string[] {
    const invalid: string[] = [];
    const controls = this.leaveForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onSubmit(): void {
    console.log('Submitting leave with values:', this.leaveForm.value);

    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      console.warn('Form is invalid', this.leaveForm.value);
      console.error('Invalid Controls:', this.findInvalidControls());
      return;
    }

    if (this.isEditMode) {
      const leaveId = this.leaveForm.get('id')?.value;
      this.leavesService.updateLeave(leaveId, this.leaveForm.value).subscribe({
        next: () => {
          this.leaveForm.reset();
          this.isEditMode = false;
          this.loadLeaves();
          this.closeModal('addLeaveModal');
        },
        error: (err) => console.error('Update leave failed:', err)
      });
    } else {
      this.leavesService.createLeave(this.leaveForm.value).subscribe({
        next: () => {
          this.leaveForm.reset();
          this.loadLeaves();
          this.closeModal('addLeaveModal');
          this.router.navigate(['/leaves']);  // ← Navigate to leaves list
        },
        error: (err) => console.error('Create leave failed:', err)
      });
    }
  }

  confirmDelete(leaveId?: number): void {
    if (leaveId === undefined) return;
    if (confirm('Are you sure you want to delete this leave?')) {
      this.leavesService.deleteLeave(leaveId).subscribe({
        next: () => {
          this.loadLeaves();
          alert('Leave deleted successfully');
        },
        error: (err) => console.error('Failed to delete leave:', err)
      });
    }
  }

closeModal(modalId: string): void {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
}

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstname} ${employee.lastName}` : 'Unknown';
  }

  openAddModal(): void {
    this.isEditMode = false;

    this.leaveForm.reset({
      employee_id: '',
      leave_type: '',
      start_date: '',
      end_date: '',
      duration: '',
      reason: ''
    });

    this.leaveForm.patchValue({
      status: 'pending',
      duration: 'Full Day'
    });

    const modalEl = document.getElementById('addLeaveModal');
    if (modalEl) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  openEditModal(leave: Leave): void {
    this.isEditMode = true;
    this.leaveForm.patchValue({
      id: leave.id,
      employee_id: leave.employee_id,
      leave_type: leave.leave_type || '',
      start_date: this.formatDateToInput(leave.start_date),
      end_date: this.formatDateToInput(leave.end_date),
      reason: leave.reason,
      status: leave.status || 'pending',
      duration: leave['duration'] || 'Full Day'
    });

    const modalEl = document.getElementById('addLeaveModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  }

  formatDateToInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }
}
