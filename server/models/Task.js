const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed'],
      message: 'Status must be either pending, in-progress, or completed'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be either low, medium, or high'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true // Index for better query performance
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  attachments: [{
    filename: String,
    originalName: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

// Set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const diffTime = this.dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static methods
taskSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

taskSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

taskSchema.statics.findOverdue = function(userId) {
  return this.find({
    userId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).sort({ dueDate: 1 });
};

// Instance methods
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

taskSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return this;
};

module.exports = mongoose.model('Task', taskSchema);