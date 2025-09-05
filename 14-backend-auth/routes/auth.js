const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
    body('name').optional().isLength({ min: 2 })
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  authController.login
);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
