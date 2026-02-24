const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Validation middleware
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim(),
];

// Routes
router.get('/', (req, res) => UserController.getAllUsers(req, res));
router.get('/profile', (req, res) => UserController.getCurrentUser(req, res));
router.get('/:id', (req, res) => UserController.getUserById(req, res));
router.put('/:id', updateUserValidation, (req, res) => UserController.updateUser(req, res));
router.delete('/:id', (req, res) => UserController.deleteUser(req, res));

module.exports = router;
