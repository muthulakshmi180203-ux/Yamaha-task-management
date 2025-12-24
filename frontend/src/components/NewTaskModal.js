// frontend/src/components/NewTaskModal.js
import React, { useState } from 'react';

const NewTaskModal = ({ isOpen, onClose, onTaskCreate }) => {
    const [newTask, setNewTask] = useState({
        taskName: '',
        responsible: '',
        remarks: '',
        priority: 'MEDIUM',
        category: 'Installation',
        estimatedHours: 8,
        department: 'Production',
        isCritical: false
    });
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newTask.taskName.trim()) {
            alert('Task name is required!');
            return;
        }

        setLoading(true);
        
        try {
            console.log('Creating task with data:', newTask);
            
            // Create the task object with all required fields
            const taskToCreate = {
                taskName: newTask.taskName.trim(),
                responsible: newTask.responsible.trim() || 'Unassigned',
                remarks: newTask.remarks.trim(),
                status: 'NOT_STARTED', // Default status
                priority: newTask.priority,
                category: newTask.category,
                estimatedHours: parseInt(newTask.estimatedHours) || 8,
                department: newTask.department,
                isCritical: newTask.isCritical || false,
                completionPercentage: 0 // Default completion
            };
            
            console.log('Sending task data:', taskToCreate);
            
            await onTaskCreate(taskToCreate);
            
            // Reset form
            setNewTask({
                taskName: '',
                responsible: '',
                remarks: '',
                priority: 'MEDIUM',
                category: 'Installation',
                estimatedHours: 8,
                department: 'Production',
                isCritical: false
            });
            
        } catch (error) {
            console.error('Error creating task:', error);
            alert(`Failed to create task: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : 
                    type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="confirmation-modal" style={{display: 'flex'}}>
            <div className="modal-content" style={{maxWidth: '600px'}}>
                <h3 className="modal-title">
                    <i className="fas fa-plus-circle"></i> Create New Task
                </h3>
                
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '20px', textAlign: 'left'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                            Task Name *
                        </label>
                        <input
                            type="text"
                            name="taskName"
                            value={newTask.taskName}
                            onChange={handleChange}
                            className="editable-field"
                            placeholder="Enter task name..."
                            required
                            disabled={loading}
                            style={{width: '100%'}}
                        />
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                                Responsible Person
                            </label>
                            <input
                                type="text"
                                name="responsible"
                                value={newTask.responsible}
                                onChange={handleChange}
                                className="editable-field"
                                placeholder="Operator A"
                                disabled={loading}
                                style={{width: '100%'}}
                            />
                        </div>
                        
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={newTask.priority}
                                onChange={handleChange}
                                className="status-select"
                                disabled={loading}
                                style={{width: '100%'}}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                                Category
                            </label>
                            <select
                                name="category"
                                value={newTask.category}
                                onChange={handleChange}
                                className="status-select"
                                disabled={loading}
                                style={{width: '100%'}}
                            >
                                <option value="Installation">Installation</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Testing">Testing</option>
                                <option value="Documentation">Documentation</option>
                                <option value="Safety">Safety</option>
                                <option value="Training">Training</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                                Department
                            </label>
                            <select
                                name="department"
                                value={newTask.department}
                                onChange={handleChange}
                                className="status-select"
                                disabled={loading}
                                style={{width: '100%'}}
                            >
                                <option value="Production">Production</option>
                                <option value="Quality">Quality</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Safety">Safety</option>
                                <option value="Engineering">Engineering</option>
                            </select>
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                        <div>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                                Estimated Hours
                            </label>
                            <input
                                type="number"
                                name="estimatedHours"
                                value={newTask.estimatedHours}
                                onChange={handleChange}
                                className="editable-field"
                                min="1"
                                max="1000"
                                disabled={loading}
                                style={{width: '100%'}}
                            />
                        </div>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px'}}>
                            <input
                                type="checkbox"
                                name="isCritical"
                                checked={newTask.isCritical}
                                onChange={handleChange}
                                disabled={loading}
                                id="criticalCheckbox"
                            />
                            <label htmlFor="criticalCheckbox" style={{fontWeight: '600', color: 'var(--danger)'}}>
                                Critical Task
                            </label>
                        </div>
                    </div>

                    <div style={{marginBottom: '20px', textAlign: 'left'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--primary)'}}>
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            value={newTask.remarks}
                            onChange={handleChange}
                            className="editable-field"
                            placeholder="Enter any remarks or notes..."
                            rows="3"
                            disabled={loading}
                            style={{width: '100%', resize: 'vertical'}}
                        />
                    </div>

                    <div className="modal-buttons">
                        <button 
                            type="submit" 
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus"></i> Create Task
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTaskModal;