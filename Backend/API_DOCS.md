# Bagajatin API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.bagajatin.com/v1
```

## Authentication

### User Authentication
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Get Profile**: `GET /auth/me`
- **Update Profile**: `PUT /auth/updatedetails`
- **Change Password**: `PUT /auth/updatepassword`
- **Forgot Password**: `POST /auth/forgotpassword`
- **Reset Password**: `PUT /auth/resetpassword/:token`
- **Verify Email**: `GET /auth/verify/:token`
- **Logout**: `POST /auth/logout`

### Admin Authentication
- **Admin Login**: `POST /auth/admin/login`

### Provider Authentication
- **Provider Login**: `POST /auth/provider/login`

## Users Management

### Public Routes
- **Get Users**: `GET /users` (Admin only)
- **Get User**: `GET /users/:id`

### Protected Routes
- **Create User**: `POST /users` (Admin only)
- **Update User**: `PUT /users/:id`
- **Delete User**: `DELETE /users/:id` (Admin only)
- **Get User Dashboard**: `GET /users/:id/dashboard`
- **Update Preferences**: `PUT /users/:id/preferences`
- **Get Favorites**: `GET /users/:id/favorites`
- **Add to Favorites**: `POST /users/:id/favorites/:serviceId`
- **Remove from Favorites**: `DELETE /users/:id/favorites/:serviceId`

## Services Management

### Public Routes
- **Get Services**: `GET /services`
- **Get Service**: `GET /services/:id`
- **Search Services**: `GET /services/search`
- **Get Featured Services**: `GET /services/featured`
- **Get Popular Services**: `GET /services/popular`
- **Get Services by Category**: `GET /services/category/:category`

### Protected Routes (Provider/Admin)
- **Create Service**: `POST /services`
- **Update Service**: `PUT /services/:id`
- **Delete Service**: `DELETE /services/:id`
- **Get Service Analytics**: `GET /services/:id/analytics`

## Bookings Management

### Protected Routes
- **Get Bookings**: `GET /bookings`
- **Get Booking**: `GET /bookings/:id`
- **Create Booking**: `POST /bookings`
- **Update Booking**: `PUT /bookings/:id`
- **Update Booking Status**: `PUT /bookings/:id/status`
- **Cancel Booking**: `PUT /bookings/:id/cancel`
- **Get Booking Analytics**: `GET /bookings/analytics`
- **Add Message**: `POST /bookings/:id/messages`

## Providers Management

### Public Routes
- **Register Provider**: `POST /providers/register`
- **Get Providers**: `GET /providers`
- **Get Provider**: `GET /providers/:id`
- **Get Top Providers**: `GET /providers/top`

### Protected Routes
- **Update Provider**: `PUT /providers/:id`
- **Delete Provider**: `DELETE /providers/:id` (Admin only)
- **Verify Provider**: `PUT /providers/:id/verify` (Admin only)
- **Get Provider Dashboard**: `GET /providers/:id/dashboard`
- **Update Availability**: `PUT /providers/:id/availability`

## Reviews Management

### Public Routes
- **Get Reviews**: `GET /reviews`
- **Get Review**: `GET /reviews/:id`

### Protected Routes
- **Create Review**: `POST /reviews`
- **Update Review**: `PUT /reviews/:id`
- **Delete Review**: `DELETE /reviews/:id`
- **Mark Helpful**: `PUT /reviews/:id/helpful`
- **Report Review**: `POST /reviews/:id/report`
- **Add Response**: `POST /reviews/:id/response`
- **Moderate Review**: `PUT /reviews/:id/moderate` (Admin only)
- **Get Review Stats**: `GET /reviews/stats` (Admin only)

## Analytics (Admin Only)

- **Dashboard Analytics**: `GET /analytics/dashboard`
- **Revenue Analytics**: `GET /analytics/revenue`
- **Booking Analytics**: `GET /analytics/bookings`
- **User Analytics**: `GET /analytics/users`
- **Service Analytics**: `GET /analytics/services`

## Admin Management (Admin Only)

- **Get Dashboard**: `GET /admin/dashboard`
- **Get Admins**: `GET /admin/admins`
- **Create Admin**: `POST /admin/admins`
- **Update Admin**: `PUT /admin/admins/:id`
- **Delete Admin**: `DELETE /admin/admins/:id`
- **Get Settings**: `GET /admin/settings`
- **Update Settings**: `PUT /admin/settings`
- **Get Activity**: `GET /admin/activity`
- **Bulk Operations**: `POST /admin/bulk/:action`
- **Send Notifications**: `POST /admin/notifications`

## Request/Response Examples

### User Registration
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}
```

### Create Booking
```json
POST /bookings
{
  "service": "service_id_here",
  "serviceAddress": {
    "street": "123 Service Street",
    "city": "Mumbai",
    "zipCode": "400001"
  },
  "scheduling": {
    "preferredDate": "2024-02-15",
    "preferredTimeSlot": "10:00 AM"
  },
  "customerInfo": {
    "name": "John Doe",
    "phone": "+919876543210"
  }
}
```

### Create Service
```json
POST /services
{
  "name": "AC Installation Service",
  "description": "Professional AC installation with warranty",
  "category": "AC Services",
  "pricing": {
    "basePrice": 1050,
    "priceType": "fixed"
  },
  "duration": {
    "estimated": "2-3 hours"
  },
  "features": ["Professional installation", "1 year warranty"],
  "serviceArea": {
    "cities": ["Mumbai", "Pune"],
    "radius": 25
  }
}
```

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional error details (development only)"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## File Uploads

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX
- **Max Size**: 5MB per file
- **Max Files**: 10 per request

### Upload Endpoints
- **Avatar**: `POST /auth/updatedetails` (single file)
- **Service Images**: `POST /services` (multiple files)
- **Review Images**: `POST /reviews` (multiple files)
- **Documents**: `POST /providers/:id` (multiple files)
