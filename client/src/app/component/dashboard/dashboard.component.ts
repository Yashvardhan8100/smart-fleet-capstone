import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  totalVehicles: number = 0;
  activeVehicles: number = 0;
  inactiveVehicles: number = 0;
  underServiceVehicles: number = 0;

  totalDrivers: number = 0;
  availableDrivers: number = 0;
  assignedDrivers: number = 0;

  totalMaintenanceRecords: number = 0;
  upcomingServices: number = 0;

  totalInsuranceRecords: number = 0;
  insuranceExpiryAlerts: number = 0;

  errorMessage: string = '';

  role: string | null = '';
  username: string | null = '';

  // ✅ NEW — Driver status toggle
  driverStatus: string = 'Available';
  driverStatusMessage: string = '';
  driverStatusError: string = '';
  currentDate: string = '';
  currentTime: string = '';

  constructor(
    private httpService: HttpService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.username = this.authService.getUsername();
    this.updateClock();
    this.loadDashboardData();

    // Update clock every second
    setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  updateClock(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.currentTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  loadDashboardData(): void {
    if (this.role === 'ADMIN') {
      this.loadVehicleSummary();
      this.loadDriverSummary();
      this.loadMaintenanceSummary();
      this.loadInsuranceSummary();
    }

    if (this.role === 'FLEET_MANAGER') {
      this.loadVehicleSummary();
      this.loadDriverSummary();
    }

    if (this.role === 'MECHANIC') {
      this.loadMaintenanceSummary();
    }

    // DRIVER → no API calls needed for summary
  }

  loadVehicleSummary(): void {
    this.httpService.getAllVehicles().subscribe({
      next: (vehicles: any[]) => {
        this.totalVehicles = vehicles.length;

        this.activeVehicles = vehicles.filter(
          vehicle => vehicle.status === 'Active'
        ).length;

        this.inactiveVehicles = vehicles.filter(
          vehicle => vehicle.status === 'Inactive'
        ).length;

        this.underServiceVehicles = vehicles.filter(
          vehicle => vehicle.status === 'Under Service'
        ).length;
      },
      error: () => {
        this.errorMessage = 'Failed to load vehicle summary';
      }
    });
  }

  loadDriverSummary(): void {
    this.httpService.getAllDrivers().subscribe({
      next: (drivers: any[]) => {
        this.totalDrivers = drivers.length;

        this.availableDrivers = drivers.filter(
          driver => driver.availabilityStatus === 'Available'
        ).length;

        this.assignedDrivers = drivers.filter(
          driver => driver.availabilityStatus === 'Assigned'
        ).length;
      },
      error: () => {
        this.errorMessage = 'Failed to load driver summary';
      }
    });
  }

  loadMaintenanceSummary(): void {
    this.httpService.getAllMaintenance().subscribe({
      next: (records: any[]) => {
        this.totalMaintenanceRecords = records.length;

        this.upcomingServices = records.filter(record =>
          this.isWithinNext30Days(record.nextServiceDate)
        ).length;
      },
      error: () => {
        this.errorMessage = 'Failed to load maintenance summary';
      }
    });
  }

  loadInsuranceSummary(): void {
    this.httpService.getAllInsurance().subscribe({
      next: (records: any[]) => {
        this.totalInsuranceRecords = records.length;

        this.insuranceExpiryAlerts = records.filter(record =>
          this.isWithinNext30Days(record.endDate)
        ).length;
      },
      error: () => {
        this.errorMessage = 'Failed to load insurance summary';
      }
    });
  }

  // ✅ NEW — Driver toggles own status
  toggleDriverStatus(): void {
    this.driverStatusMessage = '';
    this.driverStatusError = '';

    if (!this.username) {
      this.driverStatusError = 'Username not found. Please re-login.';
      return;
    }

    // ✅ FIX — Send the SELECTED status directly, don't flip it
    this.httpService.updateDriverStatus(this.username, this.driverStatus).subscribe({
      next: (response: any) => {
        this.driverStatusMessage = 'Status updated to ' + this.driverStatus + '!';

        setTimeout(() => {
          this.driverStatusMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        if (error?.error?.message) {
          this.driverStatusError = error.error.message;
        } else {
          this.driverStatusError = 'Failed to update status. Make sure your username matches your driver name.';
        }

        setTimeout(() => {
          this.driverStatusError = '';
        }, 5000);
      }
    });
  }
  
  isWithinNext30Days(dateValue: string | undefined | null): boolean {
    if (!dateValue) {
      return false;
    }

    const today = new Date();
    const targetDate = new Date(dateValue);

    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const differenceInTime = targetDate.getTime() - today.getTime();
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

    return differenceInDays >= 0 && differenceInDays <= 30;
  }
}