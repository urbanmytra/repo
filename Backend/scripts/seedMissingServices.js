// scripts/seedMissingServices.js
const mongoose = require('mongoose');
require('dotenv').config();

const Service = require('../src/models/Service');
const Provider = require('../src/models/Provider');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Missing services from serviceHierarchy.js
const missingServicesData = [
  // ==================== PLUMBING ====================
  {
    name: 'Plumbing Repair',
    description: 'Expert plumbing repair services for leaks, clogs, and pipe issues. Our licensed plumbers fix all types of plumbing problems quickly and efficiently.',
    shortDescription: 'Professional plumbing repair service',
    category: 'Plumbing',
    subcategory: 'All Types',
    pricing: { basePrice: 299, currency: 'INR', priceType: 'variable', note: 'Inspection fee, parts extra' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['Licensed plumbers', 'All repairs', 'Quality parts', '30-day warranty', 'Emergency service available'],
    inclusions: ['Complete diagnosis', 'Minor repairs', 'Leak fixing', 'Testing'],
    exclusions: ['Spare parts', 'Major renovations', 'Bathroom fittings'],
    requirements: ['Water supply access', 'Clear access to affected area'],
    images: [{ url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7', alt: 'Plumbing repair' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    popular: true,
    tags: ['Plumbing', 'Repair', 'Leak Fixing', 'Emergency']
  },
  {
    name: 'Pipe Installation',
    description: 'Professional pipe installation for water supply, drainage, and gas lines. We use quality materials and ensure leak-proof connections.',
    shortDescription: 'Expert pipe installation service',
    category: 'Plumbing',
    subcategory: 'All Types',
    pricing: { basePrice: 499, currency: 'INR', priceType: 'variable', note: 'Per point pricing' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Quality pipes', 'Leak-proof installation', 'All pipe types', 'Testing included', '1-year warranty'],
    inclusions: ['Pipe laying', 'Connections', 'Pressure testing', 'Quality check'],
    exclusions: ['Pipe materials', 'Wall breaking', 'Tiling work'],
    requirements: ['Site readiness', 'Clear path for pipes', 'Water connection point'],
    images: [{ url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7', alt: 'Pipe installation' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Plumbing', 'Installation', 'Pipes', 'Water Supply']
  },
  {
    name: 'Leak Fixing',
    description: 'Quick and effective leak fixing for taps, pipes, tanks, and all plumbing fixtures. We stop leaks permanently.',
    shortDescription: 'Fast leak fixing service',
    category: 'Plumbing',
    subcategory: 'All Types',
    pricing: { basePrice: 199, currency: 'INR', priceType: 'variable', note: 'Per leak pricing' },
    duration: { estimated: '30-60 minutes', unit: 'minutes' },
    features: ['Quick service', 'Permanent solution', 'All leak types', 'Warranty included'],
    inclusions: ['Leak detection', 'Fixing', 'Testing', 'Cleanup'],
    exclusions: ['Major pipe replacement', 'Wall repairs', 'Tiling'],
    requirements: ['Access to leak area', 'Water supply can be shut off'],
    images: [{ url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7', alt: 'Leak fixing' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    tags: ['Plumbing', 'Leak', 'Repair', 'Emergency', 'Quick Fix']
  },
  {
    name: 'Bathroom Fitting',
    description: 'Complete bathroom fitting service including taps, showers, toilets, and all sanitary fixtures. Professional installation with quality fittings.',
    shortDescription: 'Professional bathroom fitting service',
    category: 'Plumbing',
    subcategory: 'All Types',
    pricing: { basePrice: 999, currency: 'INR', priceType: 'variable', note: 'Per fitting pricing' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['All bathroom fittings', 'Professional installation', 'Water testing', '6-month warranty'],
    inclusions: ['Fitting installation', 'Connections', 'Sealing', 'Testing'],
    exclusions: ['Bathroom fittings/fixtures', 'Tiling work', 'Waterproofing'],
    requirements: ['Bathroom ready', 'Water connections available', 'Fittings purchased'],
    images: [{ url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7', alt: 'Bathroom fitting' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Plumbing', 'Bathroom', 'Fitting', 'Installation']
  },
  {
    name: 'Kitchen Plumbing',
    description: 'Complete kitchen plumbing service including sink installation, dishwasher connections, and water purifier fitting.',
    shortDescription: 'Expert kitchen plumbing service',
    category: 'Plumbing',
    subcategory: 'All Types',
    pricing: { basePrice: 599, currency: 'INR', priceType: 'variable', note: 'Service charges, fittings extra' },
    duration: { estimated: '1-3 hours', unit: 'hours' },
    features: ['Sink installation', 'Water connections', 'Drainage setup', 'Quality work'],
    inclusions: ['Plumbing work', 'Connections', 'Testing', 'Cleanup'],
    exclusions: ['Kitchen fittings', 'Countertop work', 'Electrical connections'],
    requirements: ['Kitchen ready', 'Water supply available', 'Drainage access'],
    images: [{ url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7', alt: 'Kitchen plumbing' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Plumbing', 'Kitchen', 'Sink', 'Installation']
  },

  // ==================== CLEANING ====================
  {
    name: 'Deep Cleaning',
    description: 'Comprehensive deep cleaning service for homes and offices. We clean every corner including hard-to-reach areas for a spotless finish.',
    shortDescription: 'Professional deep cleaning service',
    category: 'Cleaning',
    subcategory: 'All Types',
    pricing: { basePrice: 2999, currency: 'INR', priceType: 'variable', note: 'Based on property size' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['Complete cleaning', 'All rooms', 'Professional equipment', 'Eco-friendly products', 'Trained staff'],
    inclusions: ['All rooms cleaning', 'Kitchen deep clean', 'Bathroom sanitization', 'Floor scrubbing', 'Dusting all surfaces'],
    exclusions: ['Exterior cleaning', 'Garden cleaning', 'Heavy furniture moving'],
    requirements: ['Property access', 'Water supply', 'Power supply'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Deep cleaning' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    popular: true,
    tags: ['Cleaning', 'Deep Cleaning', 'Home Cleaning', 'Sanitization']
  },
  {
    name: 'Sofa Cleaning',
    description: 'Professional sofa and upholstery cleaning using advanced techniques. We remove stains, dirt, and odors for fresh-looking furniture.',
    shortDescription: 'Expert sofa cleaning service',
    category: 'Cleaning',
    subcategory: 'All Types',
    pricing: { basePrice: 799, currency: 'INR', priceType: 'variable', note: 'Per seater pricing' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['Deep fabric cleaning', 'Stain removal', 'Odor treatment', 'Quick drying', 'Safe products'],
    inclusions: ['Vacuum cleaning', 'Deep cleaning', 'Stain treatment', 'Fabric protection'],
    exclusions: ['Dry cleaning', 'Leather polishing', 'Fabric tears repair'],
    requirements: ['Sofa accessible', 'Power supply', 'Drying time (4-6 hours)'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Sofa cleaning' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    popular: true,
    tags: ['Cleaning', 'Sofa', 'Upholstery', 'Stain Removal']
  },
  {
    name: 'Carpet Cleaning',
    description: 'Professional carpet cleaning service using steam cleaning and dry cleaning methods. Remove dirt, stains, and allergens effectively.',
    shortDescription: 'Expert carpet cleaning service',
    category: 'Cleaning',
    subcategory: 'All Types',
    pricing: { basePrice: 15, currency: 'INR', priceType: 'variable', note: 'Per sq ft pricing' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Steam cleaning', 'Stain removal', 'Odor removal', 'Fast drying', 'Allergen removal'],
    inclusions: ['Vacuum cleaning', 'Deep steam clean', 'Stain treatment', 'Deodorizing'],
    exclusions: ['Carpet repair', 'Carpet installation', 'Rug cleaning separately charged'],
    requirements: ['Carpet accessible', 'Power supply', 'Drying space'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Carpet cleaning' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Cleaning', 'Carpet', 'Steam Cleaning', 'Stain Removal']
  },
  {
    name: 'Kitchen Cleaning',
    description: 'Thorough kitchen cleaning including cabinets, appliances, countertops, and tiles. We remove grease and grime for a hygienic kitchen.',
    shortDescription: 'Complete kitchen cleaning service',
    category: 'Cleaning',
    subcategory: 'All Types',
    pricing: { basePrice: 1499, currency: 'INR', priceType: 'variable', note: 'Based on kitchen size' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Grease removal', 'Appliance cleaning', 'Cabinet cleaning', 'Tile scrubbing', 'Sanitization'],
    inclusions: ['Countertop cleaning', 'Appliance exterior cleaning', 'Sink scrubbing', 'Floor mopping', 'Tile cleaning'],
    exclusions: ['Appliance servicing', 'Chimney deep cleaning', 'Pest control'],
    requirements: ['Kitchen accessible', 'Water supply', 'Power supply'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Kitchen cleaning' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Cleaning', 'Kitchen', 'Grease Removal', 'Sanitization']
  },
  {
    name: 'Bathroom Cleaning',
    description: 'Professional bathroom cleaning and sanitization service. We clean tiles, fixtures, and remove tough stains for a sparkling bathroom.',
    shortDescription: 'Professional bathroom cleaning',
    category: 'Cleaning',
    subcategory: 'All Types',
    pricing: { basePrice: 499, currency: 'INR', priceType: 'variable', note: 'Per bathroom pricing' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['Deep scrubbing', 'Stain removal', 'Sanitization', 'Odor treatment', 'Tile cleaning'],
    inclusions: ['Toilet cleaning', 'Sink cleaning', 'Tile scrubbing', 'Fixture cleaning', 'Floor mopping'],
    exclusions: ['Plumbing work', 'Tile replacement', 'Waterproofing'],
    requirements: ['Bathroom accessible', 'Water supply', 'Cleaning products access'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Bathroom cleaning' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Cleaning', 'Bathroom', 'Sanitization', 'Deep Cleaning']
  },

  // ==================== PACKERS & MOVERS ====================
  {
    name: 'Home Shifting',
    description: 'Complete home relocation service with packing, loading, transportation, and unpacking. Safe and secure moving of all household items.',
    shortDescription: 'Professional home shifting service',
    category: 'Packers & Movers',
    subcategory: 'All Types',
    pricing: { basePrice: 4999, currency: 'INR', priceType: 'variable', note: 'Based on distance and items' },
    duration: { estimated: '1-2 days', unit: 'days' },
    features: ['Complete packing', 'Safe transportation', 'Unpacking service', 'Insurance available', 'Trained staff'],
    inclusions: ['Packing materials', 'Loading', 'Transportation', 'Unloading', 'Basic unpacking'],
    exclusions: ['Insurance premium', 'Storage charges', 'Pet transportation', 'Plants shifting'],
    requirements: ['Item list', 'Moving date', 'Both location access', 'Parking space'],
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b', alt: 'Home shifting' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 100 },
    status: 'active',
    featured: true,
    popular: true,
    tags: ['Packers', 'Movers', 'Home Shifting', 'Relocation']
  },
  {
    name: 'Office Shifting',
    description: 'Professional office relocation with minimal downtime. We handle furniture, equipment, and documents with care.',
    shortDescription: 'Expert office shifting service',
    category: 'Packers & Movers',
    subcategory: 'All Types',
    pricing: { basePrice: 9999, currency: 'INR', priceType: 'variable', note: 'Based on office size' },
    duration: { estimated: '1-3 days', unit: 'days' },
    features: ['Minimal downtime', 'IT equipment handling', 'Furniture disassembly', 'Secure transport', 'Weekend shifting available'],
    inclusions: ['Packing', 'Loading', 'Transportation', 'Unloading', 'Furniture assembly'],
    exclusions: ['IT setup', 'Network cabling', 'Interior work'],
    requirements: ['Office inventory', 'Shifting schedule', 'Both location access'],
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b', alt: 'Office shifting' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 100 },
    status: 'active',
    tags: ['Packers', 'Movers', 'Office Shifting', 'Commercial']
  },
  {
    name: 'Vehicle Transportation',
    description: 'Safe car and bike transportation service with enclosed carriers. Door-to-door vehicle shifting with insurance.',
    shortDescription: 'Secure vehicle transportation',
    category: 'Packers & Movers',
    subcategory: 'All Types',
    pricing: { basePrice: 3999, currency: 'INR', priceType: 'variable', note: 'Based on distance and vehicle type' },
    duration: { estimated: '2-7 days', unit: 'days' },
    features: ['Enclosed carriers', 'Insurance available', 'Door-to-door service', 'Real-time tracking', 'Safe handling'],
    inclusions: ['Vehicle pickup', 'Loading', 'Transportation', 'Unloading', 'Delivery'],
    exclusions: ['Insurance premium', 'Vehicle servicing', 'Fuel'],
    requirements: ['Vehicle documents', 'Pick-up and drop location', 'Vehicle condition report'],
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b', alt: 'Vehicle transportation' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 200 },
    status: 'active',
    tags: ['Packers', 'Movers', 'Vehicle', 'Car', 'Bike', 'Transportation']
  },
  {
    name: 'Packing Services',
    description: 'Professional packing service for household items, office equipment, and fragile items using quality materials.',
    shortDescription: 'Expert packing service',
    category: 'Packers & Movers',
    subcategory: 'All Types',
    pricing: { basePrice: 1999, currency: 'INR', priceType: 'variable', note: 'Based on items and materials' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['Quality materials', 'Fragile handling', 'Labeling', 'Inventory list', 'Professional team'],
    inclusions: ['Packing materials', 'Packing service', 'Labeling', 'Inventory'],
    exclusions: ['Transportation', 'Loading', 'Storage'],
    requirements: ['Item list', 'Packing date', 'Access to items'],
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b', alt: 'Packing services' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Packing', 'Moving', 'Fragile', 'Professional']
  },
  {
    name: 'Loading & Unloading',
    description: 'Professional loading and unloading service for household and commercial goods. Trained staff ensure safe handling.',
    shortDescription: 'Expert loading & unloading',
    category: 'Packers & Movers',
    subcategory: 'All Types',
    pricing: { basePrice: 999, currency: 'INR', priceType: 'variable', note: 'Based on load and floors' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Trained staff', 'Safe handling', 'Equipment available', 'All floors', 'Quick service'],
    inclusions: ['Loading', 'Unloading', 'Equipment usage', 'Basic arrangement'],
    exclusions: ['Packing', 'Transportation', 'Assembly'],
    requirements: ['Vehicle access', 'Clear path', 'Parking space'],
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b', alt: 'Loading unloading' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Loading', 'Unloading', 'Moving', 'Labour']
  },

  // ==================== SECURITY ====================
  {
    name: 'CCTV Installation',
    description: 'Professional CCTV camera installation with DVR/NVR setup, mobile viewing, and complete configuration for home and office security.',
    shortDescription: 'Complete CCTV installation service',
    category: 'Security',
    subcategory: 'All Types',
    pricing: { basePrice: 2999, currency: 'INR', priceType: 'variable', note: 'Per camera pricing, DVR/NVR extra' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['HD cameras', 'Night vision', 'Mobile viewing', 'Recording setup', '1-year warranty'],
    inclusions: ['Camera installation', 'Wiring', 'DVR/NVR setup', 'Configuration', 'Testing', 'Mobile app setup'],
    exclusions: ['CCTV cameras', 'DVR/NVR', 'Hard disk', 'Monitor', 'Internet charges'],
    requirements: ['Power supply', 'Internet connection (for remote viewing)', 'DVR/NVR location', 'Camera locations decided'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'CCTV installation' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    popular: true,
    tags: ['Security', 'CCTV', 'Surveillance', 'Camera', 'Installation']
  },
  {
    name: 'Security Guard Services',
    description: 'Professional security guard services for residential and commercial properties. Trained guards ensure safety and monitoring.',
    shortDescription: 'Professional security guard service',
    category: 'Security',
    subcategory: 'All Types',
    pricing: { basePrice: 15000, currency: 'INR', priceType: 'variable', note: 'Monthly pricing per guard' },
    duration: { estimated: '12 hours', unit: 'hours' },
    features: ['Trained guards', 'Background verified', 'Uniformed', '24/7 service available', 'Regular reporting'],
    inclusions: ['Guard deployment', 'Uniform', 'Basic training', 'Supervision'],
    exclusions: ['Equipment', 'Weapons', 'Insurance'],
    requirements: ['Duty timings', 'Guard house', 'Instructions'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Security guard' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Security', 'Guard', 'Safety', 'Monitoring']
  },
  {
    name: 'Alarm System Installation',
    description: 'Installation of burglar alarms, fire alarms, and intrusion detection systems with professional setup and testing.',
    shortDescription: 'Professional alarm system installation',
    category: 'Security',
    subcategory: 'All Types',
    pricing: { basePrice: 4999, currency: 'INR', priceType: 'variable', note: 'Based on system type and coverage' },
    duration: { estimated: '3-6 hours', unit: 'hours' },
    features: ['Multiple sensors', 'Mobile alerts', 'Battery backup', 'Professional setup', '1-year warranty'],
    inclusions: ['System installation', 'Sensor placement', 'Wiring', 'Configuration', 'Testing', 'User training'],
    exclusions: ['Alarm system equipment', 'Monthly monitoring charges', 'Internet charges'],
    requirements: ['Power supply', 'Internet connection', 'Sensor locations decided'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Alarm system' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Security', 'Alarm', 'Burglar Alarm', 'Fire Alarm', 'Installation']
  },
  {
    name: 'Access Control Systems',
    description: 'Installation of biometric, card-based, and password-based access control systems for offices and buildings.',
    shortDescription: 'Access control installation',
    category: 'Security',
    subcategory: 'All Types',
    pricing: { basePrice: 7999, currency: 'INR', priceType: 'variable', note: 'Per door/gate pricing' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['Biometric/Card/PIN access', 'User management', 'Attendance tracking', 'Remote access', '1-year warranty'],
    inclusions: ['System installation', 'Wiring', 'Configuration', 'User enrollment', 'Testing', 'Training'],
    exclusions: ['Access control devices', 'Cards/Tags', 'Software licenses', 'Network setup'],
    requirements: ['Power supply', 'Network connection', 'Door/gate preparation'],
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', alt: 'Access control' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Security', 'Access Control', 'Biometric', 'Attendance', 'Installation']
  },

  // ==================== MAINTENANCE ====================
  {
    name: 'General Maintenance',
    description: 'Comprehensive general maintenance service for homes and offices including minor repairs, painting touch-ups, and fixture maintenance.',
    shortDescription: 'All-in-one maintenance service',
    category: 'Maintenance',
    subcategory: 'All Types',
    pricing: { basePrice: 499, currency: 'INR', priceType: 'hourly', note: 'Per hour technician charges' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Multi-skill technician', 'Minor repairs', 'Fixture maintenance', 'Touch-up work', 'Basic tools included'],
    inclusions: ['Inspection', 'Minor repairs', 'Fixture tightening', 'Basic maintenance'],
    exclusions: ['Materials', 'Major repairs', 'Specialized work'],
    requirements: ['Access to areas', 'Repair list'],
    images: [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'General maintenance' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    popular: true,
    tags: ['Maintenance', 'Repair', 'General', 'Handyman']
  },
  {
    name: 'Preventive Maintenance',
    description: 'Scheduled preventive maintenance service for appliances, electrical systems, and plumbing to avoid breakdowns.',
    shortDescription: 'Preventive maintenance service',
    category: 'Maintenance',
    subcategory: 'All Types',
    pricing: { basePrice: 2999, currency: 'INR', priceType: 'variable', note: 'Monthly/Quarterly packages' },
    duration: { estimated: '3-5 hours', unit: 'hours' },
    features: ['Regular inspection', 'Preventive care', 'Performance check', 'Report generation', 'Priority service'],
    inclusions: ['Complete inspection', 'Minor adjustments', 'Cleaning', 'Performance testing', 'Maintenance report'],
    exclusions: ['Spare parts', 'Major repairs', 'Replacement'],
    requirements: ['Equipment list', 'Schedule', 'Access'],
    images: [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'Preventive maintenance' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Maintenance', 'Preventive', 'AMC', 'Service']
  },
  {
    name: 'Emergency Repairs',
    description: '24/7 emergency repair service for urgent plumbing, electrical, and appliance issues. Quick response team available.',
    shortDescription: '24/7 emergency repair service',
    category: 'Maintenance',
    subcategory: 'All Types',
    pricing: { basePrice: 799, currency: 'INR', priceType: 'variable', note: 'Emergency charges, parts extra' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['24/7 availability', 'Quick response', 'Emergency repairs', 'Temporary fixes', 'Follow-up service'],
    inclusions: ['Emergency visit', 'Diagnosis', 'Temporary fix', 'Emergency repairs'],
    exclusions: ['Spare parts', 'Permanent solutions may need re-visit'],
    requirements: ['Immediate availability', 'Problem description'],
    images: [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'Emergency repairs' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    tags: ['Maintenance', 'Emergency', 'Repair', '24/7', 'Urgent']
  },
  {
    name: 'Annual Maintenance Contract',
    description: 'Comprehensive annual maintenance contract for all home/office equipment and systems. Regular scheduled maintenance with priority support.',
    shortDescription: 'Complete AMC service',
    category: 'Maintenance',
    subcategory: 'All Types',
    pricing: { basePrice: 9999, currency: 'INR', priceType: 'variable', note: 'Annual pricing, customizable packages' },
    duration: { estimated: '1 year', unit: 'days' },
    features: ['Scheduled maintenance', 'Priority service', 'Unlimited visits', 'Free inspections', 'Detailed reporting'],
    inclusions: ['Quarterly servicing', 'Emergency support', 'Minor repairs', 'Performance monitoring', 'Service reports'],
    exclusions: ['Spare parts above certain value', 'Major replacements', 'Upgrades'],
    requirements: ['Equipment inventory', 'Schedule preferences', 'Contract signing'],
    images: [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', alt: 'AMC service' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    tags: ['Maintenance', 'AMC', 'Annual Contract', 'Service']
  },

  // ==================== REPAIR ====================
  {
    name: 'General Repairs',
    description: 'All-in-one repair service for minor household and office issues including carpentry, painting, and fixture repairs.',
    shortDescription: 'Complete general repair service',
    category: 'Repair',
    subcategory: 'All Types',
    pricing: { basePrice: 399, currency: 'INR', priceType: 'hourly', note: 'Hourly charges, materials extra' },
    duration: { estimated: '1-3 hours', unit: 'hours' },
    features: ['Multi-task repairs', 'Experienced technician', 'Quality work', 'Same day service', 'Basic tools included'],
    inclusions: ['Minor repairs', 'Fixture fixing', 'Basic maintenance', 'Inspection'],
    exclusions: ['Materials', 'Major repairs', 'Specialized equipment'],
    requirements: ['Repair list', 'Access to areas'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'General repairs' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    popular: true,
    tags: ['Repair', 'General', 'Handyman', 'Fixing']
  },
  {
    name: 'Furniture Repair',
    description: 'Expert furniture repair service for wooden and metal furniture. We fix broken parts, polish, and restore furniture.',
    shortDescription: 'Professional furniture repair',
    category: 'Repair',
    subcategory: 'All Types',
    pricing: { basePrice: 599, currency: 'INR', priceType: 'variable', note: 'Based on repair type' },
    duration: { estimated: '2-4 hours', unit: 'hours' },
    features: ['Wood repairs', 'Polish work', 'Joint fixing', 'Upholstery repairs', 'Quality workmanship'],
    inclusions: ['Inspection', 'Repairs', 'Basic polishing', 'Assembly'],
    exclusions: ['Major restoration', 'Upholstery material', 'Complete refinishing'],
    requirements: ['Furniture accessible', 'Work space', 'Damage photos helpful'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Furniture repair' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Repair', 'Furniture', 'Carpentry', 'Polish']
  },
  {
    name: 'Door & Window Repair',
    description: 'Complete door and window repair service including frame repair, lock fixing, glass replacement, and alignment.',
    shortDescription: 'Expert door & window repair',
    category: 'Repair',
    subcategory: 'All Types',
    pricing: { basePrice: 499, currency: 'INR', priceType: 'variable', note: 'Per door/window pricing' },
    duration: { estimated: '1-3 hours', unit: 'hours' },
    features: ['Frame repair', 'Lock fixing', 'Alignment', 'Hardware replacement', 'Glass work'],
    inclusions: ['Inspection', 'Repairs', 'Alignment', 'Testing'],
    exclusions: ['Glass', 'Locks', 'Hardware', 'Complete replacement'],
    requirements: ['Access to door/window', 'Work space'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Door window repair' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Repair', 'Door', 'Window', 'Lock', 'Carpentry']
  },
  {
    name: 'Wall Repair & Painting',
    description: 'Wall repair service for cracks, holes, and dampness followed by professional painting for a fresh look.',
    shortDescription: 'Wall repair & painting service',
    category: 'Repair',
    subcategory: 'All Types',
    pricing: { basePrice: 899, currency: 'INR', priceType: 'variable', note: 'Based on area and damage' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['Crack filling', 'Hole repair', 'Damp treatment', 'Painting', 'Smooth finish'],
    inclusions: ['Wall preparation', 'Putty work', 'Primer', 'Painting (1 coat)', 'Touch-up'],
    exclusions: ['Major structural repairs', 'Multiple coats', 'Designer painting'],
    requirements: ['Wall accessible', 'Paint color selection', 'Drying time'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Wall repair painting' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Repair', 'Wall', 'Painting', 'Crack', 'Damp']
  },

  // ==================== INSTALLATION ====================
  {
    name: 'Appliance Installation',
    description: 'Professional installation service for all home appliances including washing machines, dishwashers, and kitchen appliances.',
    shortDescription: 'Expert appliance installation',
    category: 'Installation',
    subcategory: 'All Types',
    pricing: { basePrice: 499, currency: 'INR', priceType: 'variable', note: 'Per appliance pricing' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['All appliances', 'Professional setup', 'Testing', 'User demo', 'Warranty support'],
    inclusions: ['Unpacking', 'Installation', 'Connections', 'Testing', 'Demo'],
    exclusions: ['Plumbing work', 'Electrical work', 'Mounting hardware'],
    requirements: ['Power point', 'Water connection (if needed)', 'Space ready'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Appliance installation' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    popular: true,
    tags: ['Installation', 'Appliance', 'Setup', 'Home']
  },
  {
    name: 'Furniture Installation',
    description: 'Professional furniture assembly and installation service for modular furniture, wardrobes, beds, and office furniture.',
    shortDescription: 'Professional furniture installation',
    category: 'Installation',
    subcategory: 'All Types',
    pricing: { basePrice: 799, currency: 'INR', priceType: 'variable', note: 'Based on furniture type' },
    duration: { estimated: '2-6 hours', unit: 'hours' },
    features: ['All furniture types', 'Professional assembly', 'Wall mounting', 'Leveling', 'Quality check'],
    inclusions: ['Unpacking', 'Assembly', 'Installation', 'Leveling', 'Cleanup'],
    exclusions: ['Furniture items', 'Wall drilling (charged separately)', 'Customization'],
    requirements: ['Installation space', 'Assembly instructions', 'Power tools access'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Furniture installation' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    tags: ['Installation', 'Furniture', 'Assembly', 'Wardrobe', 'Bed']
  },
  {
    name: 'TV Mounting',
    description: 'Professional TV wall mounting service with cable concealment and perfect leveling for all TV sizes.',
    shortDescription: 'Expert TV wall mounting',
    category: 'Installation',
    subcategory: 'All Types',
    pricing: { basePrice: 599, currency: 'INR', priceType: 'variable', note: 'Based on TV size and wall type' },
    duration: { estimated: '1-2 hours', unit: 'hours' },
    features: ['All TV sizes', 'Tilt/Fixed mount', 'Cable management', 'Leveling', 'Testing'],
    inclusions: ['Wall mounting', 'Leveling', 'Basic cable hiding', 'Testing'],
    exclusions: ['TV bracket', 'HDMI cables', 'False ceiling work', 'Conduit installation'],
    requirements: ['TV bracket', 'Wall type information', 'Power point nearby'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'TV mounting' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    tags: ['Installation', 'TV', 'Mounting', 'Wall Mount']
  },
  {
    name: 'Smart Home Setup',
    description: 'Complete smart home installation including smart lights, switches, cameras, and automation system setup with mobile app integration.',
    shortDescription: 'Complete smart home installation',
    category: 'Installation',
    subcategory: 'All Types',
    pricing: { basePrice: 4999, currency: 'INR', priceType: 'variable', note: 'Based on devices and automation level' },
    duration: { estimated: '4-8 hours', unit: 'hours' },
    features: ['Smart device installation', 'Automation setup', 'Mobile app integration', 'Voice control', 'User training'],
    inclusions: ['Device installation', 'Network setup', 'App configuration', 'Automation rules', 'Testing', 'User training'],
    exclusions: ['Smart devices', 'WiFi router', 'Subscription charges', 'Advanced programming'],
    requirements: ['WiFi network', 'Power points', 'Device list', 'Mobile/tablet for app'],
    images: [{ url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Smart home setup' }],
    serviceArea: { cities: ['Kolkata', 'Howrah', 'South 24 Parganas'], radius: 40 },
    status: 'active',
    featured: true,
    tags: ['Installation', 'Smart Home', 'Automation', 'IoT', 'Technology']
  }
];

const seedMissingServices = async () => {
  console.log('🌱 Starting to seed MISSING services only...');

  try {
    const provider = await Provider.findOne({ status: 'active' });

    if (!provider) {
      console.error('❌ No active provider found. Please seed providers first.');
      console.log('💡 Run `npm run seed` to create sample providers.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`ℹ️  Assigning missing services to provider: ${provider.name} (${provider.email})`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const serviceData of missingServicesData) {
      const existingService = await Service.findOne({
        name: serviceData.name,
        category: serviceData.category
      });

      if (!existingService) {
        await Service.create({
          ...serviceData,
          provider: provider._id,
        });
        console.log(`✅ Service created: ${serviceData.name} (${serviceData.category})`);
        createdCount++;
      } else {
        console.log(`ℹ️  Service already exists, skipping: ${serviceData.name}`);
        skippedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total missing services: ${missingServicesData.length}`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log('🎉 Missing services seeding completed successfully!');
    console.log('\n✨ Your database now has ALL services from serviceHierarchy.js!');
  } catch (error) {
    console.error('❌ Error seeding missing services:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

connectDB().then(() => {
  seedMissingServices();
});