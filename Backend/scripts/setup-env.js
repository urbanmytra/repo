const fs = require('fs');
const path = require('path');

const envTemplate = `# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/bagajatin-db
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/bagajatin-prod

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex_${Date.now()}
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Admin Configuration
ADMIN_EMAIL=admin@bagajatin.com
ADMIN_PASSWORD=admin123456
ADMIN_JWT_SECRET=admin_super_secret_key_here_${Date.now()}

# Email Configuration (Nodemailer)
EMAIL_FROM=noreply@bagajatin.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
`;

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the environment variables with your actual values.');
} else {
  console.log('ℹ️  .env file already exists.');
}