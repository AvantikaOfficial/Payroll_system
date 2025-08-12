import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EmployeesService, Employee } from '../Services/Employees-serives/employees.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  loading = false;
  error: string | null = null;
  selectedEmployeeIdForDelete?: number;

  private routerSub?: Subscription;

  constructor(
    private employeesService: EmployeesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();

    // Reload employees on every navigation that starts with /employees (handles /employees and /employees?query=...)
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navEnd = event as NavigationEnd;
        if (navEnd.urlAfterRedirects.startsWith('/employees')) {
          console.log('Navigated to /employees, reloading employees...');
          this.loadEmployees();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

loadEmployees(): void {
  console.log('Fetching employee list...');
  this.employeesService.getEmployees().subscribe({
    next: (data: Employee[]) => {
      this.employees = data;
      console.log('Updated employee list:', data);
    },
    error: (err) => {
      console.error('Error loading employees:', err);
    }
  });
}

  confirmDelete(id: number): void {
    this.selectedEmployeeIdForDelete = id;
  }

  deleteEmployee(): void {
    if (!this.selectedEmployeeIdForDelete) return;

    this.employeesService.deleteEmployee(this.selectedEmployeeIdForDelete).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.id !== this.selectedEmployeeIdForDelete);
        console.log(`Employee ${this.selectedEmployeeIdForDelete} deleted`);
        this.selectedEmployeeIdForDelete = undefined;
      },
      error: (err) => {
        alert('Error deleting employee: ' + (err.message || 'Unknown error'));
        console.error('Delete failed:', err);
      }
    });
  }

  editEmployee(id: number): void {
    this.router.navigate(['/add-employee', id]);
  }

trackById(index: number, employee: Employee): number {
  return employee.id ?? index;
}

}
