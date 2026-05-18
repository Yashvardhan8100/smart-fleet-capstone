package com.edutech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.entity.Vehicle;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // ✅ Find by exact vehicle number
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    // ✅ Check if vehicle number exists
    boolean existsByVehicleNumber(String vehicleNumber);

    // ✅ Search by brand (case-insensitive)
    List<Vehicle> findByBrandIgnoreCaseContaining(String brand);

    // ✅ Filter by status
    List<Vehicle> findByStatus(String status);

    // ✅ Sort by manufacturing year ascending
    List<Vehicle> findAllByOrderByManufacturingYearAsc();

    // ✅ Sort by manufacturing year descending
    List<Vehicle> findAllByOrderByManufacturingYearDesc();

    // ✅ Sort by mileage ascending
    List<Vehicle> findAllByOrderByMileageAsc();

    // ✅ Sort by mileage descending
    List<Vehicle> findAllByOrderByMileageDesc();

    // ✅ ✅ ✅ CRITICAL FIX (Relationship handling)
    // Find all vehicles assigned to a specific driver
    List<Vehicle> findByDriverDriverId(Long driverId);
}