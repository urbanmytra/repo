// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: [true, 'Review must be for a service']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: [true, 'Review must be for a provider']
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: false, // ✅ OPTIONAL - not required
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [true, 'Please provide a rating']
  },
  title: {
    type: String,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  breakdown: {
    quality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    behavior: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    pricing: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  pros: [String],
  cons: [String],
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  helpful: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    from: {
      type: String,
      enum: ['provider', 'admin']
    },
    message: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      refPath: 'response.from'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'approved' // ✅ Auto-approve (change to 'pending' for moderation)
  },
  moderation: {
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin'
    },
    moderatedAt: Date,
    reason: String,
    autoModerated: Boolean
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Indexes - Ensure one review per user per service
reviewSchema.index({ service: 1, user: 1 }, { unique: true });
reviewSchema.index({ provider: 1, rating: -1 });
reviewSchema.index({ service: 1, rating: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// ✅ Prevent duplicate reviews per service per user
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({
      service: this.service,
      user: this.user,
      _id: { $ne: this._id }
    });
    
    if (existingReview) {
      const error = new Error('You have already reviewed this service');
      error.name = 'ValidationError';
      return next(error);
    }

    // Mark as verified if booking is provided
    if (this.booking) {
      this.verified = true;
    }
  }
  next();
});

// Update service and provider ratings after save
reviewSchema.post('save', async function() {
  try {
    const Service = mongoose.model('Service');
    const Provider = mongoose.model('Provider');
    
    // Update service rating
    const service = await Service.findById(this.service);
    if (service && typeof service.calculateAverageRating === 'function') {
      await service.calculateAverageRating();
    }
    
    // Update provider rating
    const provider = await Provider.findById(this.provider);
    if (provider && typeof provider.calculateRating === 'function') {
      await provider.calculateRating();
    }
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    await this.save();
  }
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = async function(userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count -= 1;
    await this.save();
  }
};

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);