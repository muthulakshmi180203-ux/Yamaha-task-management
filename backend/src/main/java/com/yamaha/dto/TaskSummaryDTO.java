package com.yamaha.dto;

public class TaskSummaryDTO {
    private Long totalTasks;
    private Long completedTasks;
    private Long inProgressTasks;
    private Long onHoldTasks;
    private Long notStartedTasks;
    
    public TaskSummaryDTO() {}
    
    public TaskSummaryDTO(Long totalTasks, Long completedTasks, Long inProgressTasks, Long onHoldTasks, Long notStartedTasks) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.inProgressTasks = inProgressTasks;
        this.onHoldTasks = onHoldTasks;
        this.notStartedTasks = notStartedTasks;
    }
    
    // Getters and Setters
    public Long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(Long totalTasks) { this.totalTasks = totalTasks; }
    
    public Long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(Long completedTasks) { this.completedTasks = completedTasks; }
    
    public Long getInProgressTasks() { return inProgressTasks; }
    public void setInProgressTasks(Long inProgressTasks) { this.inProgressTasks = inProgressTasks; }
    
    public Long getOnHoldTasks() { return onHoldTasks; }
    public void setOnHoldTasks(Long onHoldTasks) { this.onHoldTasks = onHoldTasks; }
    
    public Long getNotStartedTasks() { return notStartedTasks; }
    public void setNotStartedTasks(Long notStartedTasks) { this.notStartedTasks = notStartedTasks; }
}