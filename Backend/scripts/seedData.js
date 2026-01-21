const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Admin = require('../src/models/Admin');
const Provider = require('../src/models/Provider');
const Service = require('../src/models/Service');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!existingAdmin) {
      const admin = await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'super_admin',
        status: 'active',
        personalInfo: {
          department: 'Administration',
          employeeId: 'ADM001'
        }
      });
      
      console.log('✅ Super Admin created:', admin.email);
    } else {
      console.log('ℹ️  Super Admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

const seedSampleData = async () => {
  try {
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        password: 'password123',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+919876543211',
        password: 'password123',
        address: {
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        isVerified: true,
        status: 'active'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        phone: '+919876543212',
        password: 'password123',
        address: {
          street: '789 Salt Lake',
          city: 'Kolkata',
          state: 'West Bengal',
          zipCode: '700091',
          country: 'India'
        },
        isVerified: true,
        status: 'active'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Sample user created: ${userData.email}`);
      }
    }

    // Create sample providers
    const sampleProviders = [
      {
        name: 'Subhajit Dey',
        email: 'subhajit@example.com',
        phone: '+919876543220',
        password: 'password123',
        businessInfo: {
          businessName: 'Cool Air Services',
          businessType: 'individual'
        },
        specializations: ['AC Installation', 'AC Repair', 'AC Maintenance'],
        experience: {
          years: 5,
          description: 'Experienced AC technician with 5+ years in the field'
        },
        serviceArea: {
          cities: ['Kolkata', 'Howrah'],
          radius: 25,
          coordinates: {
            type: 'Point',
            coordinates: [88.3639, 22.5726] // Kolkata coordinates
          }
        },
        verification: {
          status: 'verified',
          verifiedAt: new Date()
        },
        status: 'active'
      },
      {
        name: 'Ravi Kumar',
        email: 'ravi@example.com',
        phone: '+919876543221',
        password: 'password123',
        businessInfo: {
          businessName: 'ElectroFix Solutions',
          businessType: 'individual'
        },
        specializations: ['Electrical Repair', 'Wiring', 'Electrical Installation'],
        experience: {
          years: 7,
          description: 'Licensed electrician with extensive experience'
        },
        serviceArea: {
          cities: ['Mumbai', 'Pune'],
          radius: 30,
          coordinates: {
            type: 'Point',
            coordinates: [72.8777, 19.0760] // Mumbai coordinates
          }
        },
        verification: {
          status: 'verified',
          verifiedAt: new Date()
        },
        status: 'active'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+919876543222',
        password: 'password123',
        businessInfo: {
          businessName: 'PlumbPro Services',
          businessType: 'individual'
        },
        specializations: ['Plumbing Repair', 'Pipe Installation', 'Bathroom Fitting'],
        experience: {
          years: 4,
          description: 'Professional plumber specializing in residential services'
        },
        serviceArea: {
          cities: ['Delhi', 'Gurgaon'],
          radius: 20,
          coordinates: {
            type: 'Point',
            coordinates: [77.1025, 28.7041] // Delhi coordinates
          }
        },
        verification: {
          status: 'verified',
          verifiedAt: new Date()
        },
        status: 'active'
      }
    ];

    for (const providerData of sampleProviders) {
      const existingProvider = await Provider.findOne({ email: providerData.email });
      if (!existingProvider) {
        await Provider.create(providerData);
        console.log(`✅ Sample provider created: ${providerData.email}`);
      }
    }

    console.log('✅ Sample data seeding completed');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
};

const seedServices = async () => {
  try {
    // Get providers
    const providers = await Provider.find({ status: 'active' });
    
    if (providers.length === 0) {
      console.log('⚠️  No providers found. Skipping service seeding.');
      return;
    }

    const sampleServices = [
      {
        name: 'Professional AC Installation Service',
        description: 'Complete AC installation service with warranty. Our certified technicians ensure proper installation for optimal performance and energy efficiency.',
        category: 'AC Services',
        pricing: {
          basePrice: 1050,
          currency: 'INR',
          priceType: 'fixed'
        },
        duration: {
          estimated: '2-3 hours',
          unit: 'hours'
        },
        features: [
          'Professional installation',
          'Quality testing',
          '1 year warranty',
          'Free consultation'
        ],
        inclusions: [
          'Installation charges',
          'Basic accessories',
          'Testing and commissioning'
        ],
        exclusions: [
          'AC unit cost',
          'Additional electrical work',
          'Structural modifications'
        ],
        provider: providers[0]._id,
        serviceArea: {
          cities: ['Kolkata', 'Howrah'],
          radius: 25
        },
        availability: {
          isAvailable: true
        },
        status: 'active',
        featured: true
      },
      {
        name: 'Electrical Wiring and Repair Service',
        description: 'Complete electrical solutions for homes and offices. Licensed electricians providing safe and reliable electrical services.',
        category: 'Electrical',
        pricing: {
          basePrice: 850,
          currency: 'INR',
          priceType: 'hourly'
        },
        duration: {
          estimated: '1-4 hours',
          unit: 'hours'
        },
        features: [
          'Licensed electrician',
          'Safety certified',
          'Quality materials',
          'Emergency service'
        ],
        inclusions: [
          'Labor charges',
          'Basic materials',
          'Safety inspection'
        ],
        exclusions: [
          'Premium materials',
          'Major rewiring',
          'Electrical appliances'
        ],
        provider: providers[1]._id,
        serviceArea: {
          cities: ['Mumbai', 'Pune'],
          radius: 30
        },
        availability: {
          isAvailable: true
        },
        status: 'active',
        popular: true
      },
      {
        name: 'Plumbing Repair and Maintenance',
        description: 'Expert plumbing services for all your water and drainage needs. Quick response and reliable solutions.',
        category: 'Plumbing',
        pricing: {
          basePrice: 750,
          currency: 'INR',
          priceType: 'fixed'
        },
        duration: {
          estimated: '1-2 hours',
          unit: 'hours'
        },
        features: [
          'Quick response',
          'Quality parts',
          'Clean work',
          '24/7 emergency'
        ],
        inclusions: [
          'Service charges',
          'Basic fittings',
          'Leak testing'
        ],
        exclusions: [
          'Premium fittings',
          'Major pipe replacement',
          'Bathroom renovation'
        ],
        provider: providers[2]._id,
        serviceArea: {
          cities: ['Delhi', 'Gurgaon'],
          radius: 20
        },
        availability: {
          isAvailable: true
        },
        status: 'active'
      },
      {
        name: 'Home Deep Cleaning Service',
        description: 'Comprehensive home cleaning service with eco-friendly products. Professional cleaners for a spotless home.',
        category: 'Cleaning',
        pricing: {
          basePrice: 1200,
          currency: 'INR',
          priceType: 'fixed'
        },
        duration: {
          estimated: '3-5 hours',
          unit: 'hours'
        },
        features: [
          'Eco-friendly products',
          'Trained professionals',
          'Insured service',
          'Satisfaction guarantee'
        ],
        inclusions: [
          'All cleaning supplies',
          'Deep cleaning',
          'Sanitization'
        ],
        exclusions: [
          'Carpet cleaning',
          'Window exterior',
          'Heavy furniture moving'
        ],
        provider: providers[0]._id,
        serviceArea: {
          cities: ['Kolkata'],
          radius: 15
        },
        availability: {
          isAvailable: true
        },
        status: 'active',
        featured: true
      }
    ];

    for (const serviceData of sampleServices) {
      const existingService = await Service.findOne({ 
        name: serviceData.name,
        provider: serviceData.provider 
      });
      
      if (!existingService) {
        await Service.create(serviceData);
        console.log(`✅ Sample service created: ${serviceData.name}`);
      }
    }

    console.log('✅ Services seeding completed');
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  }
};

const seedBookings = async () => {
  try {
    // Get users, services, and providers
    const users = await User.find({ status: 'active' });
    const services = await Service.find({ status: 'active' });
    const providers = await Provider.find({ status: 'active' });

    if (users.length === 0 || services.length === 0 || providers.length === 0) {
      console.log('⚠️  Insufficient data for booking seeding.');
      return;
    }

    const sampleBookings = [
      {
        bookingId: 'BK000001',
        user: users[0]._id,
        service: services[0]._id,
        provider: providers[0]._id,
        serviceDetails: {
          name: services[0].name,
          description: services[0].description,
          category: services[0].category,
          basePrice: services[0].pricing.basePrice,
          duration: services[0].duration.estimated
        },
        customerInfo: {
          name: users[0].name,
          email: users[0].email,
          phone: users[0].phone
        },
        serviceAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          coordinates: { lat: 19.0760, lng: 72.8777 },
          landmark: 'Near City Mall',
          instructions: 'Ring bell twice'
        },
        scheduling: {
          preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          preferredTimeSlot: '10:00 AM - 12:00 PM',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          scheduledTime: '10:00 AM',
          estimatedDuration: '2 hours'
        },
        pricing: {
          baseAmount: services[0].pricing.basePrice,
          taxes: {
            cgst: 47.25,
            sgst: 47.25,
            total: 94.5
          },
          totalAmount: services[0].pricing.basePrice + 94.5
        },
        status: 'confirmed',
        payment: {
          method: 'upi',
          status: 'pending'
        }
      },
      {
        bookingId: 'BK000002',
        user: users[1]._id,
        service: services[1]._id,
        provider: providers[1]._id,
        serviceDetails: {
          name: services[1].name,
          description: services[1].description,
          category: services[1].category,
          basePrice: services[1].pricing.basePrice,
          duration: services[1].duration.estimated
        },
        customerInfo: {
          name: users[1].name,
          email: users[1].email,
          phone: users[1].phone
        },
        serviceAddress: {
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          coordinates: { lat: 28.7041, lng: 77.1025 },
          landmark: 'Opposite Metro Station'
        },
        scheduling: {
          preferredDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          preferredTimeSlot: '2:00 PM - 4:00 PM',
          scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          scheduledTime: '2:00 PM',
          estimatedDuration: '2 hours',
          actualStartTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          actualEndTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
        },
        pricing: {
          baseAmount: services[1].pricing.basePrice,
          additionalCharges: [{
            description: 'Extra wiring work',
            amount: 200
          }],
          taxes: {
            cgst: 52.5,
            sgst: 52.5,
            total: 105
          },
          totalAmount: services[1].pricing.basePrice + 200 + 105
        },
        status: 'completed',
        payment: {
          method: 'cash',
          status: 'paid',
          paidAmount: services[1].pricing.basePrice + 200 + 105,
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        completion: {
          workDescription: 'Fixed electrical wiring issues and installed new switches',
          materialsUsed: ['Electrical wires', 'Switch boards', 'Junction boxes'],
          providerNotes: 'All work completed as per safety standards'
        }
      },
      {
        bookingId: 'BK000003',
        user: users[2]._id,
        service: services[2]._id,
        provider: providers[2]._id,
        serviceDetails: {
          name: services[2].name,
          description: services[2].description,
          category: services[2].category,
          basePrice: services[2].pricing.basePrice,
          duration: services[2].duration.estimated
        },
        customerInfo: {
          name: users[2].name,
          email: users[2].email,
          phone: users[2].phone
        },
        serviceAddress: {
          street: '789 Salt Lake',
          city: 'Kolkata',
          state: 'West Bengal',
          zipCode: '700091',
          country: 'India',
          coordinates: { lat: 22.5726, lng: 88.3639 }
        },
        scheduling: {
          preferredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          preferredTimeSlot: '9:00 AM - 11:00 AM',
          scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          scheduledTime: '9:00 AM',
          estimatedDuration: '2 hours',
          actualStartTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
          actualEndTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000)
        },
        pricing: {
          baseAmount: services[2].pricing.basePrice,
          taxes: {
            cgst: 33.75,
            sgst: 33.75,
            total: 67.5
          },
          totalAmount: services[2].pricing.basePrice + 67.5
        },
        status: 'completed',
        payment: {
          method: 'card',
          status: 'paid',
          paidAmount: services[2].pricing.basePrice + 67.5,
          paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        completion: {
          workDescription: 'Fixed leaking pipes and installed new faucet',
          materialsUsed: ['PVC pipes', 'Faucet', 'Pipe fittings'],
          providerNotes: 'All plumbing issues resolved successfully'
        }
      },
      {
        bookingId: 'BK000004',
        user: users[0]._id,
        service: services[3]._id,
        provider: providers[0]._id,
        serviceDetails: {
          name: services[3].name,
          description: services[3].description,
          category: services[3].category,
          basePrice: services[3].pricing.basePrice,
          duration: services[3].duration.estimated
        },
        customerInfo: {
          name: users[0].name,
          email: users[0].email,
          phone: users[0].phone
        },
        serviceAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        scheduling: {
          preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
          preferredTimeSlot: '8:00 AM - 12:00 PM',
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          scheduledTime: '8:00 AM',
          estimatedDuration: '4 hours'
        },
        pricing: {
          baseAmount: services[3].pricing.basePrice,
          taxes: {
            cgst: 54,
            sgst: 54,
            total: 108
          },
          totalAmount: services[3].pricing.basePrice + 108
        },
        status: 'pending',
        payment: {
          method: 'upi',
          status: 'pending'
        }
      }
    ];

    for (const bookingData of sampleBookings) {
      const existingBooking = await Booking.findOne({
        user: bookingData.user,
        service: bookingData.service,
        'scheduling.preferredDate': bookingData.scheduling.preferredDate
      });

      if (!existingBooking) {
        await Booking.create(bookingData);
        console.log(`✅ Sample booking created for user: ${bookingData.customerInfo.name}`);
      }
    }

    console.log('✅ Bookings seeding completed');
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
  }
};

const seedReviews = async () => {
  try {
    // Get completed bookings
    const completedBookings = await Booking.find({ status: 'completed' })
      .populate('user service provider');

    if (completedBookings.length === 0) {
      console.log('⚠️  No completed bookings found. Skipping review seeding.');
      return;
    }

    const sampleReviews = [
      {
        user: completedBookings[0].user._id,
        service: completedBookings[0].service._id,
        provider: completedBookings[0].provider._id,
        booking: completedBookings[0]._id,
        rating: 4.6, // Calculated average: (5+5+5+4+4)/5 = 4.6
        title: 'Excellent electrical service!',
        comment: 'The electrician arrived on time and completed the work professionally. All electrical issues were resolved and he explained everything clearly. Highly recommend!',
        breakdown: {
          quality: 5,
          punctuality: 5,
          behavior: 5,
          pricing: 4,
          cleanliness: 4
        },
        pros: ['Professional work', 'On time arrival', 'Fair pricing'],
        cons: ['Could have cleaned up a bit better'],
        wouldRecommend: true,
        status: 'approved',
        verified: true
      },
      {
        user: completedBookings[1].user._id,
        service: completedBookings[1].service._id,
        provider: completedBookings[1].provider._id,
        booking: completedBookings[1]._id,
        rating: 4.6, // Calculated average: (4+5+4+5+5)/5 = 4.6
        title: 'Great plumbing service',
        comment: 'Quick and efficient plumbing repair. The plumber was knowledgeable and fixed all the leaks perfectly. Good value for money.',
        breakdown: {
          quality: 4,
          punctuality: 5,
          behavior: 4,
          pricing: 5,
          cleanliness: 5
        },
        pros: ['Quick service', 'Good pricing', 'Clean work'],
        cons: ['Could be more friendly'],
        wouldRecommend: true,
        status: 'approved',
        verified: true,
        response: {
          from: 'provider',
          message: 'Thank you for your feedback! We appreciate your business and will work on being more friendly.',
          respondedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          respondedBy: completedBookings[1].provider._id
        }
      }
    ];

    for (let i = 0; i < Math.min(sampleReviews.length, completedBookings.length); i++) {
      const reviewData = sampleReviews[i];
      
      const existingReview = await Review.findOne({
        booking: reviewData.booking,
        user: reviewData.user
      });

      if (!existingReview) {
        await Review.create(reviewData);
        console.log(`✅ Sample review created for booking: ${completedBookings[i].bookingId}`);
      }
    }

    console.log('✅ Reviews seeding completed');
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
  }
};

const runSeeder = async () => {
  console.log('🌱 Starting database seeding...');
  
  await connectDB();
  
  await seedAdmin();
  await seedSampleData();
  await seedServices();
  await seedBookings();
  await seedReviews();
  
  console.log('🎉 Database seeding completed successfully!');
  process.exit(0);
};

// Run seeder if called directly
if (require.main === module) {
  runSeeder().catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = { runSeeder };