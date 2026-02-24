const express = require('express');
const { body } = require('express-validator');
const TaskController = require('../controllers/TaskController');

const router = express.Router();

// Validation middleware
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

// Routes
router.post('/', createTaskValidation, (req, res) => TaskController.createTask(req, res));
router.get('/', (req, res) => TaskController.getUserTasks(req, res));
router.get('/:id', (req, res) => TaskController.getTaskById(req, res));
router.put('/:id', updateTaskValidation, (req, res) => TaskController.updateTask(req, res));
router.delete('/:id', (req, res) => TaskController.deleteTask(req, res));
router.patch('/:id/complete', (req, res) => TaskController.completeTask(req, res));
router.get('/status/:status', (req, res) => TaskController.getTasksByStatus(req, res));
router.get('/priority/:priority', (req, res) => TaskController.getTasksByPriority(req, res));

module.exports = router;
