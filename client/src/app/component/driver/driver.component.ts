import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {

  driverForm!: FormGroup;

  drivers: any[] = [];

  submitted: boolean = false;
  editing: boolean = false;
  editingId: number | null = null;

  successMessage: string = '';
  errorMessage: string = '';

  searchName: string = '';
  filterStatus: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.driverForm = this.fb.group({
      driverName: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      address: ['', Validators.required],
      availabilityStatus: ['Available', Validators.required]
    });

    this.loadDrivers();
  }

  /* ✅ NEW METHOD (MAIN FIX) */
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

  saveDriver(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const driverPayload = {
      driverName: this.driverForm.value.driverName,
      licenseNumber: this.driverForm.value.licenseNumber,
      phoneNumber: this.driverForm.value.phoneNumber,
      experienceYears: Number(this.driverForm.value.experienceYears),
      address: this.driverForm.value.address,
      availabilityStatus: this.driverForm.value.availabilityStatus
    };

    if (this.editing && this.editingId !== null) {
      this.httpService.updateDriver(this.editingId, driverPayload).subscribe({
        next: () => {
          this.showMessage('Driver updated successfully!', 'success');
          this.resetForm();
          this.loadDrivers();
        },
        error: (error: any) => {
          this.showMessage(
            this.extractErrorMessage(error, 'Failed to update driver.'),
            'error'
          );
        }
      });
    } else {
      this.httpService.addDriver(driverPayload).subscribe({
        next: () => {
          this.showMessage('Driver added successfully!', 'success');
          this.resetForm();
          this.loadDrivers();
        },
        error: (error: any) => {
          this.showMessage(
            this.extractErrorMessage(error, 'Failed to add driver.'),
            'error'
          );
        }
      });
    }
  }

  editDriver(driver: any): void {
    this.editing = true;
    this.editingId = driver.driverId;

    this.successMessage = '';
    this.errorMessage = '';

    this.driverForm.patchValue({
      driverName: driver.driverName,
      licenseNumber: driver.licenseNumber,
      phoneNumber: driver.phoneNumber,
      experienceYears: driver.experienceYears,
      address: driver.address,
      availabilityStatus: driver.availabilityStatus
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteDriver(id: number): void {
    if (!id) return;

    const confirmDelete = confirm('Are you sure you want to delete this driver?');
    if (!confirmDelete) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.httpService.deleteDriver(id).subscribe({
      next: () => {
        this.showMessage('Driver deleted successfully!', 'success');
        this.loadDrivers();
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to delete driver.'),
          'error'
        );
      }
    });
  }

  searchByName(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.searchName.trim()) {
      this.loadDrivers();
      return;
    }

    this.httpService.searchDriverByName(this.searchName.trim()).subscribe({
      next: (data: any[]) => {
        this.drivers = data;
      },
      error: (error: any) => {
        this.drivers = [];
        this.showMessage(
          this.extractErrorMessage(error, 'No drivers found.'),
          'error'
        );
      }
    });
  }

  filterByAvailability(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.filterStatus) {
      this.loadDrivers();
      return;
    }

    this.httpService.filterDriverByAvailability(this.filterStatus).subscribe({
      next: (data: any[]) => {
        this.drivers = data;
      },
      error: (error: any) => {
        this.drivers = [];
        this.showMessage(
          this.extractErrorMessage(error, 'No drivers found for selected availability.'),
          'error'
        );
      }
    });
  }

  sortByExperience(order: string): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.httpService.sortDriversByExperience(order).subscribe({
      next: (data: any[]) => {
        this.drivers = data;
      },
      error: (error: any) => {
        this.showMessage(
          this.extractErrorMessage(error, 'Failed to sort drivers.'),
          'error'
        );
      }
    });
  }

  resetFilters(): void {
    this.searchName = '';
    this.filterStatus = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.loadDrivers();
  }

  resetForm(): void {
    this.driverForm.reset({
      driverName: '',
      licenseNumber: '',
      phoneNumber: '',
      experienceYears: 0,
      address: '',
      availabilityStatus: 'Available'
    });

    this.submitted = false;
    this.editing = false;
    this.editingId = null;
  }

  cancelEdit(): void {
    this.resetForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  isInvalid(controlName: string): boolean {
    const control = this.driverForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted)
    );
  }

  private extractErrorMessage(error: any, defaultMessage: string): string {
    if (error?.error?.message) return error.error.message;
    if (error?.error?.error) return error.error.error;
    if (typeof error?.error === 'string') return error.error;
    if (error?.message) return error.message;
    return defaultMessage;
  }
}