import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import SummaryCards from './SummaryCards';
import TaskTable from './TaskTable';
import ConfirmationModal from './ConfirmationModal';
import NewTaskModal from './NewTaskModal';

const TaskOverview = () => {
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState({
        total: 0, completed: 0, inProgress: 0, onHold: 0, notStarted: 0
    });
    const [allowEditCompleted, setAllowEditCompleted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTasks();
        loadSummary();
    }, [[loadTasks]]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const response = await taskService.getAllTasks();
            setTasks(response.data);
            showNotification('All tasks loaded successfully!', 'success');
        } catch (error) {
            showNotification('Error loading tasks!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await taskService.getTaskSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    };

    const handleTaskUpdate = async (taskId, updatedTask) => {
        try {
            // Auto-update completion percentage based on status
            if (updatedTask.status === 'COMPLETED') {
                updatedTask.completionPercentage = 100;
            } else if (updatedTask.status === 'NOT_STARTED') {
                updatedTask.completionPercentage = 0;
            } else if (updatedTask.status === 'IN_PROGRESS' && (!updatedTask.completionPercentage || updatedTask.completionPercentage < 50)) {
                updatedTask.completionPercentage = 50;
            }

            await taskService.updateTask(taskId, updatedTask);
            const updatedTasks = tasks.map(task => 
                task.id === taskId ? updatedTask : task
            );
            setTasks(updatedTasks);
            loadSummary();
            showNotification('Task updated successfully!', 'success');
        } catch (error) {
            showNotification('Error updating task!', 'error');
        }
    };

    // Add this function for task deletion
    const handleTaskDelete = async (taskId) => {
        try {
            await taskService.deleteTask(taskId);
            // Remove the task from the local state
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            loadSummary(); // Refresh the summary
            showNotification('Task deleted successfully!', 'success');
        } catch (error) {
            showNotification('Error deleting task!', 'error');
        }
    };

    const handleSaveChanges = () => {
        setShowModal(true);
    };

    const confirmSave = () => {
        setShowModal(false);
        showNotification('All changes saved successfully!', 'success');
    };

    const toggleCompletedTaskEditing = () => {
        setAllowEditCompleted(!allowEditCompleted);
        showNotification(
            allowEditCompleted ? 'Completed tasks are now locked' : 'Completed tasks are now editable',
            'info'
        );
    };

    const sendEmailReport = () => {
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let body = `DAILY TASK REPORT\n`;
        body += `Date: ${today}\n`;
        body += `Generated: ${new Date().toLocaleTimeString()}\n\n`;
        
        body += `📊 TASK OVERVIEW SUMMARY\n`;
        body += `═`.repeat(40) + `\n`;
        body += `• Total Tasks: ${summary.total}\n`;
        body += `• ✅ Completed: ${summary.completed} (${Math.round((summary.completed / summary.total) * 100)}%)\n`;
        body += `• 🔄 In Progress: ${summary.inProgress}\n`;
        body += `• ⏸️ On Hold: ${summary.onHold}\n`;
        body += `• 📋 Not Started: ${summary.notStarted}\n\n`;
        
        body += `📝 TASK DETAILS\n`;
        body += `═`.repeat(40) + `\n`;
        
        const statusGroups = {
            'COMPLETED': tasks.filter(t => t.status === 'COMPLETED'),
            'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
            'HOLD': tasks.filter(t => t.status === 'HOLD'),
            'NOT_STARTED': tasks.filter(t => t.status === 'NOT_STARTED')
        };

        Object.entries(statusGroups).forEach(([status, statusTasks]) => {
            if (statusTasks.length > 0) {
                body += `\n${getStatusEmoji(status)} ${formatStatus(status)} (${statusTasks.length})\n`;
                body += `─`.repeat(30) + `\n`;
                
                statusTasks.forEach((task, index) => {
                    body += `${index + 1}. ${task.taskName}\n`;
                    body += `   👤 Responsible: ${task.responsible}\n`;
                    if (task.startDate || task.endDate) {
                        body += `   📅 Dates: ${task.startDate || 'Not set'} → ${task.endDate || 'Not set'}\n`;
                    }
                    if (task.priority) {
                        body += `   🚨 Priority: ${formatPriority(task.priority)}\n`;
                    }
                    if (task.remarks) {
                        body += `   💬 Remarks: ${task.remarks}\n`;
                    }
                    body += `\n`;
                });
            }
        });

        body += `\n---\n`;
        body += `YAMAHA Manufacturing System\n`;
        body += `This report was generated automatically.\n`;

        const subject = `YAMAHA Daily Task Report - ${today}`;
        const mailtoLink = `mailto:manager@yamaha.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.open(mailtoLink, '_blank');
        showNotification('Email client opened with professional report', 'success');
    };

    const exportToPDF = () => {
        if (tasks.length === 0) {
            showNotification('Please load tasks first!', 'warning');
            return;
        }
        
        const printStyle = document.createElement('style');
        printStyle.innerHTML = `
            @media print {
                .no-print { display: none !important; }
                .card { box-shadow: none !important; border: 1px solid #ddd !important; }
                .summary-card { break-inside: avoid; }
                table { break-inside: auto; }
                tr { break-inside: avoid; break-after: auto; }
                body { background: white !important; }
                .header { background: #f8f9fa !important; color: black !important; }
            }
        `;
        document.head.appendChild(printStyle);
        
        window.print();
        document.head.removeChild(printStyle);
        showNotification('PDF export ready - Use browser print dialog', 'info');
    };

    const handleCreateTask = async (newTaskData) => {
        try {
            const response = await taskService.createTask(newTaskData);
            const createdTask = response.data;
            
            setTasks(prevTasks => [...prevTasks, createdTask]);
            loadSummary();
            
            showNotification(`Task "${createdTask.taskName}" created successfully!`, 'success');
        } catch (error) {
            showNotification('Error creating task!', 'error');
            throw error;
        }
    };

    // Filter tasks based on status and search term
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || task.status === filter;
        const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.remarks.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const clearFilters = () => {
        setFilter('all');
        setSearchTerm('');
        showNotification('Filters cleared', 'info');
    };

    const getStatusEmoji = (status) => {
        const emojis = {
            'COMPLETED': '✅',
            'IN_PROGRESS': '🔄',
            'HOLD': '⏸️',
            'NOT_STARTED': '📋'
        };
        return emojis[status] || '📝';
    };

    const formatStatus = (status) => {
        return status.replace('_', ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatPriority = (priority) => {
        return priority.toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 4000);
    };

    return (
        <div className="card professional-dashboard">
            {/* Enhanced Header with Stats and Controls */}
            <div className="card-header professional-header">
                <div className="header-content">
                    <div className="header-main">
                        <h2 className="card-title professional-title">
                            <i className="fas fa-tachometer-alt"></i> Project Task Dashboard
                        </h2>
                        <p className="header-subtitle">
                            {summary.total} total tasks • {summary.completed} completed • Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="progress-overview">
                        <div className="progress-info">
                            <span className="progress-label">Overall Progress</span>
                            <span className="progress-percent">
                                {summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-overall" 
                                style={{
                                    width: `${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    {loading && (
                        <div className="loading-indicator">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Loading...</span>
                        </div>
                    )}
                    <button className="btn btn-primary professional-btn" onClick={loadTasks} disabled={loading}>
                        <i className="fas fa-sync-alt"></i> {loading ? 'Loading...' : 'Refresh Data'}
                    </button>
                    <button 
                        className="btn btn-success professional-btn" 
                        onClick={() => setShowNewTaskModal(true)}
                        disabled={loading}
                    >
                        <i className="fas fa-plus-circle"></i> Create Task
                    </button>
                </div>
            </div>
            
            {/* Summary Cards */}
            <SummaryCards summary={summary} />
            
            {/* Enhanced Filters and Search */}
            <div className="filters-container professional-filters">
                <div className="filters-header">
                    <h3 className="filters-title">
                        <i className="fas fa-sliders-h"></i> Task Filters & Search
                    </h3>
                    {(filter !== 'all' || searchTerm) && (
                        <button 
                            onClick={clearFilters}
                            className="btn btn-outline clear-filters-btn"
                        >
                            <i className="fas fa-times"></i> Clear All
                        </button>
                    )}
                </div>
                
                <div className="filters-grid">
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fas fa-filter"></i> Status Filter
                        </label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select professional-select"
                        >
                            <option value="all">📊 All Statuses</option>
                            <option value="NOT_STARTED">📋 Not Started</option>
                            <option value="IN_PROGRESS">🔄 In Progress</option>
                            <option value="COMPLETED">✅ Completed</option>
                            <option value="HOLD">⏸️ On Hold</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fas fa-search"></i> Search Tasks
                        </label>
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by task name, responsible person, or remarks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input professional-input"
                            />
                            <i className="fas fa-search search-icon"></i>
                        </div>
                    </div>
                </div>
                
                {(filter !== 'all' || searchTerm) && (
                    <div className="filter-results">
                        <span className="results-text">
                            Showing {filteredTasks.length} of {tasks.length} tasks
                            {filter !== 'all' && <span className="filter-tag">Status: {formatStatus(filter)}</span>}
                            {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Enhanced Tasks Table Container */}
            <div className="table-container">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-tasks empty-icon"></i>
                        <h3 className="empty-title">No tasks found</h3>
                        <p className="empty-description">
                            {tasks.length === 0 
                                ? 'No tasks available. Start by creating your first task to track production activities.'
                                : 'No tasks match your current filters. Try adjusting your search criteria or filters.'
                            }
                        </p>
                        {tasks.length === 0 && (
                            <button 
                                className="btn btn-success professional-btn empty-action" 
                                onClick={() => setShowNewTaskModal(true)}
                            >
                                <i className="fas fa-plus"></i> Create First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <TaskTable 
                        tasks={filteredTasks} 
                        onTaskUpdate={handleTaskUpdate}
                        onTaskDelete={handleTaskDelete}
                        allowEditCompleted={allowEditCompleted}
                    />
                )}
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="action-buttons professional-actions no-print">
                <div className="actions-left">
                    <button className="btn btn-warning professional-btn action-btn" onClick={handleSaveChanges}>
                        <i className="fas fa-save"></i> Save All Changes
                    </button>
                    <button className="btn btn-info professional-btn action-btn" onClick={sendEmailReport}>
                        <i className="fas fa-envelope"></i> Generate Report
                    </button>
                </div>
                
                <div className="actions-right">
                    <button className="btn btn-secondary professional-btn action-btn" onClick={exportToPDF}>
                        <i className="fas fa-file-pdf"></i> Export PDF
                    </button>
                    <button 
                        className={`btn ${allowEditCompleted ? 'btn-warning' : 'btn-danger'} professional-btn action-btn`}
                        onClick={toggleCompletedTaskEditing}
                    >
                        <i className={`fas ${allowEditCompleted ? 'fa-lock' : 'fa-edit'}`}></i>
                        {allowEditCompleted ? ' Lock Completed' : ' Edit Completed'}
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={showModal}
                onConfirm={confirmSave}
                onCancel={() => setShowModal(false)}
                title="Confirm Save Changes"
                message="Are you sure you want to save all changes? This will update the task records in the database."
            />

            <NewTaskModal
                isOpen={showNewTaskModal}
                onClose={() => setShowNewTaskModal(false)}
                onTaskCreate={handleCreateTask}
            />

            {/* Enhanced Notification */}
            {notification.show && (
                <div className={`notification professional-notification ${notification.type}`}>
                    <i className={`notification-icon fas ${
                        notification.type === 'success' ? 'fa-check-circle' :
                        notification.type === 'error' ? 'fa-exclamation-circle' :
                        notification.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
                    }`}></i>
                    <span className="notification-message">{notification.message}</span>
                </div>
            )}
        </div>
    );
};

export default TaskOverview;