import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})
export class VehicleComponent implements OnInit {

  vehicleForm!: FormGroup;

  vehicles: any[] = [];
  drivers: any[] = [];

  submitted: boolean = false;
  editing: boolean = false;
  editingId: number | null = null;

  successMessage: string = '';
  errorMessage: string = '';

  searchVehicleNumber: string = '';
  searchBrand: string = '';
  filterStatus: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', Validators.required],
      vehicleType: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      manufacturingYear: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      fuelType: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      status: ['Active', Validators.required]
    });

    this.loadVehicles();
    this.loadDrivers();
  }

  /* ✅ MAIN FIX */
  private showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.successMessage = message;
      this.errorMessage = '';
    } else {
      this.errorMessage = message;
      this.successMessage = '';
    }

    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  loadVehicles(): void {
    this.httpService.getAllVehicles().subscribe({
      next: (data: any[]) => {
        this.vehicles = data;
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to load vehicles.'),
          'error'
        );
      }
    });
  }

  loadDrivers(): void {
    this.httpService.getAllDrivers().subscribe({
      next: (data: any[]) => {
        this.drivers = data;
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to load drivers.'),
          'error'
        );
      }
    });
  }

  saveVehicle(): void {
    this.submitted = true;

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const vehiclePayload = {
      vehicleNumber: this.vehicleForm.value.vehicleNumber,
      vehicleType: this.vehicleForm.value.vehicleType,
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      manufacturingYear: Number(this.vehicleForm.value.manufacturingYear),
      fuelType: this.vehicleForm.value.fuelType,
      mileage: Number(this.vehicleForm.value.mileage),
      status: this.vehicleForm.value.status
    };

    if (this.editing && this.editingId !== null) {
      this.httpService.updateVehicle(this.editingId, vehiclePayload).subscribe({
        next: () => {
          this.showMessage('Vehicle updated successfully!', 'success');
          this.resetForm();
          this.loadVehicles();
        },
        error: (error: any) => {
          this.showMessage(
            this.extractErrorMessage(error, 'Failed to update vehicle.'),
            'error'
          );
        }
      });
    } else {
      this.httpService.addVehicle(vehiclePayload).subscribe({
        next: () => {
          this.showMessage('Vehicle added successfully!', 'success');
          this.resetForm();
          this.loadVehicles();
        },
        error: (error: any) => {
          this.showMessage(
            this.extractErrorMessage(error, 'Failed to add vehicle.'),
            'error'
          );
        }
      });
    }
  }

  editVehicle(vehicle: any): void {
    this.editing = true;
    this.editingId = vehicle.vehicleId;

    this.vehicleForm.patchValue({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      manufacturingYear: vehicle.manufacturingYear,
      fuelType: vehicle.fuelType,
      mileage: vehicle.mileage,
      status: vehicle.status
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteVehicle(id: number): void {
    if (!id) return;

    const confirmDelete = confirm('Are you sure you want to delete this vehicle?');
    if (!confirmDelete) return;

    this.httpService.deleteVehicle(id).subscribe({
      next: () => {
        this.showMessage('Vehicle deleted successfully!', 'success');
        this.loadVehicles();
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to delete vehicle.'),
          'error'
        );
      }
    });
  }

  searchByVehicleNumber(): void {
    if (!this.searchVehicleNumber.trim()) {
      this.loadVehicles();
      return;
    }

    this.httpService.searchVehicleByNumber(this.searchVehicleNumber.trim()).subscribe({
      next: (data: any) => {
        this.vehicles = data ? [data] : [];
      },
      error: (error: any) => {
        this.vehicles = [];
        this.showMessage(
          this.extractErrorMessage(error, 'No vehicle found with this number.'),
          'error'
        );
      }
    });
  }

  searchByBrand(): void {
    if (!this.searchBrand.trim()) {
      this.loadVehicles();
      return;
    }

    this.httpService.searchVehicleByBrand(this.searchBrand.trim()).subscribe({
      next: (data: any[]) => {
        this.vehicles = data;
      },
      error: (error: any) => {
        this.vehicles = [];
        this.showMessage(
          this.extractErrorMessage(error, 'No vehicles found for this brand.'),
          'error'
        );
      }
    });
  }

  filterByStatus(): void {
    if (!this.filterStatus) {
      this.loadVehicles();
      return;
    }

    this.httpService.filterVehicleByStatus(this.filterStatus).subscribe({
      next: (data: any[]) => {
        this.vehicles = data;
      },
      error: (error: any) => {
        this.vehicles = [];
        this.showMessage(
          this.extractErrorMessage(error, 'No vehicles found for selected status.'),
          'error'
        );
      }
    });
  }

  sortByYear(order: string): void {
    this.httpService.sortVehiclesByYear(order).subscribe({
      next: (data: any[]) => {
        this.vehicles = data;
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to sort vehicles by year.'),
          'error'
        );
      }
    });
  }

  sortByMileage(order: string): void {
    this.httpService.sortVehiclesByMileage(order).subscribe({
      next: (data: any[]) => {
        this.vehicles = data;
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to sort vehicles by mileage.'),
          'error'
        );
      }
    });
  }

  assignDriverToVehicle(vehicleId: number, event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (!vehicleId || !selectedValue) return;

    const driverId = Number(selectedValue);

    this.httpService.assignDriver(vehicleId, driverId).subscribe({
      next: () => {
        this.showMessage('Driver assigned successfully!', 'success');
        this.loadVehicles();
        this.loadDrivers();
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to assign driver.'),
          'error'
        );
      }
    });
  }

  resetFilters(): void {
    this.searchVehicleNumber = '';
    this.searchBrand = '';
    this.filterStatus = '';
    this.loadVehicles();
  }

  resetForm(): void {
    this.vehicleForm.reset({
      vehicleNumber: '',
      vehicleType: '',
      brand: '',
      model: '',
      manufacturingYear: '',
      fuelType: '',
      mileage: 0,
      status: 'Active'
    });

    this.submitted = false;
    this.editing = false;
    this.editingId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  isInvalid(controlName: string): boolean {
    const control = this.vehicleForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  getDriverName(vehicle: any): string {
    if (!vehicle || !vehicle.driver) return 'Not Assigned';
    return vehicle.driver.driverName || 'Not Assigned';
  }

  getAvailableDrivers(): any[] {
    return this.drivers.filter(driver => driver.availabilityStatus === 'Available');
  }

  private extractErrorMessage(error: any, defaultMessage: string): string {
    if (error?.error?.message) return error.error.message;
    if (error?.error?.error) return error.error.error;
    if (typeof error?.error === 'string') return error.error;
    if (error?.message) return error.message;
    return defaultMessage;
  }
}