package com.edutech.dto;

import java.time.LocalDate;

public class MaintenanceRecordDTO {

     private Long maintenanceId;
     private LocalDate serviceDate;
     private String serviceType;
     private String serviceCenter;
     private double serviceCost;
     private LocalDate nextServiceDate;
     private String remarks;

     private Long vehicleId;
     private String vehicleNumber;

     // ✅ ADD THESE
     private String brand;
     private String model;

     public MaintenanceRecordDTO() {
     }

     public Long getMaintenanceId() {
          return maintenanceId;
     }

     public void setMaintenanceId(Long maintenanceId) {
          this.maintenanceId = maintenanceId;
     }

     public LocalDate getServiceDate() {
          return serviceDate;
     }

     public void setServiceDate(LocalDate serviceDate) {
          this.serviceDate = serviceDate;
     }

     public String getServiceType() {
          return serviceType;
     }

     public void setServiceType(String serviceType) {
          this.serviceType = serviceType;
     }

     public String getServiceCenter() {
          return serviceCenter;
     }

     public void setServiceCenter(String serviceCenter) {
          this.serviceCenter = serviceCenter;
     }

     public double getServiceCost() {
          return serviceCost;
     }

     public void setServiceCost(double serviceCost) {
          this.serviceCost = serviceCost;
     }

     public LocalDate getNextServiceDate() {
          return nextServiceDate;
     }

     public void setNextServiceDate(LocalDate nextServiceDate) {
          this.nextServiceDate = nextServiceDate;
     }

     public String getRemarks() {
          return remarks;
     }

     public void setRemarks(String remarks) {
          this.remarks = remarks;
     }

     public Long getVehicleId() {
          return vehicleId;
     }

     public void setVehicleId(Long vehicleId) {
          this.vehicleId = vehicleId;
     }

     public String getVehicleNumber() {
          return vehicleNumber;
     }

     public void setVehicleNumber(String vehicleNumber) {
          this.vehicleNumber = vehicleNumber;
     }

     // ✅ NEW GETTERS/SETTERS
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
