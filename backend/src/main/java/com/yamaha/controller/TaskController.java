package com.yamaha.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yamaha.dto.TaskDTO;
import com.yamaha.dto.TaskSummaryDTO;
import com.yamaha.entity.TaskPriority;
import com.yamaha.entity.TaskStatus;
import com.yamaha.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping
    public List<TaskDTO> getAllTasks() {
        return taskService.getAllTasks();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        try {
            TaskDTO task = taskService.getTaskById(id);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public TaskDTO createTask(@RequestBody TaskDTO taskDTO) {
        return taskService.createTask(taskDTO);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        try {
            TaskDTO updated = taskService.updateTask(id, taskDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/summary")
    public TaskSummaryDTO getTaskSummary() {
        return taskService.getTaskSummary();
    }
    
    @PostMapping("/initialize")
    public String initializeData() {
        taskService.initializeSampleData();
        return "Sample data initialized successfully";
    }
    
    @PostMapping("/create")
    public ResponseEntity<TaskDTO> createNewTask(@RequestBody TaskDTO taskDTO) {
        try {
            // Set default values for new tasks
            if (taskDTO.getStatus() == null) {
                taskDTO.setStatus(TaskStatus.NOT_STARTED);
            }
            if (taskDTO.getPriority() == null) {
                taskDTO.setPriority(TaskPriority.MEDIUM);
            }
            if (taskDTO.getDepartment() == null) {
                taskDTO.setDepartment("Production");
            }
            if (taskDTO.getIsCritical() == null) {
                taskDTO.setIsCritical(false);
            }
            if (taskDTO.getCompletionPercentage() == null) {
                taskDTO.setCompletionPercentage(0);
            }
            if (taskDTO.getCategory() == null) {
                taskDTO.setCategory("General");
            }
            if (taskDTO.getEstimatedHours() == null) {
                taskDTO.setEstimatedHours(8);
            }
            
            TaskDTO createdTask = taskService.createTask(taskDTO);
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
}