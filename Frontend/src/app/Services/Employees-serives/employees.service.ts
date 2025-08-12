import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Employee {
  profileImage: string;
  frequency: any;
  currency: any;
  countryOfEmployment: any;
  lineManager: any;
  employmentType: any;
  inviteEmail: boolean;
  id?: number;
  name: string;
  office: string;
  email: string;
  salary: number;
  role: string;
  status: string;
  firstname: string;
  lastName: string; 
  position: string;
  team: string;
  departmentId: number;
  joiningDate: string;  // Format: 'YYYY-MM-DD'
}

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private apiUrl = 'http://localhost:3000/api/employees';

  constructor(private http: HttpClient) { }

  // Get all employees
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // Get single employee by id
  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  // Add new employee
  addEmployee(employee: Employee): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, employee);
  }

  // Update employee by id
updateEmployee(id: number, employee: Employee): Observable<{ message: string }> {
  return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, employee);
}
  // Delete employee by id
  deleteEmployee(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
