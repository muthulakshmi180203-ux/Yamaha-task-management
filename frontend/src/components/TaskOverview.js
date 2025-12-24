import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';

const TaskOverview = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState('');

    // Load tasks
    const loadTasks = async () => {
        setLoading(true);
        try {
            const response = await taskService.getAllTasks();
            setTasks(response.data);
            setNotification('Tasks loaded successfully');
        } catch (error) {
            setNotification('Error loading tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return (
        <div className="card professional-dashboard">
            <h2>Task Overview</h2>

            {notification && <p>{notification}</p>}

            {loading && <p>Loading tasks...</p>}

            {!loading && tasks.length === 0 && <p>No tasks found</p>}

            {!loading && tasks.length > 0 && (
                <ul>
                    {tasks.map(task => (
                        <li key={task.id}>
                            <strong>{task.taskName}</strong> — {task.status}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskOverview;
