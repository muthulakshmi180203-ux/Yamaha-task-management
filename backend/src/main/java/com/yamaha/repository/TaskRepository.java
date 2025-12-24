package com.yamaha.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Add this import
import org.springframework.stereotype.Repository;

import com.yamaha.entity.Task;
import com.yamaha.entity.TaskPriority;
import com.yamaha.entity.TaskStatus;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatus(TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.status = :status")
    Long countByStatus(TaskStatus status);
    
    List<Task> findByDepartment(String department);
    
    List<Task> findByPriority(TaskPriority priority);
    
    List<Task> findByCategory(String category);
    
    List<Task> findByIsCritical(Boolean isCritical);
}