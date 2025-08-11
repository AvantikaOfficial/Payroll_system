import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// HTTP & Forms
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeesComponent } from './employees/employees.component';
import { DepartmentComponent } from './department/department.component';
import { LeavesComponent } from './leaves/leaves.component';
import { SalaryComponent } from './salary/salary.component';
import { LoginComponent } from './login/login.component';
import { ChartApexComponent } from './charts/chart-apex/chart-apex.component';
import { ReportCalendarComponent } from './report-calendar/report-calendar.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { TeamReportComponent } from './reports/team-report/team-report.component';
import { LeaveReportComponent } from './reports/leave-report/leave-report.component';
import { PayrollReportComponent } from './reports/payroll-report/payroll-report.component';
import { EmailReportComponent } from './reports/email-report/email-report.component';
import { SecurityReportComponent } from './reports/security-report/security-report.component';
import { WorkFromHomeReportComponent } from './reports/work-from-home-report/work-from-home-report.component';
import { ContactReportComponent } from './reports/contact-report/contact-report.component';
import { ChatComponent } from './application/chat/chat.component';
import { NotesComponent } from './application/notes/notes.component';
import { CalendarComponent } from './application/calendar/calendar.component';
import { ForgotPasswordComponent } from './profile/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './profile/reset-password/reset-password.component';
import { LockScreenComponent } from './profile/lock-screen/lock-screen.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { AddDepartmentComponent } from './add-department/add-department.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EmployeesComponent,
    DepartmentComponent,
    LeavesComponent,
    SalaryComponent,
    LoginComponent,
    ChartApexComponent,
    ReportCalendarComponent,
    NavBarComponent,
    TeamReportComponent,
    LeaveReportComponent,
    PayrollReportComponent,
    EmailReportComponent,
    SecurityReportComponent,
    WorkFromHomeReportComponent,
    ContactReportComponent,
    ChatComponent,
    NotesComponent,
    CalendarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    LockScreenComponent,
    ProfileComponent,
    AddDepartmentComponent,
    AddEmployeeComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
