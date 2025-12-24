package com.yamaha.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yamaha.dto.TaskDTO;
import com.yamaha.dto.TaskSummaryDTO;
import com.yamaha.entity.Task;
import com.yamaha.entity.TaskPriority;
import com.yamaha.entity.TaskStatus;
import com.yamaha.repository.TaskRepository;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public List<TaskDTO> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        System.out.println("=== GET ALL TASKS ===");
        System.out.println("Found " + tasks.size() + " tasks");
        
        tasks.forEach(task -> {
            System.out.println("Task: " + task.getTaskName() + 
                             " | Status: " + task.getStatus() + 
                             " | Status Class: " + (task.getStatus() != null ? task.getStatus().getClass() : "NULL"));
        });
        
        return tasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        System.out.println("=== GET TASK BY ID: " + id + " ===");
        System.out.println("Task: " + task.getTaskName() + " | Status: " + task.getStatus());
        
        return convertToDTO(task);
    }
    
    public TaskDTO createTask(TaskDTO taskDTO) {
        System.out.println("=== CREATE TASK ===");
        System.out.println("Input DTO Status: " + taskDTO.getStatus());
        System.out.println("Input DTO Status Class: " + (taskDTO.getStatus() != null ? taskDTO.getStatus().getClass() : "NULL"));
        
        if (taskDTO.getStatus() == null) {
            taskDTO.setStatus(TaskStatus.NOT_STARTED);
            System.out.println("Status was null, set to: " + TaskStatus.NOT_STARTED);
        }
        
        Task task = convertToEntity(taskDTO);
        Task saved = taskRepository.save(task);
        
        System.out.println("Saved Task Status: " + saved.getStatus());
        System.out.println("Saved Task Status Class: " + saved.getStatus().getClass());
        
        return convertToDTO(saved);
    }
    
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        System.out.println("=== UPDATE TASK: " + id + " ===");
        System.out.println("New Status: " + taskDTO.getStatus());
        
        Task existing = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        System.out.println("Existing Status: " + existing.getStatus());
        
        // Update fields
        existing.setTaskName(taskDTO.getTaskName());
        existing.setStartDate(taskDTO.getStartDate());
        existing.setEndDate(taskDTO.getEndDate());
        existing.setResponsible(taskDTO.getResponsible());
        
        if (taskDTO.getStatus() != null) {
            existing.setStatus(taskDTO.getStatus());
            System.out.println("Status updated to: " + existing.getStatus());
        }
        
        existing.setRemarks(taskDTO.getRemarks());
        existing.setPriority(taskDTO.getPriority());
        existing.setCategory(taskDTO.getCategory());
        existing.setEstimatedHours(taskDTO.getEstimatedHours());
        existing.setActualHours(taskDTO.getActualHours());
        existing.setCompletionPercentage(taskDTO.getCompletionPercentage());
        existing.setDepartment(taskDTO.getDepartment());
        existing.setIsCritical(taskDTO.getIsCritical());
        
        Task updated = taskRepository.save(existing);
        System.out.println("Final Status after save: " + updated.getStatus());
        
        return convertToDTO(updated);
    }
    
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }
    
    public TaskSummaryDTO getTaskSummary() {
        System.out.println("=== GET TASK SUMMARY ===");
        
        long total = taskRepository.count();
        long completed = taskRepository.countByStatus(TaskStatus.COMPLETED);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long onHold = taskRepository.countByStatus(TaskStatus.HOLD);
        long notStarted = taskRepository.countByStatus(TaskStatus.NOT_STARTED);
        
        System.out.println("Total: " + total);
        System.out.println("Completed: " + completed);
        System.out.println("In Progress: " + inProgress);
        System.out.println("On Hold: " + onHold);
        System.out.println("Not Started: " + notStarted);
        
        // Debug: Check what countByStatus returns for each status
        for (TaskStatus status : TaskStatus.values()) {
            Long count = taskRepository.countByStatus(status);
            System.out.println("Count for " + status + ": " + count);
        }
        
        return new TaskSummaryDTO(total, completed, inProgress, onHold, notStarted);
    }
    
    public void initializeSampleData() {
        if (taskRepository.count() == 0) {
            System.out.println("=== INITIALIZING SAMPLE DATA ===");
            
            // Create sample tasks with different statuses
            Task[] sampleTasks = {
                createSampleTask("Cable Installation", "Operator A", TaskStatus.NOT_STARTED, TaskPriority.HIGH, "Electrical"),
                createSampleTask("UPS Setup", "Operator B", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, "Electrical"),
                createSampleTask("Monitor Setup", "Operator C", TaskStatus.COMPLETED, TaskPriority.LOW, "IT"),
                createSampleTask("PC Installation", "Operator D", TaskStatus.HOLD, TaskPriority.MEDIUM, "IT")
            };
            
            for (Task task : sampleTasks) {
                Task saved = taskRepository.save(task);
                System.out.println("Initialized task: " + saved.getTaskName() + " with status: " + saved.getStatus());
            }
            
            System.out.println("Sample data initialization complete");
        } else {
            System.out.println("Database already contains " + taskRepository.count() + " tasks");
        }
    }
    
    private Task createSampleTask(String name, String responsible, TaskStatus status, TaskPriority priority, String category) {
        Task task = new Task(name, responsible, status, "Sample task");
        task.setPriority(priority);
        task.setCategory(category);
        task.setEstimatedHours(8);
        task.setCompletionPercentage(status == TaskStatus.COMPLETED ? 100 : 
                                   status == TaskStatus.IN_PROGRESS ? 50 : 0);
        task.setDepartment(category.equals("IT") ? "IT" : "Production");
        task.setIsCritical(priority == TaskPriority.HIGH);
        return task;
    }
    
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTaskName(task.getTaskName());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setResponsible(task.getResponsible());
        dto.setStatus(task.getStatus());
        dto.setRemarks(task.getRemarks());
        
        dto.setPriority(task.getPriority());
        dto.setCategory(task.getCategory());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setActualHours(task.getActualHours());
        dto.setCompletionPercentage(task.getCompletionPercentage());
        dto.setDepartment(task.getDepartment());
        dto.setIsCritical(task.getIsCritical());
        
        return dto;
    }
    
    private Task convertToEntity(TaskDTO dto) {
        Task task = new Task();
        task.setTaskName(dto.getTaskName());
        task.setStartDate(dto.getStartDate());
        task.setEndDate(dto.getEndDate());
        task.setResponsible(dto.getResponsible());
        task.setStatus(dto.getStatus());
        task.setRemarks(dto.getRemarks());
        
        task.setPriority(dto.getPriority());
        task.setCategory(dto.getCategory());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setActualHours(dto.getActualHours());
        task.setCompletionPercentage(dto.getCompletionPercentage());
        task.setDepartment(dto.getDepartment());
        task.setIsCritical(dto.getIsCritical());
        
        return task;
    }
}