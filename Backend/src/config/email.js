const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Bagajatin Services" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent: %s', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

/**
 * Email templates
 */
const emailTemplates = {
  // Welcome email for new users
  welcome: (name) => ({
    subject: 'Welcome to Bagajatin Services!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to Bagajatin Services, ${name}!</h2>
        <p>Thank you for joining our platform. We're excited to help you with all your home service needs.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and book services</li>
          <li>Track your bookings</li>
          <li>Rate and review services</li>
          <li>Manage your profile</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Bagajatin Team</p>
      </div>
    `
  }),

  // Booking confirmation
  bookingConfirmation: (booking) => ({
    subject: `Booking Confirmation - ${booking.service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Booking Confirmed!</h2>
        <p>Hello ${booking.user.name},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${booking.service.name}</p>
          <p><strong>Provider:</strong> ${booking.provider.name}</p>
          <p><strong>Date:</strong> ${booking.scheduledDate}</p>
          <p><strong>Time:</strong> ${booking.scheduledTime}</p>
          <p><strong>Amount:</strong> ₹${booking.amount}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
        <p>Our service provider will contact you soon to confirm the details.</p>
        <p>Best regards,<br>The Bagajatin Team</p>
      </div>
    `
  }),

  // Password reset
  passwordReset: (resetURL) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetURL}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Bagajatin Team</p>
      </div>
    `
  }),

  // Admin notification for new booking
  adminBookingNotification: (booking) => ({
    subject: `New Booking Received - ${booking.service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Booking Received</h2>
        <p>A new booking has been placed on the platform:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Customer:</strong> ${booking.user.name}</p>
          <p><strong>Email:</strong> ${booking.user.email}</p>
          <p><strong>Service:</strong> ${booking.service.name}</p>
          <p><strong>Provider:</strong> ${booking.provider.name}</p>
          <p><strong>Date:</strong> ${booking.scheduledDate}</p>
          <p><strong>Amount:</strong> ₹${booking.amount}</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
        </div>
        <p>Please review and process this booking in the admin panel.</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};