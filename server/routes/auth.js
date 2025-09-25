const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'mean-stack-app'
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Registration error:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user by email (with password field)
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Account is deactivated'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required and must be at least 2 characters long'
      });
    }

    req.user.name = name.trim();
    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: req.user.toJSON()
      }
    });

  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password field
    const userWithPassword = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error.message);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;