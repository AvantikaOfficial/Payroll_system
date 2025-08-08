import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import flatpickr from 'flatpickr';

enum FormStatus {
  Pending = 'Pending',
  Success = 'Success',
  Error = 'Error'
}

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit, AfterViewInit {
  employeeForm: FormGroup;
  employeeId?: number;
  formStatus: FormStatus = FormStatus.Pending;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeesService: EmployeesService,
    private router: Router
  ) {
    this.employeeForm = this.fb.group({
      firstname: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      inviteEmail: [false],
      office: [''],
      joiningDate: [''],
      position: [''],
      team: [''],
      employmentType: [''],
      countryOfEmployment: [''],
      lineManager: [''],
      currency: [''],
      frequency: [''],
      salary: [0, [Validators.min(0)]],
      departmentId: [1, [Validators.required, Validators.min(1)]],
      status: [''],
      role: [''],
      name: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        this.loadEmployeeData(this.employeeId);
      }
    });
  }

  loadEmployeeData(id: number): void {
    this.employeesService.getEmployee(id).subscribe({
      next: (employee: Employee) => {
        this.employeeForm.patchValue({
          firstname: employee.firstname,
          lastName: employee.lastName,
          email: employee.email,
          inviteEmail: employee.inviteEmail ?? false,
          office: employee.office,
          joiningDate: employee.joiningDate,
          position: employee.position,
          status: employee.status,
          team: employee.team,
          employmentType: employee.employmentType,
          countryOfEmployment: employee.countryOfEmployment,
          lineManager: employee.lineManager,
          currency: employee.currency,
          frequency: employee.frequency,
          salary: employee.salary,
          departmentId: employee.departmentId ?? 1,
          role: employee.role,
          name: employee.name
        });
      },
      error: err => {
        console.error('Failed to load employee data', err);
      }
    });
  }

  onSubmit(): void {
    this.formStatus = FormStatus.Pending;

    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;

      if (this.employeeId) {
        this.employeesService.updateEmployee(this.employeeId, formData).subscribe({
          next: () => {
            this.formStatus = FormStatus.Success;
            alert('Employee updated successfully!');

            // ✅ Force reload to trigger ngOnInit in employees.component.ts
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/employees']);
            });
          },
          error: (err) => {
            this.formStatus = FormStatus.Error;
            console.error('Update failed', err);
            alert(`Could not update employee. Please check backend connection.`);
          }
        });
      } else {
        this.employeesService.addEmployee(formData).subscribe({
          next: () => {
            this.formStatus = FormStatus.Success;
            alert('Employee added successfully!');
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/employees']);
            });
          },
          error: (err) => {
            this.formStatus = FormStatus.Error;
            console.error('Add failed', err);
            alert(`Could not connect to the backend.`);
          }
        });
      }
    } else {
      this.formStatus = FormStatus.Error;
      this.employeeForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.employeeForm.reset({
      inviteEmail: false,
      salary: 0,
      departmentId: 1
    });
    this.router.navigate(['/employees']);
  }

  ngAfterViewInit(): void {
    flatpickr("[data-provider='flatpickr']", {
      dateFormat: "d M, Y",
    });
  }
}
