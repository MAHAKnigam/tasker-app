import React from 'react';
import '../styles/TaskCard.css';

function TaskCard({ task, onDelete, onComplete }) {
  const priorityColor = {
    high: '#ff4757',
    medium: '#ffa502',
    low: '#2ed573',
  };

  const statusText = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <div className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className="priority-badge"
          style={{ backgroundColor: priorityColor[task.priority] }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="status-badge">{statusText[task.status]}</span>
        {task.dueDate && (
          <span className="due-date">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="task-actions">
        {!task.isCompleted && (
          <button
            onClick={() => onComplete(task._id)}
            className="btn-action btn-complete"
          >
            ✓ Complete
          </button>
        )}
        <button
          onClick={() => onDelete(task._id)}
          className="btn-action btn-delete"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
