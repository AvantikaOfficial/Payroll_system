import { Component, OnInit } from '@angular/core';
import { Department, DepartmentService } from '../Services/Department-serives/department.service';
declare var bootstrap: any;


@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: []
})
export class DepartmentComponent implements OnInit {

  departments: Department[] = [];
  selectedDepartmentIdForDelete?: number;
  selectedEmployeeIdForDelete: undefined;
  router: any;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.getAllDepartments();
  }

  getAllDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
      }
    });
  }



selectedDepartmentId: number | null = null;

confirmDelete(id: number): void {
  this.selectedDepartmentId = id;
}

deleteDepartment(): void {
  if (this.selectedDepartmentId === null) return;

  this.departmentService.deleteDepartment(this.selectedDepartmentId).subscribe({
    next: () => {
      // Remove the deleted department from the local list
      this.departments = this.departments.filter(dept => dept.id !== this.selectedDepartmentId);
      this.selectedDepartmentId = null;

      // Close modal (optional if using Bootstrap JS)
      const closeBtn = document.getElementById('closeDeleteModalBtn');
      closeBtn?.click();

      // Optionally show success notification
      console.log('Department deleted successfully');
    },
    error: (err) => {
      alert('Error deleting department: ' + (err?.message || 'Unknown error'));
    }
  });
}

 editDepartment(id: number): void {
  this.router.navigate(['/add-department', id]);
}

}