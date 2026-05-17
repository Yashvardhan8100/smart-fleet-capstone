package com.edutech.dto;

import java.time.LocalDate;

public class InsuranceDTO {

     private Long insuranceId;
     private String providerName;
     private String policyNumber;
     private LocalDate startDate;
     private LocalDate endDate;
     private double premiumAmount;
     private String coverageType;

     private Long vehicleId;
     private String vehicleNumber;

     // ✅ ADD THESE
     private String brand;
     private String model;

     public InsuranceDTO() {
     }

     public Long getInsuranceId() {
          return insuranceId;
     }

     public void setInsuranceId(Long id) {
          this.insuranceId = id;
     }

     public String getProviderName() {
          return providerName;
     }

     public void setProviderName(String n) {
          this.providerName = n;
     }

     public String getPolicyNumber() {
          return policyNumber;
     }

     public void setPolicyNumber(String p) {
          this.policyNumber = p;
     }

     public LocalDate getStartDate() {
          return startDate;
     }

     public void setStartDate(LocalDate d) {
          this.startDate = d;
     }

     public LocalDate getEndDate() {
          return endDate;
     }

     public void setEndDate(LocalDate d) {
          this.endDate = d;
     }

     public double getPremiumAmount() {
          return premiumAmount;
     }

     public void setPremiumAmount(double a) {
          this.premiumAmount = a;
     }

     public String getCoverageType() {
          return coverageType;
     }

     public void setCoverageType(String t) {
          this.coverageType = t;
     }

     public Long getVehicleId() {
          return vehicleId;
     }

     public void setVehicleId(Long id) {
          this.vehicleId = id;
     }

     public String getVehicleNumber() {
          return vehicleNumber;
     }

     public void setVehicleNumber(String n) {
          this.vehicleNumber = n;
     }

     // ✅ NEW
     public String getBrand() {
          return brand;
     }

     public void setBrand(String brand) {
          this.brand = brand;
     }

     public String getModel() {
          return model;
     }

     public void setModel(String model) {
          this.model = model;
     }
}
