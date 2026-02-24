import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, userAPI } from '../services/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import ChatBot from '../components/ChatBot';
import '../styles/Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile();
    fetchTasks();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await taskAPI.create(taskData);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskAPI.complete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'pending') return !task.isCompleted;
    return true;
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📋 Tasker</h1>
          <div className="user-info">
            {user && <span>Welcome, {user.name}!</span>}
            <button onClick={() => navigate('/teams')} className="btn-teams">
              👥 Teams
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary btn-large"
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({tasks.filter(t => !t.isCompleted).length})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({tasks.filter(t => t.isCompleted).length})
            </button>
          </div>
        </div>

        {showForm && (
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Create one to get started! 🚀</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
          />
        )}
      </main>

      <ChatBot />
    </div>
  );
}

export default Dashboard;
