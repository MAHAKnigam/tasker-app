import React, { useState } from 'react';
import '../styles/TaskForm.css';

function TaskForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState('30');
  const [repeat, setRepeat] = useState('none');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setDueTime('09:00');
    setReminderMinutesBefore('30');
    setRepeat('none');
    setRepeatInterval(1);
    setRepeatEndDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (repeat !== 'none' && !dueDate) {
      setError('Choose a due date for a recurring task');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate + 'T' + dueTime).toISOString() : undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        reminderMinutesBefore: dueDate ? (reminderMinutesBefore === 'none' ? null : Number(reminderMinutesBefore)) : null,
        ...(repeat !== 'none' && {
          recurrence: {
            frequency: repeat,
            interval: Number(repeatInterval),
            ...(repeatEndDate && { endDate: new Date(repeatEndDate).toISOString() }),
          },
        }),
      });
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form-container">
      <form className="task-form" onSubmit={handleSubmit}>
        <h2>Create New Task</h2>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Task Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        {dueDate && (
          <div className="form-row">
            <div className="form-group">
              <label>Due Time (your local time)</label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email & device reminder</label>
              <select value={reminderMinutesBefore} onChange={(e) => setReminderMinutesBefore(e.target.value)}>
                <option value="none">No reminder</option>
                <option value="5">5 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before (recommended)</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Repeat</label>
          <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {repeat !== 'none' && (
          <div className="form-row">
            <div className="form-group">
              <label>Repeat every</label>
              <input
                type="number"
                min="1"
                max="365"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Repeat until (optional)</label>
              <input
                type="date"
                value={repeatEndDate}
                min={dueDate || undefined}
                onChange={(e) => setRepeatEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
