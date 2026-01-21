const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide admin name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin'
  },
  avatar: {
    public_id: String,
    url: String
  },
  permissions: {
    users: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    providers: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      verify: { type: Boolean, default: false }
    },
    services: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    bookings: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      cancel: { type: Boolean, default: false }
    },
    reviews: {
      read: { type: Boolean, default: true },
      moderate: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    analytics: {
      read: { type: Boolean, default: true },
      export: { type: Boolean, default: false }
    },
    settings: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false }
    },
    admins: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
  },
  personalInfo: {
    phone: String,
    department: String,
    employeeId: String,
    joinDate: { type: Date, default: Date.now },
    dateOfBirth: Date,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    lastPasswordChange: Date,
    passwordHistory: [String], // Store last 5 passwords
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    ipWhitelist: [String]
  },
  activity: {
    lastLogin: Date,
    lastLoginIP: String,
    loginHistory: [{
      ip: String,
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
      success: Boolean
    }],
    actionsPerformed: [{
      action: String,
      target: String,
      targetId: String,
      timestamp: { type: Date, default: Date.now },
      ip: String,
      details: mongoose.Schema.Types.Mixed
    }]
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    types: {
      newBookings: { type: Boolean, default: true },
      disputes: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      reviews: { type: Boolean, default: false },
      system: { type: Boolean, default: true }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin'
  },
  lastActiveAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

// Virtual for account age
adminSchema.virtual('accountAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Check if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Encrypt password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  // Store in password history
  if (this.isModified('password') && !this.isNew) {
    this.security.passwordHistory = this.security.passwordHistory || [];
    this.security.passwordHistory.unshift(this.password);
    this.security.passwordHistory = this.security.passwordHistory.slice(0, 5); // Keep last 5
    this.security.lastPasswordChange = new Date();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Set permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        // Full permissions
        Object.keys(this.permissions).forEach(module => {
          Object.keys(this.permissions[module]).forEach(permission => {
            this.permissions[module][permission] = true;
          });
        });
        break;
      
      case 'admin':
        // Most permissions except admin management
        Object.keys(this.permissions).forEach(module => {
          if (module !== 'admins' && module !== 'settings') {
            Object.keys(this.permissions[module]).forEach(permission => {
              this.permissions[module][permission] = true;
            });
          }
        });
        break;
      
      case 'moderator':
        // Limited permissions
        this.permissions.reviews.moderate = true;
        this.permissions.reviews.delete = true;
        this.permissions.users.read = true;
        this.permissions.providers.read = true;
        this.permissions.services.read = true;
        this.permissions.bookings.read = true;
        break;
      
      case 'support':
        // Read-only permissions
        this.permissions.users.read = true;
        this.permissions.bookings.read = true;
        this.permissions.bookings.write = true;
        break;
    }
  }
  next();
});

// Compare password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
adminSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      permissions: this.permissions 
    }, 
    process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Check if password was used recently
adminSchema.methods.isPasswordRecentlyUsed = function(password) {
  if (!this.security.passwordHistory) return false;
  
  return this.security.passwordHistory.some(oldPassword => 
    bcrypt.compareSync(password, oldPassword)
  );
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 30 * 60 * 1000 }; // 30 minutes
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
      'security.loginAttempts': 1, 
      'security.lockUntil': 1 
    }
  });
};

// Log admin activity
adminSchema.methods.logActivity = function(action, target, targetId, details = {}) {
  this.activity.actionsPerformed.push({
    action,
    target,
    targetId,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 100 activities
  if (this.activity.actionsPerformed.length > 100) {
    this.activity.actionsPerformed = this.activity.actionsPerformed.slice(-100);
  }
  
  return this.save();
};

// Check permission
adminSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'super_admin') return true;
  if (!this.permissions[module]) return false;
  return this.permissions[module][action] === true;
};

module.exports = mongoose.model('Admin', adminSchema);