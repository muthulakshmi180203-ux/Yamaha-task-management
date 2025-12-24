// frontend/src/services/taskService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const taskService = {
    getAllTasks: () => axios.get(API_BASE_URL),
    getTaskById: (id) => axios.get(`${API_BASE_URL}/${id}`),
    createTask: (task) => axios.post(API_BASE_URL, task), // This should be the main endpoint
    updateTask: (id, task) => axios.put(`${API_BASE_URL}/${id}`, task),
    deleteTask: (id) => axios.delete(`${API_BASE_URL}/${id}`),
    getTaskSummary: () => axios.get(`${API_BASE_URL}/summary`),
    initializeData: () => axios.post(`${API_BASE_URL}/initialize`)
};

export default taskService;