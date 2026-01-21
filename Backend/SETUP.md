# Bagajatin Backend Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bagajatin-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   node scripts/setup-env.js
   \`\`\`
   
   Then edit the `.env` file with your actual values:
   - Database connection string
   - JWT secrets
   - Email configuration
   - Cloudinary credentials

4. **Setup upload directories**
   \`\`\`bash
   npm run setup
   \`\`\`

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Seed the database**
   \`\`\`bash
   npm run seed
   \`\`\`

7. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Available Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with nodemon
- \`npm run seed\` - Seed database with sample data
- \`npm run setup\` - Setup directories and seed data
- \`npm run reset-db\` - Reset database (WARNING: Deletes all data)
- \`npm test\` - Run tests

## Default Admin Credentials

- **Email**: admin@bagajatin.com
- **Password**: admin123456

⚠️ **Important**: Change these credentials in production!

## API Endpoints

The API will be available at: \`http://localhost:5000/api/v1\`

- Health Check: \`GET /api/v1/health\`
- API Documentation: See API_DOCS.md

## Project Structure

\`\`\`
bagajatin-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── app.js           # Express app configuration
├── scripts/             # Setup and utility scripts
├── uploads/             # File upload directory
├── logs/                # Application logs
├── .env                 # Environment variables
├── server.js            # Server entry point
└── package.json         # Dependencies and scripts
\`\`\`

## Environment Variables

### Required Variables

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/bagajatin-db

# JWT
JWT_SECRET=your_jwt_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here

# Admin Account
ADMIN_EMAIL=admin@bagajatin.com
ADMIN_PASSWORD=your_secure_password

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
\`\`\`

### Optional Variables

\`\`\`env
# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
\`\`\`

## Database Collections

The system creates the following MongoDB collections:

- **users** - Customer accounts
- **providers** - Service provider accounts
- **admins** - Admin accounts
- **services** - Available services
- **bookings** - Service bookings
- **reviews** - Service reviews

## API Authentication

### User Authentication
- Register: \`POST /api/v1/auth/register\`
- Login: \`POST /api/v1/auth/login\`
- Token required in header: \`Authorization: Bearer <token>\`

### Admin Authentication
- Login: \`POST /api/v1/auth/admin/login\`
- Separate token for admin routes

### Provider Authentication
- Login: \`POST /api/v1/auth/provider/login\`
- Same token system as users

## File Uploads

### Configuration
- **Storage**: Local filesystem (uploads/) or Cloudinary
- **Max Size**: 5MB per file
- **Supported Formats**: JPG, PNG, GIF, WebP, PDF, DOC, DOCX

### Upload Endpoints
- Avatar: \`PUT /api/v1/auth/updatedetails\`
- Service Images: \`POST /api/v1/services\`
- Review Images: \`POST /api/v1/reviews\`

## Error Handling

All API responses follow this format:

### Success Response
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details (development only)"
}
\`\`\`

## Logging

Logs are stored in the \`logs/\` directory:

- **app.log** - General application logs
- **error.log** - Error logs
- **access.log** - HTTP request logs
- **debug.log** - Debug logs (development only)

## Security Features

- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Configured for frontend domains
- **Helmet** - Security headers
- **Input Validation** - Request validation middleware
- **Password Hashing** - bcrypt with salt rounds
- **JWT Tokens** - Secure authentication
- **File Upload Security** - Type and size validation

## Testing

### Manual Testing
Use tools like Postman or curl to test API endpoints.

### Health Check
\`\`\`bash
curl http://localhost:5000/api/v1/health
\`\`\`

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set \`NODE_ENV=production\`
   - Use production database URL
   - Set secure JWT secrets
   - Configure email service

2. **Security**
   - Change default admin credentials
   - Set up SSL/HTTPS
   - Configure firewall rules
   - Set up monitoring

3. **Database**
   - Use MongoDB Atlas or dedicated server
   - Set up regular backups
   - Configure indexes for performance

4. **File Storage**
   - Configure Cloudinary for production
   - Set up CDN for static files

### Docker Deployment

Create \`Dockerfile\`:

\`\`\`dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
\`\`\`

Create \`docker-compose.yml\`:

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/bagajatin
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
\`\`\`

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify connection string in .env
   - Check network connectivity

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header

3. **File Upload Errors**
   - Check uploads directory permissions
   - Verify file size limits
   - Check Cloudinary configuration

4. **Email Not Sending**
   - Verify email credentials
   - Check SMTP settings
   - Enable "Less secure apps" for Gmail

### Debug Mode

Set \`NODE_ENV=development\` for detailed error messages and debug logs.

### Logs Analysis

Check logs for errors:
\`\`\`bash
tail -f logs/error.log
tail -f logs/app.log
\`\`\`

## Performance Optimization

### Database Indexes
The system automatically creates indexes for:
- User email and phone
- Service category and ratings
- Booking status and dates
- Provider verification status

### Caching
Consider implementing Redis for:
- Session storage
- Frequently accessed data
- Rate limiting

### Monitoring
Recommended monitoring tools:
- PM2 for process management
- New Relic for application monitoring
- MongoDB Compass for database monitoring

## Support

For technical support or questions:
- Check the API documentation
- Review error logs
- Contact the development team

## License

This project is proprietary software for Bagajatin Services Platform.
\`\`\`

## 51. Final package.json with all dependencies

Update your **package.json** with the complete dependency list:

```json
{
  "name": "bagajatin-backend",
  "version": "1.0.0",
  "description": "Backend API for Bagajatin Services Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "seed": "node scripts/seedData.js",
    "setup": "node scripts/setup-uploads.js && npm run seed",
    "setup-env": "node scripts/setup-env.js",
    "reset-db": "node scripts/resetDatabase.js",
    "docs": "node scripts/generateDocs.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "keywords": [
    "services",
    "booking",
    "home-services",
    "api",
    "nodejs",
    "express",
    "mongodb"
  ],
  "author": "Bagajatin Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "nodemailer": "^6.9.4",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "joi": "^17.9.2",
    "moment": "^2.29.4",
    "uuid": "^9.0.0",
    "compression": "^1.7.4",
    "express-validator": "^7.0.1",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.48.0",
    "eslint-config-node": "^4.1.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}


