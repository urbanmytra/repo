const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide service name'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify service category'],
    // enum: [
    //   // Existing
    //   'AC Services',
    //   'Electrical',
    //   'Plumbing',
    //   'Cleaning',
    //   'Security',
    //   'Maintenance',
    //   'Repair',
    //   'Installation',
    //   'Other',

    //   // New categories you’re using
    //   'Packers & Movers',
    //   'Car Care',
    //   'Interior',
    //   'Electronics',
    //   'Solar',
    //   'Labour',
    //   'Construction',
    //   'Appliances',
    // ]
  },
  subcategory: String,
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceType: {
      type: String,
      enum: [
        // Existing
        'fixed',
        'hourly',
        'per_item',
        'custom',
        // New for your seeds
        'variable',
        'daily'
      ],
      default: 'fixed'
    },
    discountPrice: Number,
    discountPercentage: Number
  },
  duration: {
    estimated: {
      type: String,
      required: [true, 'Please provide estimated duration']
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'hours'
    }
  },
  images: [{
    public_id: String,   // keep existing snake_case for Cloudinary
    url: String,
    alt: String
    // If you later want credit info, add:
    // credit: {
    //   provider: String,
    //   authorName: String,
    //   authorUsername: String,
    //   authorLink: String,
    //   photoLink: String,
    //   license: String
    // }
  }],
  features: [String],
  inclusions: [String],
  exclusions: [String],
  requirements: [String],
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: [true, 'Service must belong to a provider']
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: { available: Boolean, slots: [String] },
      tuesday: { available: Boolean, slots: [String] },
      wednesday: { available: Boolean, slots: [String] },
      thursday: { available: Boolean, slots: [String] },
      friday: { available: Boolean, slots: [String] },
      saturday: { available: Boolean, slots: [String] },
      sunday: { available: Boolean, slots: [String] }
    },
    blackoutDates: [Date]
  },
  serviceArea: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    radius: {
      type: Number,
      default: 10 // km
    },
    cities: [String],
    states: [String]
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  warranty: {
    duration: String,
    terms: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'suspended'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ 'ratings.averageRating': -1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ featured: 1, popular: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Create slug from name
serviceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for bookings
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service'
});

// Calculate average rating
serviceSchema.methods.calculateAverageRating = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { service: this._id } },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: { $push: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    const { averageRating, totalReviews, ratingDistribution } = stats[0];

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    this.ratings = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: distribution
    };
  } else {
    this.ratings = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  await this.save();
};

module.exports = mongoose.model('Service', serviceSchema);