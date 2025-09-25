const express = require('express');
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, sort = 'createdAt' } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const tasks = await Task.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve tasks',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics for authenticated user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const overdueTasks = await Task.findOverdue(userId);

    res.json({
      success: true,
      message: 'Task statistics retrieved successfully',
      data: {
        statusStats: stats,
        priorityStats,
        overdue: overdueTasks.length,
        total: await Task.countDocuments({ userId })
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve task statistics',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'name email');

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      message: 'Task retrieved successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Get task error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid task ID',
        message: 'The provided task ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to retrieve task',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Validation
    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Task title is required and must be at least 3 characters long'
      });
    }

    // Create new task
    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
      userId: req.user._id
    });

    const savedTask = await task.save();
    await savedTask.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: savedTask }
    });

  } catch (error) {
    console.error('Create task error:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to create task',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    // Find task
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to update it'
      });
    }

    // Update fields
    if (title !== undefined) {
      if (!title || title.trim().length < 3) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Task title must be at least 3 characters long'
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description?.trim();
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : undefined;
    }

    if (tags !== undefined) {
      task.tags = tags;
    }

    const updatedTask = await task.save();
    await updatedTask.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });

  } catch (error) {
    console.error('Update task error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid task ID',
        message: 'The provided task ID is not valid'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Failed to update task',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Delete task error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid task ID',
        message: 'The provided task ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to delete task',
      message: 'Internal server error'
    });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.patch('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to update it'
      });
    }

    await task.markCompleted();
    await task.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Task marked as completed',
      data: { task }
    });

  } catch (error) {
    console.error('Complete task error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid task ID',
        message: 'The provided task ID is not valid'
      });
    }

    res.status(500).json({
      error: 'Failed to complete task',
      message: 'Internal server error'
    });
  }
});

module.exports = router;