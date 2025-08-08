import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentService } from '../Services/Department-serives/department.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html'
})
export class AddDepartmentComponent implements OnInit {
  // ✅ Declare form group
  departmentForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Initialize form group
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      status: ['active', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      this.departmentService.addDepartment(this.departmentForm.value).subscribe({
        next: () => {
          this.router.navigate(['/departments']);
        },
        error: (err: any) => {
          console.error('Failed to add department:', err);
        }
      });
    }
  }
}