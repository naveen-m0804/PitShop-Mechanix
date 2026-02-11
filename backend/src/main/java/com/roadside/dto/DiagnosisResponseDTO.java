package com.roadside.dto;

public class DiagnosisResponseDTO {
    private String diagnosis;
    private String recommendedAction;
    private Double confidenceScore;

    public DiagnosisResponseDTO() {}

    public DiagnosisResponseDTO(String diagnosis, String recommendedAction, Double confidenceScore) {
        this.diagnosis = diagnosis;
        this.recommendedAction = recommendedAction;
        this.confidenceScore = confidenceScore;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    private java.util.List<String> clarifyingQuestions;

    public java.util.List<String> getClarifyingQuestions() {
        return clarifyingQuestions;
    }

    public void setClarifyingQuestions(java.util.List<String> clarifyingQuestions) {
        this.clarifyingQuestions = clarifyingQuestions;
    }
}
