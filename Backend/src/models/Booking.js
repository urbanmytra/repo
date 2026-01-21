const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: [true, 'Booking must have a service']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: [true, 'Booking must have a provider']
  },
  serviceDetails: {
    name: String,
    description: String,
    category: String,
    basePrice: Number,
    duration: String
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    alternatePhone: String
  },
  serviceAddress: {
    street: {
      type: String,
      required: [true, 'Service address is required']
    },
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: String,
    instructions: String
  },
  scheduling: {
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required']
    },
    preferredTimeSlot: {
      type: String,
      required: [true, 'Preferred time slot is required']
    },
    scheduledDate: Date,
    scheduledTime: String,
    estimatedDuration: String,
    actualStartTime: Date,
    actualEndTime: Date
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: [true, 'Base amount is required']
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    discount: {
      type: Number,
      default: 0
    },
    discountReason: String,
    taxes: {
      cgst: Number,
      sgst: Number,
      igst: Number,
      total: Number
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  status: {
    type: String,
    enum: [
      'pending',           // Initial status
      'confirmed',         // Provider confirmed
      'rescheduled',       // Date/time changed
      'in-progress',       // Service started
      'completed',         // Service finished
      'cancelled',         // Cancelled by user/provider
      'no-show',          // Customer didn't show up
      'disputed'          // Dispute raised
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: String,
      enum: ['user', 'provider', 'admin', 'system']
    },
    reason: String,
    notes: String
  }],
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'bank_transfer'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAmount: { type: Number, default: 0 },
    paidAt: Date,
    refundAmount: { type: Number, default: 0 },
    refundAt: Date,
    paymentDetails: {
      cardLast4: String,
      bankName: String,
      upiId: String
    }
  },
  communication: {
    messages: [{
      from: {
        type: String,
        enum: ['user', 'provider', 'admin']
      },
      message: String,
      timestamp: { type: Date, default: Date.now },
      type: {
        type: String,
        enum: ['text', 'image', 'audio', 'system'],
        default: 'text'
      },
      attachments: [String]
    }],
    lastMessageAt: Date,
    unreadCount: {
      user: { type: Number, default: 0 },
      provider: { type: Number, default: 0 }
    }
  },
  requirements: {
    materials: [{
      item: String,
      quantity: String,
      providedBy: {
        type: String,
        enum: ['customer', 'provider'],
        default: 'provider'
      },
      cost: Number
    }],
    accessories: [String],
    specialInstructions: String,
    safetyRequirements: [String]
  },
  completion: {
    workDescription: String,
    materialsUsed: [String],
    beforeImages: [String],
    afterImages: [String],
    providerNotes: String,
    customerSignature: String,
    warrantyInfo: {
      duration: String,
      terms: String,
      validUntil: Date
    }
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'provider', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundEligible: Boolean,
    cancellationCharges: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewDate: Date,
    wouldRecommend: Boolean,
    serviceAspects: {
      quality: Number,
      punctuality: Number,
      behavior: Number,
      cleanliness: Number
    }
  },
  dispute: {
    isDisputed: { type: Boolean, default: false },
    raisedBy: {
      type: String,
      enum: ['user', 'provider']
    },
    raisedAt: Date,
    reason: String,
    description: String,
    evidence: [String],
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin'
    }
  },
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    completionSent: { type: Boolean, default: false },
    feedbackRequested: { type: Boolean, default: false }
  },
  tracking: {
    providerLocation: {
      lat: Number,
      lng: Number,
      lastUpdated: Date
    },
    estimatedArrival: Date,
    actualArrival: Date,
    travelTime: Number // minutes
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'scheduling.scheduledDate': 1 });
bookingSchema.index({ 'payment.status': 1 });

// Generate unique booking ID
bookingSchema.pre('save', async function(next) {
  try {
    if (!this.bookingId) {
      // Generate a unique booking ID with timestamp to avoid collisions
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.bookingId = `BK${timestamp}${random}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate total amount including taxes
bookingSchema.pre('save', function(next) {
  if (this.isModified('pricing')) {
    let total = this.pricing.baseAmount;
    
    // Add additional charges
    if (this.pricing.additionalCharges && this.pricing.additionalCharges.length > 0) {
      const additionalTotal = this.pricing.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
      total += additionalTotal;
    }
    
    // Apply discount
    total -= this.pricing.discount || 0;
    
    // Add taxes
    if (this.pricing.taxes && this.pricing.taxes.total) {
      total += this.pricing.taxes.total;
    }
    
    this.pricing.totalAmount = Math.round(total * 100) / 100; // Round to 2 decimal places
  }
  next();
});

// Add status to history when status changes
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedBy: 'system',
      timestamp: new Date()
    });
  }
  next();
});

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.scheduling.actualStartTime && this.scheduling.actualEndTime) {
    const diff = this.scheduling.actualEndTime - this.scheduling.actualStartTime;
    return Math.round(diff / (1000 * 60)); // minutes
  }
  return null;
});

// Virtual for days until service
bookingSchema.virtual('daysUntilService').get(function() {
  if (this.scheduling.scheduledDate) {
    const now = new Date();
    const serviceDate = new Date(this.scheduling.scheduledDate);
    const diffTime = serviceDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const serviceDate = new Date(this.scheduling.scheduledDate);
  const hoursUntilService = (serviceDate - now) / (1000 * 60 * 60);
  
  return this.status === 'pending' || this.status === 'confirmed' && hoursUntilService > 2;
};

// Instance method to calculate cancellation charges
bookingSchema.methods.calculateCancellationCharges = function() {
  const now = new Date();
  const serviceDate = new Date(this.scheduling.scheduledDate);
  const hoursUntilService = (serviceDate - now) / (1000 * 60 * 60);
  
  if (hoursUntilService > 24) {
    return 0; // No charges
  } else if (hoursUntilService > 2) {
    return this.pricing.totalAmount * 0.1; // 10% charges
  } else {
    return this.pricing.totalAmount * 0.25; // 25% charges
  }
};

module.exports = mongoose.model('Booking', bookingSchema);