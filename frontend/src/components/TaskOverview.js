import React, { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';
import SummaryCards from './SummaryCards';
import TaskTable from './TaskTable';
import ConfirmationModal from './ConfirmationModal';
import NewTaskModal from './NewTaskModal';

const TaskOverview = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    onHold: 0,
    notStarted: 0,
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  /* ---------------- Notification ---------------- */
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  /* ---------------- API Calls ---------------- */
  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getAllTasks();
      setTasks(res.data);
    } catch (err) {
      showNotification('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const res = await taskService.getTaskSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Summary error', err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadSummary();
  }, [loadTasks, loadSummary]);

  /* ---------------- CRUD ---------------- */
  const handleCreateTask = async (task) => {
    try {
      const res = await taskService.createTask(task);
      setTasks((prev) => [...prev, res.data]);
      loadSummary();
      setShowNewTaskModal(false);
      showNotification('Task created successfully', 'success');
    } catch {
      showNotification('Failed to create task', 'error');
    }
  };

  const handleTaskUpdate = async (id, updatedTask) => {
    try {
      await taskService.updateTask(id, updatedTask);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      loadSummary();
      showNotification('Task updated', 'success');
    } catch {
      showNotification('Update failed', 'error');
    }
  };

  const handleTaskDelete = async () => {
    try {
      await taskService.deleteTask(showDeleteId);
      setTasks((prev) => prev.filter((t) => t.id !== showDeleteId));
      loadSummary();
      setShowDeleteId(null);
      showNotification('Task deleted', 'success');
    } catch {
      showNotification('Delete failed', 'error');
    }
  };

  /* ---------------- Filters ---------------- */
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filter === 'all' || task.status === filter;
    const searchMatch =
      task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="card p-3 professional-dashboard">
      <h2 className="mb-3">📋 Task Management Dashboard</h2>

      {loading && <p>Loading tasks...</p>}

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Filters */}
      <div className="d-flex gap-2 my-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="HOLD">On Hold</option>
          <option value="NOT_STARTED">Not Started</option>
        </select>

        <input
          type="text"
          placeholder="Search task / owner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => setShowNewTaskModal(true)}>
          ➕ New Task
        </button>
      </div>

      {/* Task Table */}
      <TaskTable
        tasks={filteredTasks}
        onUpdate={handleTaskUpdate}
        onDelete={(id) => setShowDeleteId(id)}
      />

      {/* Delete Confirmation */}
      {showDeleteId && (
        <ConfirmationModal
          message="Are you sure you want to delete this task?"
          onConfirm={handleTaskDelete}
          onCancel={() => setShowDeleteId(null)}
        />
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <NewTaskModal
          onSave={handleCreateTask}
          onClose={() => setShowNewTaskModal(false)}
        />
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default TaskOverview;
