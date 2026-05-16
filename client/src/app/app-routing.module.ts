import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { VehicleComponent } from './component/vehicle/vehicle.component';
import { DriverComponent } from './component/driver/driver.component';
import { MaintenanceComponent } from './component/maintenance/maintenance.component';
import { InsuranceComponent } from './component/insurance/insurance.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'vehicles',
    component: VehicleComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FLEET_MANAGER'] }
  },

  {
    path: 'drivers',
    component: DriverComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'FLEET_MANAGER'] }
  },

  {
    path: 'maintenance',
    component: MaintenanceComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MECHANIC'] }
  },

  {
    path: 'insurance',
    component: InsuranceComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }