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

    // --- Load tasks ---
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

    // --- Load summary ---
    const loadSummary = async () => {
        try {
            const response = await taskService.getTaskSummary();
            setSummary(response.data);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    };

    // --- useEffect for initial load ---
    useEffect(() => {
        const fetchData = async () => {
            await loadTasks();
            await loadSummary();
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Update task ---
    const handleTaskUpdate = async (taskId, updatedTask) => {
        try {
            if (updatedTask.status === 'COMPLETED') updatedTask.completionPercentage = 100;
            else if (updatedTask.status === 'NOT_STARTED') updatedTask.completionPercentage = 0;
            else if (updatedTask.status === 'IN_PROGRESS' && (!updatedTask.completionPercentage || updatedTask.completionPercentage < 50)) {
                updatedTask.completionPercentage = 50;
            }

            await taskService.updateTask(taskId, updatedTask);
            setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
            await loadSummary();
            showNotification('Task updated successfully!', 'success');
        } catch (error) {
            showNotification('Error updating task!', 'error');
        }
    };

    // --- Delete task ---
    const handleTaskDelete = async (taskId) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks(prev => prev.filter(task => task.id !== taskId));
            await loadSummary();
            showNotification('Task deleted successfully!', 'success');
        } catch (error) {
            showNotification('Error deleting task!', 'error');
        }
    };

    // --- Create new task ---
    const handleCreateTask = async (newTaskData) => {
        try {
            const response = await taskService.createTask(newTaskData);
            const createdTask = response.data;
            setTasks(prev => [...prev, createdTask]);
            await loadSummary();
            showNotification(`Task "${createdTask.taskName}" created successfully!`, 'success');
        } catch (error) {
            showNotification('Error creating task!', 'error');
            throw error;
        }
    };

    // --- Other UI actions ---
    const handleSaveChanges = () => setShowModal(true);
    const confirmSave = () => { setShowModal(false); showNotification('All changes saved successfully!', 'success'); };
    const toggleCompletedTaskEditing = () => {
        setAllowEditCompleted(!allowEditCompleted);
        showNotification(allowEditCompleted ? 'Completed tasks are now locked' : 'Completed tasks are now editable', 'info');
    };

    const sendEmailReport = () => {
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        let body = `DAILY TASK REPORT\nDate: ${today}\nGenerated: ${new Date().toLocaleTimeString()}\n\n`;
        body += `📊 TASK OVERVIEW SUMMARY\n${'═'.repeat(40)}\n`;
        body += `• Total Tasks: ${summary.total}\n• ✅ Completed: ${summary.completed} (${Math.round((summary.completed / summary.total) * 100)}%)\n• 🔄 In Progress: ${summary.inProgress}\n• ⏸️ On Hold: ${summary.onHold}\n• 📋 Not Started: ${summary.notStarted}\n\n`;

        const statusGroups = {
            'COMPLETED': tasks.filter(t => t.status === 'COMPLETED'),
            'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
            'HOLD': tasks.filter(t => t.status === 'HOLD'),
            'NOT_STARTED': tasks.filter(t => t.status === 'NOT_STARTED')
        };

        Object.entries(statusGroups).forEach(([status, statusTasks]) => {
            if (statusTasks.length > 0) {
                body += `\n${getStatusEmoji(status)} ${formatStatus(status)} (${statusTasks.length})\n${'─'.repeat(30)}\n`;
                statusTasks.forEach((task, index) => {
                    body += `${index + 1}. ${task.taskName}\n   👤 Responsible: ${task.responsible}\n`;
                    if (task.startDate || task.endDate) body += `   📅 Dates: ${task.startDate || 'Not set'} → ${task.endDate || 'Not set'}\n`;
                    if (task.priority) body += `   🚨 Priority: ${formatPriority(task.priority)}\n`;
                    if (task.remarks) body += `   💬 Remarks: ${task.remarks}\n`;
                    body += `\n`;
                });
            }
        });

        const subject = `YAMAHA Daily Task Report - ${today}`;
        const mailtoLink = `mailto:manager@yamaha.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        showNotification('Email client opened with professional report', 'success');
    };

    const exportToPDF = () => {
        if (tasks.length === 0) return showNotification('Please load tasks first!', 'warning');
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

    const clearFilters = () => { setFilter('all'); setSearchTerm(''); showNotification('Filters cleared', 'info'); };

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || task.status === filter;
        const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              task.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              task.remarks.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusEmoji = (status) => {
        const emojis = { 'COMPLETED':'✅','IN_PROGRESS':'🔄','HOLD':'⏸️','NOT_STARTED':'📋' };
        return emojis[status] || '📝';
    };

    const formatStatus = (status) => status.replace('_',' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const formatPriority = (priority) => priority.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    return (
        <div className="card professional-dashboard">
            {/* Header, summary cards, filters, table, actions, modals, notifications */}
            {/* Copy your existing JSX here, it will work with the above fixes */}
        </div>
    );
};

export default TaskOverview;
