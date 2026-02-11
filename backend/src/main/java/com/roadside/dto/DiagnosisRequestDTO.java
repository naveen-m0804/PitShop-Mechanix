package com.roadside.dto;

public class DiagnosisRequestDTO {
    private String issueDescription;
    private String make;
    private String model;
    private Integer year;

    public DiagnosisRequestDTO() {}

    public DiagnosisRequestDTO(String issueDescription, String make, String model, Integer year) {
        this.issueDescription = issueDescription;
        this.make = make;
        this.model = model;
        this.year = year;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }
}
