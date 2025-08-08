// src/app/services/department.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private apiUrl = 'http://localhost:3000/api/department';

  constructor(private http: HttpClient) {}

  // Create a new department
  createDepartment(department: Department): Observable<any> {
    return this.http.post(this.apiUrl, department);
  }

  // Get all departments
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  // Get one department by ID
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  // Update department
  updateDepartment(id: number, department: Department): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, department);
  }

  // Delete department
deleteDepartment(id: number): Observable<any> {
  return this.http.delete(`/api/department/${id}`);
}
addDepartment(data: any): Observable<any> {
  return this.http.post('/api/department', data);
}


}