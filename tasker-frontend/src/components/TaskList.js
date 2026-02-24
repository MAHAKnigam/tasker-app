import React from 'react';
import TaskCard from './TaskCard';
import '../styles/TaskList.css';

function TaskList({ tasks, onDelete, onComplete }) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard
          key={task._id}
          task={task}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

export default TaskList;
