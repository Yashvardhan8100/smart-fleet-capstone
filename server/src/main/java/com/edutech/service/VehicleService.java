package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.dto.VehicleDTO;
import com.edutech.entity.Driver;
import com.edutech.entity.Vehicle;
import com.edutech.exception.DuplicateResourceException;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.DriverRepository;
import com.edutech.repository.VehicleRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    // ✅ MAP ENTITY TO DTO
    private VehicleDTO mapToDTO(Vehicle v) {
        VehicleDTO dto = new VehicleDTO();

        dto.setVehicleId(v.getVehicleId());
        dto.setVehicleNumber(v.getVehicleNumber());
        dto.setVehicleType(v.getVehicleType());
        dto.setBrand(v.getBrand());
        dto.setModel(v.getModel());
        dto.setManufacturingYear(v.getManufacturingYear());
        dto.setFuelType(v.getFuelType());
        dto.setMileage(v.getMileage());
        dto.setStatus(v.getStatus());

        if (v.getDriver() != null) {
            dto.setDriverId(v.getDriver().getDriverId());
            dto.setDriverName(v.getDriver().getDriverName());
        }

        return dto;
    }

    // ✅ ADD VEHICLE
    public VehicleDTO addVehicle(Vehicle vehicle) {
        if (vehicleRepository.existsByVehicleNumber(vehicle.getVehicleNumber())) {
            throw new DuplicateResourceException("vehicleNumber already exists");
        }
        return mapToDTO(vehicleRepository.save(vehicle));
    }

    // ✅ GET ALL
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // ✅ GET BY ID
    public VehicleDTO getVehicleById(Long id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return mapToDTO(v);
    }

    // ✅ UPDATE
    public VehicleDTO updateVehicle(Long id, Vehicle updated) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!v.getVehicleNumber().equals(updated.getVehicleNumber()) &&
                vehicleRepository.existsByVehicleNumber(updated.getVehicleNumber())) {
            throw new DuplicateResourceException("vehicleNumber already exists");
        }

        v.setVehicleNumber(updated.getVehicleNumber());
        v.setVehicleType(updated.getVehicleType());
        v.setBrand(updated.getBrand());
        v.setModel(updated.getModel());
        v.setManufacturingYear(updated.getManufacturingYear());
        v.setFuelType(updated.getFuelType());
        v.setMileage(updated.getMileage());
        v.setStatus(updated.getStatus());

        return mapToDTO(vehicleRepository.save(v));
    }

    // ✅ DELETE
    public void deleteVehicle(Long id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        vehicleRepository.delete(v);
    }

    // ✅ SEARCH
    public VehicleDTO searchByVehicleNumber(String num) {
        Vehicle v = vehicleRepository.findByVehicleNumber(num)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        return mapToDTO(v);
    }

    public List<VehicleDTO> searchByBrand(String brand) {
        return vehicleRepository.findByBrandIgnoreCaseContaining(brand)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<VehicleDTO> filterByStatus(String status) {
        return vehicleRepository.findByStatus(status)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // ✅ SORT
    public List<VehicleDTO> sortByManufacturingYear(String order) {
        List<Vehicle> list = "desc".equalsIgnoreCase(order)
                ? vehicleRepository.findAllByOrderByManufacturingYearDesc()
                : vehicleRepository.findAllByOrderByManufacturingYearAsc();

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<VehicleDTO> sortByMileage(String order) {
        List<Vehicle> list = "desc".equalsIgnoreCase(order)
                ? vehicleRepository.findAllByOrderByMileageDesc()
                : vehicleRepository.findAllByOrderByMileageAsc();

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // ✅ ✅ FINAL DRIVER ASSIGN LOGIC
    public VehicleDTO assignDriver(Long vehicleId, Long driverId) {

        Vehicle v = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        Driver d = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // ✅ prevent double assignment
        if (!"Available".equalsIgnoreCase(d.getAvailabilityStatus())) {
            throw new RuntimeException("Driver already assigned");
        }

        v.setDriver(d);
        v.setStatus("Active");

        d.setAvailabilityStatus("Assigned");

        vehicleRepository.save(v);
        driverRepository.save(d);

        return mapToDTO(v);
    }
}