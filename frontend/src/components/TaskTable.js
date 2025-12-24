import React, { useState, useCallback, useMemo } from 'react';

const TaskTable = ({ tasks, onTaskUpdate, allowEditCompleted, onTaskDelete }) => {
    const [editingTask, setEditingTask] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Memoized computed values
    const completedCount = useMemo(() => 
        tasks.filter(t => t.status === 'COMPLETED').length, 
        [tasks]
    );
    
    const criticalCount = useMemo(() => 
        tasks.filter(t => t.isCritical).length, 
        [tasks]
    );

    // Memoized handlers
    const handleFieldChange = useCallback((taskId, field, value) => {
        const updatedTask = tasks.find(task => task.id === taskId);
        if (!updatedTask) {
            console.error(`Task with id ${taskId} not found`);
            return;
        }

        // Date validation
        if (field === 'endDate' && value && updatedTask.startDate) {
            if (new Date(value) < new Date(updatedTask.startDate)) {
                alert('End date cannot be before start date');
                return;
            }
        }

        // Progress validation
        if (field === 'completionPercentage') {
            const progress = parseInt(value) || 0;
            if (progress < 0 || progress > 100) {
                alert('Progress must be between 0 and 100');
                return;
            }
        }

        const newTask = { ...updatedTask, [field]: value };
        onTaskUpdate(taskId, newTask);
    }, [tasks, onTaskUpdate]);

    const handleDeleteTask = useCallback((taskId, taskName) => {
        if (window.confirm(`Are you sure you want to delete "${taskName}"? This action cannot be undone.`)) {
            onTaskDelete(taskId);
        }
    }, [onTaskDelete]);

    const handleEditToggle = useCallback((taskId) => {
        setEditingTask(editingTask === taskId ? null : taskId);
    }, [editingTask]);

    const handleSaveEdit = useCallback((taskId) => {
        setEditingTask(null);
    }, []);

    const handleKeyDown = useCallback((e, taskId, action) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (action === 'edit') handleEditToggle(taskId);
            if (action === 'save') handleSaveEdit(taskId);
            if (action === 'cancel') setEditingTask(null);
        }
        if (e.key === 'Escape') {
            setEditingTask(null);
        }
    }, [handleEditToggle, handleSaveEdit]);

    // Helper functions
    const isCompleted = useCallback((task) => task.status === 'COMPLETED', []);
    const isCritical = useCallback((task) => task.isCritical, []);

    const getPriorityBadge = useCallback((priority) => {
        const priorityConfig = {
            'LOW': { class: 'priority-low', label: 'Low', icon: 'fa-arrow-down' },
            'MEDIUM': { class: 'priority-medium', label: 'Medium', icon: 'fa-minus' },
            'HIGH': { class: 'priority-high', label: 'High', icon: 'fa-arrow-up' },
            'URGENT': { class: 'priority-urgent', label: 'Urgent', icon: 'fa-exclamation' }
        };
        const config = priorityConfig[priority] || priorityConfig.MEDIUM;
        return (
            <span className={`priority-badge ${config.class}`}>
                <i className={`fas ${config.icon}`}></i>
                {config.label}
            </span>
        );
    }, []);

    const getStatusBadge = useCallback((status) => {
        const statusConfig = {
            'NOT_STARTED': { class: 'status-notstarted', label: 'Not Started', icon: 'fa-clock' },
            'IN_PROGRESS': { class: 'status-progress', label: 'In Progress', icon: 'fa-spinner' },
            'COMPLETED': { class: 'status-completed', label: 'Completed', icon: 'fa-check-circle' },
            'HOLD': { class: 'status-hold', label: 'On Hold', icon: 'fa-pause-circle' }
        };
        const config = statusConfig[status] || statusConfig.NOT_STARTED;
        return (
            <span className={`status-badge ${config.class}`}>
                <i className={`fas ${config.icon}`}></i>
                {config.label}
            </span>
        );
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Invalid date:', dateString);
            return '-';
        }
    }, []);

    // Export functions
    const exportToCSV = useCallback(async () => {
        if (tasks.length === 0) {
            alert('No tasks to export!');
            return;
        }

        setIsExporting(true);
        try {
            const headers = [
                'Task Name',
                'Category',
                'Department',
                'Start Date',
                'End Date',
                'Responsible',
                'Priority',
                'Status',
                'Completion %',
                'Estimated Hours',
                'Actual Hours',
                'Critical',
                'Remarks'
            ];

            const csvData = tasks.map(task => [
                `"${(task.taskName || '').replace(/"/g, '""')}"`,
                `"${(task.category || 'General').replace(/"/g, '""')}"`,
                `"${(task.department || 'Production').replace(/"/g, '""')}"`,
                `"${task.startDate || ''}"`,
                `"${task.endDate || ''}"`,
                `"${(task.responsible || 'Unassigned').replace(/"/g, '""')}"`,
                `"${task.priority || 'MEDIUM'}"`,
                `"${task.status}"`,
                `"${task.completionPercentage || 0}"`,
                `"${task.estimatedHours || 8}"`,
                `"${task.actualHours || ''}"`,
                `"${task.isCritical ? 'Yes' : 'No'}"`,
                `"${(task.remarks || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `yamaha-tasks-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert(`Exported ${tasks.length} tasks successfully!`);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [tasks]);

    const exportToPDF = useCallback(() => {
        if (tasks.length === 0) {
            alert('No tasks to export!');
            return;
        }

        setIsExporting(true);
        try {
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>YAMAHA Tasks Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #003366; padding-bottom: 10px; }
                        .print-header h1 { color: #003366; margin: 0; }
                        .print-header .subtitle { color: #666; margin: 5px 0; }
                        .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        .print-table th { background: #003366; color: white; padding: 8px; text-align: left; border: 1px solid #ddd; }
                        .print-table td { padding: 6px; border: 1px solid #ddd; }
                        .print-table tr:nth-child(even) { background: #f9f9f9; }
                        .print-summary { margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; font-size: 14px; }
                        .badge { padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; }
                        .badge-completed { background: #28a745; color: white; }
                        .badge-progress { background: #17a2b8; color: white; }
                        .badge-hold { background: #ffc107; color: black; }
                        .badge-notstarted { background: #6c757d; color: white; }
                        @media print { 
                            body { margin: 10px; }
                            .print-table { font-size: 10px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1>YAMAHA Manufacturing</h1>
                        <div class="subtitle">Task Management System - Export</div>
                        <div class="subtitle">Generated on: ${new Date().toLocaleDateString()}</div>
                    </div>
                    
                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Responsible</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Progress</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.map(task => `
                                <tr>
                                    <td>${(task.taskName || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                                    <td>${(task.responsible || 'Unassigned').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                                    <td>
                                        <span class="badge badge-${(task.status || '').toLowerCase().replace('_', '')}">
                                            ${(task.status || '').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>${task.priority || 'MEDIUM'}</td>
                                    <td>${task.completionPercentage || 0}%</td>
                                    <td>${task.startDate || '-'}</td>
                                    <td>${task.endDate || '-'}</td>
                                    <td>${(task.remarks || '-').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="print-summary">
                        <strong>Summary:</strong> ${tasks.length} total tasks • 
                        ${completedCount} completed • 
                        ${criticalCount} critical
                    </div>
                </body>
                </html>
            `;

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Popup blocked! Please allow popups for this site to export PDF.');
                return;
            }

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                setIsExporting(false);
            }, 500);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF export failed. Please try again.');
            setIsExporting(false);
        }
    }, [tasks, completedCount, criticalCount]);

    // Empty state
    if (tasks.length === 0) {
        return (
            <div className="professional-table-container">
                <div className="empty-state">
                    <i className="fas fa-clipboard-list empty-icon"></i>
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="professional-table-container">
            <div className="table-responsive">
                <table className="professional-table">
                    <thead className="table-header">
                        <tr>
                            <th className="task-col">Task Information</th>
                            <th className="dates-col">Timeline</th>
                            <th className="responsible-col">Responsible</th>
                            <th className="priority-col">Priority</th>
                            <th className="status-col">Status</th>
                            <th className="progress-col">Progress</th>
                            <th className="remarks-col">Remarks</th>
                            <th className="actions-col">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {tasks.map((task, index) => (
                            <tr 
                                key={task.id} 
                                className={`
                                    table-row 
                                    ${isCompleted(task) ? 'completed-task' : ''}
                                    ${isCritical(task) ? 'critical-task' : ''}
                                    ${index % 2 === 0 ? 'even-row' : 'odd-row'}
                                    ${editingTask === task.id ? 'editing-task' : ''}
                                `}
                            >
                                {/* Task Information */}
                                <td className="task-info-cell">
                                    <div className="task-main-info">
                                        <div className="task-name-wrapper">
                                            <h4 className="task-title">{task.taskName}</h4>
                                            {isCritical(task) && (
                                                <span className="critical-indicator" title="Critical Task">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                </span>
                                            )}
                                        </div>
                                        <div className="task-meta">
                                            <span className="task-category">
                                                <i className="fas fa-tag"></i>
                                                {task.category || 'General'}
                                            </span>
                                            <span className="task-department">
                                                <i className="fas fa-building"></i>
                                                {task.department || 'Production'}
                                            </span>
                                        </div>
                                        <div className="task-estimate">
                                            <i className="fas fa-clock"></i>
                                            Est: {task.estimatedHours || 8}h
                                            {task.actualHours && (
                                                <span className="actual-hours">
                                                    • Actual: {task.actualHours}h
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Timeline */}
                                <td className="dates-cell">
                                    <div className="timeline-info">
                                        <div className="date-field">
                                            <label className="date-label">Start Date</label>
                                            <input
                                                type="date"
                                                className="date-input professional-input"
                                                value={task.startDate || ''}
                                                disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                                onChange={(e) => handleFieldChange(task.id, 'startDate', e.target.value)}
                                                aria-label={`Start date for ${task.taskName}`}
                                            />
                                            <div className="date-display">
                                                {formatDate(task.startDate)}
                                            </div>
                                        </div>
                                        <div className="date-field">
                                            <label className="date-label">End Date</label>
                                            <input
                                                type="date"
                                                className="date-input professional-input"
                                                value={task.endDate || ''}
                                                disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                                onChange={(e) => handleFieldChange(task.id, 'endDate', e.target.value)}
                                                aria-label={`End date for ${task.taskName}`}
                                            />
                                            <div className="date-display">
                                                {formatDate(task.endDate)}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Responsible */}
                                <td className="responsible-cell">
                                    <input
                                        type="text"
                                        className="responsible-input professional-input"
                                        value={task.responsible || ''}
                                        placeholder="Assign responsible..."
                                        disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                        onChange={(e) => handleFieldChange(task.id, 'responsible', e.target.value)}
                                        aria-label={`Responsible person for ${task.taskName}`}
                                    />
                                    <div className="responsible-display">
                                        <i className="fas fa-user"></i>
                                        {task.responsible || 'Unassigned'}
                                    </div>
                                </td>

                                {/* Priority */}
                                <td className="priority-cell">
                                    <select
                                        className="priority-select professional-select"
                                        value={task.priority || 'MEDIUM'}
                                        disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                        onChange={(e) => handleFieldChange(task.id, 'priority', e.target.value)}
                                        aria-label={`Priority for ${task.taskName}`}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                    <div className="priority-display">
                                        {getPriorityBadge(task.priority || 'MEDIUM')}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="status-cell">
                                    <select
                                        className="status-select professional-select"
                                        value={task.status}
                                        disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                        onChange={(e) => handleFieldChange(task.id, 'status', e.target.value)}
                                        aria-label={`Status for ${task.taskName}`}
                                    >
                                        <option value="NOT_STARTED">Not Started</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="HOLD">On Hold</option>
                                    </select>
                                    <div className="status-display">
                                        {getStatusBadge(task.status)}
                                    </div>
                                </td>

                                {/* Progress */}
                                <td className="progress-cell">
                                    <div className="progress-container">
                                        <div className="progress-header">
                                            <span className="progress-percent">
                                                {task.completionPercentage || 0}%
                                            </span>
                                            <span className="progress-label">Complete</span>
                                        </div>
                                        <div className="progress-bar-wrapper">
                                            <div 
                                                className="progress-fill" 
                                                style={{width: `${task.completionPercentage || 0}%`}}
                                                data-percent={task.completionPercentage || 0}
                                            ></div>
                                        </div>
                                        <div className="progress-actions">
                                            <button 
                                                className="progress-btn decrease"
                                                onClick={() => handleFieldChange(task.id, 'completionPercentage', Math.max(0, (task.completionPercentage || 0) - 10))}
                                                disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                                aria-label={`Decrease progress for ${task.taskName}`}
                                            >
                                                <i className="fas fa-minus"></i>
                                            </button>
                                            <button 
                                                className="progress-btn increase"
                                                onClick={() => handleFieldChange(task.id, 'completionPercentage', Math.min(100, (task.completionPercentage || 0) + 10))}
                                                disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                                aria-label={`Increase progress for ${task.taskName}`}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                </td>

                                {/* Remarks */}
                                <td className="remarks-cell">
                                    <textarea
                                        className="remarks-input professional-input"
                                        value={task.remarks || ''}
                                        placeholder="Add remarks or notes..."
                                        rows="2"
                                        disabled={(isCompleted(task) && !allowEditCompleted) || editingTask !== task.id}
                                        onChange={(e) => handleFieldChange(task.id, 'remarks', e.target.value)}
                                        aria-label={`Remarks for ${task.taskName}`}
                                    />
                                    <div className="remarks-display">
                                        {task.remarks || 'No remarks'}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        {editingTask === task.id ? (
                                            <>
                                                <button 
                                                    className="action-btn save-btn"
                                                    onClick={() => handleSaveEdit(task.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, task.id, 'save')}
                                                    title="Save Changes"
                                                    aria-label={`Save changes for ${task.taskName}`}
                                                >
                                                    <i className="fas fa-save"></i>
                                                </button>
                                                <button 
                                                    className="action-btn cancel-btn"
                                                    onClick={() => setEditingTask(null)}
                                                    onKeyDown={(e) => handleKeyDown(e, task.id, 'cancel')}
                                                    title="Cancel Edit"
                                                    aria-label={`Cancel editing ${task.taskName}`}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    className="action-btn edit-btn"
                                                    onClick={() => handleEditToggle(task.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, task.id, 'edit')}
                                                    disabled={isCompleted(task) && !allowEditCompleted}
                                                    title="Edit Task"
                                                    aria-label={`Edit ${task.taskName}`}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="action-btn quick-complete"
                                                    onClick={() => handleFieldChange(task.id, 'status', 'COMPLETED')}
                                                    disabled={isCompleted(task) && !allowEditCompleted}
                                                    title="Mark as Completed"
                                                    aria-label={`Mark ${task.taskName} as completed`}
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button 
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDeleteTask(task.id, task.taskName)}
                                                    title="Delete Task"
                                                    aria-label={`Delete ${task.taskName}`}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Summary */}
            <div className="table-summary">
                <div className="summary-stats">
                    <span className="stat-item">
                        <i className="fas fa-list-alt"></i>
                        Total: {tasks.length} tasks
                    </span>
                    <span className="stat-item">
                        <i className="fas fa-check-circle"></i>
                        Completed: {completedCount}
                    </span>
                    <span className="stat-item">
                        <i className="fas fa-exclamation-triangle"></i>
                        Critical: {criticalCount}
                    </span>
                </div>
                <div className="summary-actions">
                    <button 
                        className="summary-btn export-csv-btn" 
                        onClick={exportToCSV}
                        disabled={isExporting}
                    >
                        <i className="fas fa-file-csv"></i>
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                        className="summary-btn export-pdf-btn" 
                        onClick={exportToPDF}
                        disabled={isExporting}
                    >
                        <i className="fas fa-file-pdf"></i>
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TaskTable);