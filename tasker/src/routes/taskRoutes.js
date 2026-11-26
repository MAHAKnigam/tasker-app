const express = require('express');
const { body } = require('express-validator');
const TaskController = require('../controllers/TaskController');

const router = express.Router();

const recurrenceValidation = [
  body('recurrence').optional().isObject().withMessage('Recurrence must be an object'),
  body('recurrence.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Recurrence frequency must be daily, weekly, or monthly'),
  body('recurrence.interval')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Recurrence interval must be a whole number between 1 and 365'),
  body('recurrence.endDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Recurrence end date must be a valid date'),
  body('recurrence').custom((value, { req }) => {
    if (value && !req.body.dueDate) {
      throw new Error('A due date is required for recurring tasks');
    }
    if (value && !value.frequency) {
      throw new Error('Recurrence frequency is required');
    }
    return true;
  }),
];

const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('reminderMinutesBefore').optional({ nullable: true }).isIn([5, 15, 30, 60, 1440]).withMessage('Reminder interval is invalid'),
  ...recurrenceValidation,
];

const updateTaskValidation = [
  body('title').optional().trim().isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('description').optional().trim().isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('reminderMinutesBefore').optional({ nullable: true }).isIn([5, 15, 30, 60, 1440]).withMessage('Reminder interval is invalid'),
];

router.post('/', createTaskValidation, (req, res) => TaskController.createTask(req, res));
router.get('/', (req, res) => TaskController.getUserTasks(req, res));
router.get('/:id', (req, res) => TaskController.getTaskById(req, res));
router.put('/:id', updateTaskValidation, (req, res) => TaskController.updateTask(req, res));
router.delete('/:id', (req, res) => TaskController.deleteTask(req, res));
router.patch('/:id/complete', (req, res) => TaskController.completeTask(req, res));
router.get('/status/:status', (req, res) => TaskController.getTasksByStatus(req, res));
router.get('/priority/:priority', (req, res) => TaskController.getTasksByPriority(req, res));

module.exports = router;
