package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.dto.InsuranceDTO;
import com.edutech.entity.Insurance;
import com.edutech.entity.Vehicle;
import com.edutech.exception.DuplicateResourceException;
import com.edutech.exception.InvalidDataException;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.InsuranceRepository;
import com.edutech.repository.VehicleRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsuranceService {

    @Autowired
    private InsuranceRepository insuranceRepo;

    @Autowired
    private VehicleRepository vehicleRepo;

    // Entity -> DTO mapper
    private InsuranceDTO mapToDTO(Insurance i) {
        InsuranceDTO dto = new InsuranceDTO();

        dto.setInsuranceId(i.getInsuranceId());
        dto.setProviderName(i.getProviderName());
        dto.setPolicyNumber(i.getPolicyNumber());
        dto.setStartDate(i.getStartDate());
        dto.setEndDate(i.getEndDate());
        dto.setPremiumAmount(i.getPremiumAmount());
        dto.setCoverageType(i.getCoverageType());

        if (i.getVehicle() != null) {
            dto.setVehicleId(i.getVehicle().getVehicleId());
            dto.setVehicleNumber(i.getVehicle().getVehicleNumber());
            dto.setBrand(i.getVehicle().getBrand());
            dto.setModel(i.getVehicle().getModel());
        }

        return dto;
    }

    /**
     * ✅ POST /api/insurance?vehicleId=
     */
    public InsuranceDTO addInsurance(Insurance insurance, Long vehicleId) {

        Vehicle v = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // ✅ CHECK: one vehicle = one insurance only
        if (insuranceRepo.existsByVehicle(v)) {
            throw new DuplicateResourceException(
                    "This vehicle already has an insurance record. Please update instead.");
        }

        // duplicate policy check
        if (insuranceRepo.existsByPolicyNumber(insurance.getPolicyNumber())) {
            throw new DuplicateResourceException("policyNumber already exists");
        }

        // validate endDate >= startDate
        if (insurance.getStartDate() != null && insurance.getEndDate() != null
                && insurance.getEndDate().isBefore(insurance.getStartDate())) {
            throw new InvalidDataException("endDate must be after startDate");
        }

        insurance.setVehicle(v);
        return mapToDTO(insuranceRepo.save(insurance));
    }

    /**
     * ✅ GET /api/insurance
     */
    public List<InsuranceDTO> getAllInsurance() {
        return insuranceRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ GET /api/insurance/{id}
     */
    public InsuranceDTO getInsuranceById(Long id) {
        Insurance i = insuranceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found"));
        return mapToDTO(i);
    }

    /**
     * ✅ PUT /api/insurance/{id}?vehicleId=
     */
    public InsuranceDTO updateInsurance(Long id, Insurance updated, Long vehicleId) {

        Insurance existing = insuranceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found"));

        Vehicle v = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // ✅ CHECK: if vehicle changed, ensure new vehicle doesn't already have insurance
        if (!existing.getVehicle().getVehicleId().equals(vehicleId)) {
            if (insuranceRepo.existsByVehicle(v)) {
                throw new DuplicateResourceException(
                        "This vehicle already has an insurance record.");
            }
        }

        // if policy number changed, ensure uniqueness
        if (updated.getPolicyNumber() != null &&
                !updated.getPolicyNumber().equals(existing.getPolicyNumber())) {

            if (insuranceRepo.existsByPolicyNumber(updated.getPolicyNumber())) {
                throw new DuplicateResourceException("policyNumber already exists");
            }
        }

        // validate endDate >= startDate
        if (updated.getStartDate() != null && updated.getEndDate() != null
                && updated.getEndDate().isBefore(updated.getStartDate())) {
            throw new InvalidDataException("endDate must be after startDate");
        }

        existing.setProviderName(updated.getProviderName());
        existing.setPolicyNumber(updated.getPolicyNumber());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setPremiumAmount(updated.getPremiumAmount());
        existing.setCoverageType(updated.getCoverageType());
        existing.setVehicle(v);

        return mapToDTO(insuranceRepo.save(existing));
    }

    /**
     * ✅ DELETE /api/insurance/{id}
     */
    public void deleteInsurance(Long id) {
        Insurance i = insuranceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found"));
        insuranceRepo.delete(i);
    }

    /**
     * ✅ GET /api/insurance/search?providerName=
     */
    public List<InsuranceDTO> searchByProviderName(String providerName) {
        return insuranceRepo.findByProviderNameIgnoreCase(providerName)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ GET /api/insurance/filter/coverage?coverageType=
     */
    public List<InsuranceDTO> filterByCoverageType(String coverageType) {
        return insuranceRepo.findByCoverageType(coverageType)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ GET /api/insurance/sort/premium?order=asc|desc
     */
    public List<InsuranceDTO> sortByPremiumAmount(String order) {
        List<Insurance> list = "desc".equalsIgnoreCase(order)
                ? insuranceRepo.findAllSortedByPremiumDesc()
                : insuranceRepo.findAllSortedByPremiumAsc();

        return list.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * ✅ (Optional) Get insurance by vehicle
     */
    public List<InsuranceDTO> getByVehicleId(Long vehicleId) {
        return insuranceRepo.findByVehicleId(vehicleId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}