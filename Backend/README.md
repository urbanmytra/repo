# Bagajatin Backend API

A comprehensive backend API for the Bagajatin home services platform, supporting both customer-facing applications and admin panel functionality.

## 🚀 Features

### Core Functionality
- **User Management** - Customer registration, authentication, and profile management
- **Provider Management** - Service provider onboarding, verification, and management
- **Service Management** - Service catalog, categories, and availability
- **Booking System** - Complete booking lifecycle management
- **Review System** - Customer reviews and ratings
- **Admin Panel** - Comprehensive admin dashboard and management tools

### Technical Features
- **RESTful API** - Clean, well-documented API endpoints
- **Authentication** - JWT-based authentication with role-based access
- **File Uploads** - Image and document upload with Cloudinary integration
- **Email Notifications** - Automated email notifications for bookings and updates
- **Rate Limiting** - API rate limiting for security
- **Logging** - Comprehensive logging system
- **Validation** - Input validation and sanitization
- **Error Handling** - Centralized error handling

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚡ Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd bagajatin-backend
   npm install
   \`\`\`

2. **Setup Environment**
   \`\`\`bash
   npm run setup-env
   # Edit .env file with your configuration
   \`\`\`

3. **Initialize Database**
   \`\`\`bash
   npm run setup
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

The API will be available at `http://localhost:5000/api/v1`

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/admin/login` - Admin login
- `GET /auth/me` - Get current user profile

### Service Management
- `GET /services` - Get all services
- `GET /services/:id` - Get service details
- `POST /services` - Create new service (Provider)
- `PUT /services/:id` - Update service (Provider)

### Booking Management
- `GET /bookings` - Get user bookings
- `POST /bookings` - Create new booking
- `PUT /bookings/:id/status` - Update booking status

### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard data
- `GET /analytics/dashboard` - Analytics data
- `POST /admin/bulk/:action` - Bulk operations

For complete API documentation, see [API_DOCS.md](./API_DOCS.md)

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

\`\`\`env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/bagajatin-db

# JWT
JWT_SECRET=your_jwt_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here

# Admin Account
ADMIN_EMAIL=admin@bagajatin.com
ADMIN_PASSWORD=your_secure_password

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## 🏗️ Project Structure

\`\`\`
bagajatin-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── scripts/             # Setup and utility scripts
├── uploads/             # File upload directory
├── logs/                # Application logs
├── server.js            # Server entry point
└── package.json         # Dependencies and scripts
\`\`\`

## 🔐 Security Features

- **Authentication**: JWT-based authentication with role-based access control
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS**: Configured for specific frontend domains
- **Helmet**: Security headers for protection against common vulnerabilities
- **Password Hashing**: bcrypt with salt rounds for secure password storage

## 📊 Database Schema

### Core Collections
- **Users** - Customer accounts and profiles
- **Providers** - Service provider accounts and business information
- **Services** - Service catalog with pricing and availability
- **Bookings** - Service bookings with status tracking
- **Reviews** - Customer reviews and ratings
- **Admins** - Admin accounts with role-based permissions

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure email service
- [ ] Set up SSL/HTTPS
- [ ] Configure monitoring and logging

### Docker Deployment
\`\`\`bash
docker-compose up -d
\`\`\`

## 🧪 Testing

### Manual Testing
Use Postman or curl to test API endpoints:

\`\`\`bash
# Health check
curl http://localhost:5000/api/v1/health

# User registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"+919876543210"}'