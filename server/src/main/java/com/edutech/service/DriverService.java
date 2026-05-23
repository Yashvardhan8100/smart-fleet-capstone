package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.dto.DriverDTO;
import com.edutech.entity.Driver;
import com.edutech.entity.Vehicle;
import com.edutech.exception.DuplicateResourceException;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.DriverRepository;
import com.edutech.repository.VehicleRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    // ✅ ENTITY → DTO
    private DriverDTO mapToDTO(Driver d) {
        DriverDTO dto = new DriverDTO();

        dto.setDriverId(d.getDriverId());
        dto.setDriverName(d.getDriverName());
        dto.setLicenseNumber(d.getLicenseNumber());
        dto.setPhoneNumber(d.getPhoneNumber());
        dto.setExperienceYears(d.getExperienceYears());
        dto.setAddress(d.getAddress());
        dto.setAvailabilityStatus(d.getAvailabilityStatus());

        return dto;
    }

    // ✅ ADD DRIVER
    public DriverDTO addDriver(Driver driver) {

        if (driverRepository.existsByLicenseNumber(driver.getLicenseNumber())) {
            throw new DuplicateResourceException("licenseNumber already exists");
        }

        return mapToDTO(driverRepository.save(driver));
    }

    // ✅ GET ALL
    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ✅ GET BY ID
    public DriverDTO getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        return mapToDTO(driver);
    }

    // ✅ ✅ ✅ UPDATE DRIVER (FINAL FIXED VERSION)
    public DriverDTO updateDriver(Long id, Driver updated) {

        Driver existing = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // ✅ duplicate check
        if (!existing.getLicenseNumber().equals(updated.getLicenseNumber())) {
            if (driverRepository.existsByLicenseNumber(updated.getLicenseNumber())) {
                throw new DuplicateResourceException("licenseNumber already exists");
            }
        }

        // ✅ update fields
        existing.setDriverName(updated.getDriverName());
        existing.setLicenseNumber(updated.getLicenseNumber());
        existing.setPhoneNumber(updated.getPhoneNumber());
        existing.setExperienceYears(updated.getExperienceYears());
        existing.setAddress(updated.getAddress());

        String newStatus = updated.getAvailabilityStatus();
        existing.setAvailabilityStatus(newStatus);

        // ✅ ✅ ✅ CRITICAL LOGIC: AUTO-UNASSIGN FROM VEHICLE
        if ("Available".equalsIgnoreCase(newStatus)) {

            List<Vehicle> vehicles = vehicleRepository.findByDriverDriverId(id);

            for (Vehicle v : vehicles) {
                v.setDriver(null); // ✅ remove driver
            }

            vehicleRepository.saveAll(vehicles);
        }

        return mapToDTO(driverRepository.save(existing));
    }

    // ✅ DELETE DRIVER
    public void deleteDriver(Long id) {

        Driver d = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        driverRepository.delete(d);
    }

    // ✅ SEARCH BY NAME
    public List<DriverDTO> searchByName(String name) {
        return driverRepository.findByNameIgnoreCase(name)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ✅ FILTER BY AVAILABILITY
    public List<DriverDTO> filterByAvailability(String status) {
        return driverRepository.findByAvailabilityStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ✅ SORT BY EXPERIENCE
    public List<DriverDTO> sortByExperience(String order) {

        List<Driver> list;

        if ("desc".equalsIgnoreCase(order)) {
            list = driverRepository.findAllSortedByExperienceDesc();
        } else {
            list = driverRepository.findAllSortedByExperienceAsc();
        }

        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ✅ ✅ ✅ UPDATE DRIVER STATUS BY NAME (ALSO FIXED)
    public DriverDTO updateStatusByName(String driverName, String status) {

        List<Driver> drivers = driverRepository.findByNameIgnoreCase(driverName);

        if (drivers.isEmpty()) {
            throw new ResourceNotFoundException("Driver not found");
        }

        Driver driver = drivers.get(0);
        driver.setAvailabilityStatus(status);

        // ✅ SAME AUTO-UNASSIGN LOGIC
        if ("Available".equalsIgnoreCase(status)) {

            List<Vehicle> vehicles = vehicleRepository.findByDriverDriverId(driver.getDriverId());

            for (Vehicle v : vehicles) {
                v.setDriver(null);
            }

            vehicleRepository.saveAll(vehicles);
        }

        return mapToDTO(driverRepository.save(driver));
    }

    public DriverDTO updateProfileByName(String driverName, Driver updated) {
        List<Driver> drivers = driverRepository.findByNameIgnoreCase(driverName);
        if (drivers.isEmpty())
            throw new ResourceNotFoundException("Driver not found");

        Driver driver = drivers.get(0);

        // Only allow safe fields — driver cannot change their own licenseNumber
        driver.setAddress(updated.getAddress());
        driver.setPhoneNumber(updated.getPhoneNumber());

        return mapToDTO(driverRepository.save(driver));
    }

}
