import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import '../styles/Calendar.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
};

function Calendar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAll();
      setTasks(Array.isArray(response.data.data) ? response.data.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    loadTasks();
  }, [navigate, loadTasks]);

  const tasksByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = dateKey(new Date(task.dueDate));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);

  const selectedTasks = tasksByDate[dateKey(selectedDate)] || [];
  const todayKey = dateKey(new Date());

  const changeMonth = (amount) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <Link className="calendar-brand" to="/dashboard"><span className="brand-mark">✓</span> tasker<span className="brand-period">.</span></Link>
        <nav><Link to="/dashboard">Dashboard</Link><Link to="/teams">Teams</Link></nav>
      </header>

      <main className="calendar-main">
        <div className="calendar-intro">
          <div><p className="eyebrow">PLAN YOUR TIME</p><h1>Task calendar</h1><p>See your deadlines and plan the work ahead.</p></div>
          <button className="calendar-today" onClick={goToToday}>Today</button>
        </div>

        {error && <div className="calendar-error" role="alert">{error}</div>}

        <section className="calendar-layout" aria-label="Task calendar">
          <div className="calendar-month-panel">
            <div className="calendar-month-toolbar">
              <h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
              <div><button onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button><button onClick={() => changeMonth(1)} aria-label="Next month">›</button></div>
            </div>
            <div className="calendar-grid">
              {WEEKDAYS.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}
              {calendarDays.map((day) => {
                const key = dateKey(day);
                const dayTasks = tasksByDate[key] || [];
                const isCurrentMonth = day.getMonth() === month.getMonth();
                const isSelected = key === dateKey(selectedDate);
                return (
                  <button type="button" key={key} className={['calendar-day', !isCurrentMonth ? 'outside-month' : '', isSelected ? 'selected-day' : '', key === todayKey ? 'today-day' : ''].filter(Boolean).join(' ')} onClick={() => setSelectedDate(day)} aria-label={day.toLocaleDateString() + ', ' + dayTasks.length + ' tasks'}>
                    <span className="calendar-day-number">{day.getDate()}</span>
                    {dayTasks.length > 0 && <span className="calendar-day-count">{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>}
                    <span className="calendar-task-dots">{dayTasks.slice(0, 3).map((task) => <i key={task._id} className={'calendar-dot priority-' + (task.priority || 'medium')} />)}</span>
                  </button>
                );
              })}
            </div>
            <p className="calendar-footnote">Tasks appear on their due dates. Select a day to see its tasks.</p>
          </div>

          <aside className="calendar-agenda">
            <p className="eyebrow">DAILY AGENDA</p>
            <h2>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            {loading ? <p className="agenda-empty">Loading tasks…</p> : selectedTasks.length === 0 ? <div className="agenda-empty"><span>✦</span><p>No tasks due on this day.</p></div> : (
              <div className="agenda-task-list">
                {selectedTasks.map((task) => <article className="agenda-task" key={task._id}>
                  <span className={'agenda-priority priority-' + (task.priority || 'medium')}>{task.priority || 'medium'}</span>
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <span className="agenda-status">{(task.status || 'pending').replace('-', ' ')}</span>
                </article>)}
              </div>
            )}
            <Link className="agenda-dashboard-link" to="/dashboard">Manage tasks →</Link>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default Calendar;
