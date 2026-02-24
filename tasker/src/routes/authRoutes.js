const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, (req, res) => AuthController.register(req, res));
router.post('/login', loginValidation, (req, res) => AuthController.login(req, res));
router.post('/change-password', (req, res) => AuthController.changePassword(req, res));

module.exports = router;
