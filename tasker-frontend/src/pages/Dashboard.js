import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskAPI, userAPI } from '../services/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import ChatBot from '../components/ChatBot';
import '../styles/Dashboard.css';

const COLUMNS = [
  { id: 'pending', title: 'To do', color: 'slate' },
  { id: 'in-progress', title: 'In progress', color: 'blue' },
  { id: 'completed', title: 'Completed', color: 'green' },
  { id: 'cancelled', title: 'Cancelled', color: 'rose' },
];

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('board');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [movingTask, setMovingTask] = useState('');
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAll();
      setTasks(Array.isArray(response.data.data) ? response.data.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchTasks();
  }, [navigate, fetchUserProfile, fetchTasks]);

  const handleAddTask = async (taskData) => {
    try {
      await taskAPI.create(taskData);
      setShowForm(false);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the task. Please try again.');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the task.');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskAPI.complete(taskId);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete the task.');
    }
  };

  const handleMoveTask = async (taskId, status) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === status) return;
    setMovingTask(taskId);
    setError('');
    try {
      await taskAPI.update(taskId, { status });
      setTasks((current) => current.map((item) => item._id === taskId
        ? { ...item, status, isCompleted: status === 'completed' }
        : item));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not move the task. Please try again.');
    } finally {
      setMovingTask('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter = filter === 'all'
        || (filter === 'completed' ? task.isCompleted || task.status === 'completed' : !task.isCompleted && task.status !== 'completed');
      const matchesSearch = !query
        || task.title?.toLowerCase().includes(query)
        || task.description?.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((task) => !task.isCompleted && task.status !== 'completed' && task.status !== 'cancelled').length,
    completed: tasks.filter((task) => task.isCompleted || task.status === 'completed').length,
    overdue: tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted && task.status !== 'completed' && task.status !== 'cancelled').length,
  }), [tasks]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <Link className="brand" to="/dashboard" aria-label="Tasker home">
            <span className="brand-mark">✓</span>
            <span>tasker<span className="brand-period">.</span></span>
          </a>
          <div className="user-info">
            <span className="welcome-copy">Hello, {user?.name || 'there'}</span>
            <button onClick={() => navigate('/teams')} className="header-button">Teams</button>
            <button onClick={handleLogout} className="header-button header-button-muted">Log out</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Make today count.</h1>
            <p className="welcome-subtitle">A clear view of what matters, one task at a time.</p>
          </div>
          <button onClick={() => setShowForm((open) => !open)} className="btn-primary btn-large">
            {showForm ? 'Close form' : '+ New task'}
          </button>
        </section>

        <section className="stats-grid" aria-label="Task overview">
          <article className="stat-card"><span className="stat-label">All tasks</span><strong>{counts.total}</strong><span className="stat-foot">In your workspace</span></article>
          <article className="stat-card"><span className="stat-label">In progress</span><strong>{counts.active}</strong><span className="stat-foot">Still on your list</span></article>
          <article className="stat-card"><span className="stat-label">Completed</span><strong>{counts.completed}</strong><span className="stat-foot">Things you've finished</span></article>
          <article className="stat-card stat-card-alert"><span className="stat-label">Overdue</span><strong>{counts.overdue}</strong><span className="stat-foot">Need a little attention</span></article>
        </section>

        {showForm && <TaskForm onSubmit={handleAddTask} onCancel={() => setShowForm(false)} />}
        {error && <div className="dashboard-alert" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}

        <section className="work-section">
          <div className="work-toolbar">
            <div>
              <p className="eyebrow">PLAN & PRIORITISE</p>
              <h2>Your tasks</h2>
            </div>
            <div className="toolbar-actions">
              <input className="task-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." aria-label="Search tasks" />
              <div className="view-switch" aria-label="Task view">
                <button className={view === 'board' ? 'selected' : ''} onClick={() => setView('board')}>Board</button>
                <button className={view === 'list' ? 'selected' : ''} onClick={() => setView('list')}>List</button>
              </div>
            </div>
          </div>

          <div className="task-filters" aria-label="Filter tasks">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All tasks</button>
            <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Active</button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
          </div>

          {loading ? <div className="loading-state">Loading your workspace…</div> : visibleTasks.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">✦</span><h3>{search ? 'No matching tasks' : 'A fresh start'}</h3><p>{search ? 'Try another search term.' : 'Add your first task and make some progress today.'}</p></div>
          ) : view === 'list' ? (
            <TaskList tasks={visibleTasks} onDelete={handleDeleteTask} onComplete={handleCompleteTask} />
          ) : (
            <div className="kanban-board">
              {COLUMNS.map((column) => {
                const columnTasks = visibleTasks.filter((task) => ((task.isCompleted || task.status === 'completed') ? 'completed' : (task.status || 'pending')) === column.id);
                return (
                  <section className={`kanban-column column-${column.color}`} key={column.id}>
                    <div className="kanban-column-heading"><div><span className="column-dot" /><h3>{column.title}</h3></div><span className="column-count">{columnTasks.length}</span></div>
                    <div className="kanban-cards">
                      {columnTasks.length === 0 && <p className="column-empty">No tasks here yet</p>}
                      {columnTasks.map((task) => (
                        <article className={`kanban-card priority-${task.priority || 'medium'}`} key={task._id}>
                          <div className="kanban-card-top"><span className={`priority-label priority-label-${task.priority || 'medium'}`}>{task.priority || 'medium'} priority</span><button className="card-delete" onClick={() => handleDeleteTask(task._id)} aria-label={`Delete ${task.title}`}>×</button></div>
                          <h4>{task.title}</h4>
                          {task.description && <p className="kanban-description">{task.description}</p>}
                          {task.dueDate && <p className="kanban-due">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
                          <label className="move-task-label" htmlFor={`move-${task._id}`}>Move to</label>
                          <select id={`move-${task._id}`} value={column.id} disabled={movingTask === task._id} onChange={(event) => handleMoveTask(task._id, event.target.value)}>
                            {COLUMNS.map((option) => <option value={option.id} key={option.id}>{option.title}</option>)}
                          </select>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <ChatBot />
    </div>
  );
}

export default Dashboard;
