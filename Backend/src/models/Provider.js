const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide provider name'],
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
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    public_id: String,
    url: String
  },
  businessInfo: {
    businessName: String,
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership'],
      default: 'individual'
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    gstNumber: String,
    panNumber: String,
    businessLicense: String
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  services: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Service'
  }],
  specializations: [String],
  experience: {
    years: {
      type: Number,
      min: 0,
      max: 50
    },
    description: String,
    previousWork: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }]
  },
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String,
    verified: { type: Boolean, default: false }
  }],
  documents: {
    aadharCard: {
      number: String,
      imageUrl: String,
      verified: { type: Boolean, default: false }
    },
    panCard: {
      number: String,
      imageUrl: String,
      verified: { type: Boolean, default: false }
    },
    drivingLicense: {
      number: String,
      imageUrl: String,
      verified: { type: Boolean, default: false }
    },
    policeClearance: {
      imageUrl: String,
      verified: { type: Boolean, default: false }
    }
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
    verified: { type: Boolean, default: false }
  },
  serviceArea: {
    cities: [String],
    radius: { type: Number, default: 25 }, // km
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  availability: {
    workingDays: {
      monday: { available: Boolean, hours: { start: String, end: String } },
      tuesday: { available: Boolean, hours: { start: String, end: String } },
      wednesday: { available: Boolean, hours: { start: String, end: String } },
      thursday: { available: Boolean, hours: { start: String, end: String } },
      friday: { available: Boolean, hours: { start: String, end: String } },
      saturday: { available: Boolean, hours: { start: String, end: String } },
      sunday: { available: Boolean, hours: { start: String, end: String } }
    },
    holidayDates: [Date],
    maxBookingsPerDay: { type: Number, default: 5 }
  },
  ratings: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      quality: { type: Number, default: 0 },
      punctuality: { type: Number, default: 0 },
      behavior: { type: Number, default: 0 },
      pricing: { type: Number, default: 0 }
    }
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    completionRate: { type: Number, default: 0 }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Admin'
    },
    rejectionReason: String,
    documents: {
      identity: { type: Boolean, default: false },
      address: { type: Boolean, default: false },
      business: { type: Boolean, default: false },
      background: { type: Boolean, default: false }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  featured: { type: Boolean, default: false },
  commission: {
    rate: { type: Number, default: 15 }, // percentage
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    autoAcceptBookings: { type: Boolean, default: false },
    maxTravelDistance: { type: Number, default: 25 }
  },
  lastActive: Date,
  joinedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
providerSchema.index({ email: 1 });
providerSchema.index({ phone: 1 });
providerSchema.index({ 'serviceArea.coordinates': '2dsphere' });
providerSchema.index({ 'verification.status': 1 });
providerSchema.index({ status: 1 });
providerSchema.index({ 'ratings.averageRating': -1 });

// Virtual for provider's bookings
providerSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'provider'
});

// Virtual for provider's reviews
providerSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'provider'
});

// Encrypt password before saving
providerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
providerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate provider rating
providerSchema.methods.calculateRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { provider: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgQuality: { $avg: '$breakdown.quality' },
        avgPunctuality: { $avg: '$breakdown.punctuality' },
        avgBehavior: { $avg: '$breakdown.behavior' },
        avgPricing: { $avg: '$breakdown.pricing' }
      }
    }
  ]);

  if (stats.length > 0) {
    const result = stats[0];
    this.ratings = {
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      ratingBreakdown: {
        quality: Math.round(result.avgQuality * 10) / 10,
        punctuality: Math.round(result.avgPunctuality * 10) / 10,
        behavior: Math.round(result.avgBehavior * 10) / 10,
        pricing: Math.round(result.avgPricing * 10) / 10
      }
    };
    await this.save();
  }
};

module.exports = mongoose.model('Provider', providerSchema);