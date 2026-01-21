// src/pages/BookingConfirmation.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingsAPI, apiUtils } from "../config/api";
import s from "../assets/css/pages/BookingConfirmation.module.css";
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiDownload,
  FiShare2,
  FiMessageCircle,
  FiStar,
  FiHome,
} from "react-icons/fi";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getBooking(bookingId);
      const result = apiUtils.formatResponse(response);

      if (result.success) {
        setBooking(result.data);
      } else {
        setError("Booking not found");
      }
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: "Booking Confirmation",
      text: `Your booking has been confirmed! Booking ID: ${booking.bookingId}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Booking link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "in-progress":
        return "#3b82f6";
      case "completed":
        return "#059669";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock />;
      case "confirmed":
        return <FiCheckCircle />;
      case "in-progress":
        return <FiClock />;
      case "completed":
        return <FiCheckCircle />;
      case "cancelled":
        return <FiX />;
      default:
        return <FiClock />;
    }
  };

  if (loading) {
    return (
      <div className={s.loading}>
        <div className={s.spinner}>Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={s.error}>
        <h2>Booking Not Found</h2>
        <p>{error || "The requested booking could not be found."}</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className={s.confirmationPage}>
      <div className={s.container}>
        {/* Success Header */}
        <div className={s.successHeader}>
          <div className={s.successIcon}>
            <FiCheckCircle />
          </div>
          <h1>Booking Confirmed!</h1>
          <p>Your service has been successfully booked</p>
          <div className={s.bookingId}>
            Booking ID: <strong>{booking.bookingId}</strong>
          </div>
        </div>

        {/* Booking Status */}
        <div className={s.statusCard}>
          <div className={s.statusHeader}>
            <div
              className={s.statusBadge}
              style={{ "--status-color": getStatusColor(booking.status) }}>
              {getStatusIcon(booking.status)}
              <span>
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
            {/* <div className={s.statusActions}>
              <button className={s.actionBtn} onClick={handleShare}>
                <FiShare2 />
                Share
              </button>
              <button className={s.actionBtn}>
                <FiDownload />
                Download
              </button>
            </div> */}
          </div>

          {booking.status === "pending" && (
            <div className={s.statusMessage}>
              <p>
                Your booking is awaiting confirmation from the service provider.
                You'll receive a notification once confirmed.
              </p>
            </div>
          )}
        </div>

        <div className={s.content}>
          {/* Service Details */}
          <div className={s.detailsCard}>
            <h2>Service Details</h2>
            <div className={s.serviceInfo}>
              <div className={s.serviceImageContainer}>
                <img
                  src={
                    booking.service?.images?.[0]?.url ||
                    "https://via.placeholder.com/80"
                  }
                  alt={booking.service?.name}
                  className={s.serviceImage}
                />
              </div>
              <div className={s.serviceDetails}>
                <h3>{booking.service?.name || booking.serviceDetails?.name}</h3>
                <p className={s.category}>
                  {booking.service?.category ||
                    booking.serviceDetails?.category}
                </p>
                <div className={s.servicePrice}>
                  {formatPrice(booking.pricing?.totalAmount || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className={s.detailsCard}>
            <h2>Service Provider</h2>
            <div className={s.providerInfo}>
              <div className={s.providerAvatar}>
                {/* {booking.provider?.avatar?.url ? (
                  <img src={booking.provider.avatar.url} alt={booking.provider.name} />
                ) : (
                  <span>{booking.provider?.name?.charAt(0) || 'P'}</span>
                )} */}
                <span>S</span>
              </div>
              <div className={s.providerDetails}>
                {/* <h3>{booking.provider?.name || 'Service Provider'}</h3> */}
                <h3>Sourav Das</h3>
                {/* <div className={s.providerRating}>
                  <FiStar className={s.star} />
                  <span>{booking.provider?.ratings?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className={s.reviewCount}>
                    ({booking.provider?.ratings?.totalReviews || 0} reviews)
                  </span>
                </div> */}
                <div className={s.providerActions}>
                  <a href="tel:+916289795827">
                    <button className={s.contactBtn}>
                      <FiPhone />
                      Call
                    </button>
                  </a>
                  <a
                    href="https://wa.me/916289795827"
                    target="_blank"
                    rel="noopener noreferrer">
                    <button className={s.contactBtn}>
                      <FiMessageCircle />
                      Message
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className={s.detailsCard}>
            <h2>Schedule</h2>
            <div className={s.scheduleInfo}>
              <div className={s.scheduleItem}>
                <FiCalendar className={s.scheduleIcon} />
                <div>
                  <strong>Date</strong>
                  <p>{formatDate(booking.scheduling?.preferredDate)}</p>
                </div>
              </div>
              <div className={s.scheduleItem}>
                <FiClock className={s.scheduleIcon} />
                <div>
                  <strong>Time</strong>
                  <p>{booking.scheduling?.preferredTimeSlot}</p>
                </div>
              </div>
              <div className={s.scheduleItem}>
                <FiMapPin className={s.scheduleIcon} />
                <div>
                  <strong>Address</strong>
                  <p>
                    {booking.serviceAddress?.street},{" "}
                    {booking.serviceAddress?.city},<br />
                    {booking.serviceAddress?.state}{" "}
                    {booking.serviceAddress?.zipCode}
                  </p>
                  {booking.serviceAddress?.landmark && (
                    <p className={s.landmark}>
                      <strong>Landmark:</strong>{" "}
                      {booking.serviceAddress.landmark}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={s.detailsCard}>
            <h2>Contact Details</h2>
            <div className={s.contactInfo}>
              <div className={s.contactItem}>
                <FiPhone className={s.contactIcon} />
                <div>
                  <strong>Primary Phone</strong>
                  <p>{booking.customerInfo?.phone}</p>
                </div>
              </div>
              <div className={s.contactItem}>
                <FiMail className={s.contactIcon} />
                <div>
                  <strong>Email</strong>
                  <p>{booking.customerInfo?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className={s.detailsCard}>
            <h2>Price Breakdown</h2>
            <div className={s.priceBreakdown}>
              <div className={s.priceRow}>
                <span>Service Cost</span>
                <span>{formatPrice(booking.pricing?.baseAmount || 0)}</span>
              </div>
              {booking.pricing?.additionalCharges?.map((charge, index) => (
                <div key={index} className={s.priceRow}>
                  <span>{charge.description}</span>
                  <span>{formatPrice(charge.amount)}</span>
                </div>
              ))}
              {booking.pricing?.discount > 0 && (
                <div className={s.priceRow}>
                  <span>Discount</span>
                  <span className={s.discount}>
                    -{formatPrice(booking.pricing.discount)}
                  </span>
                </div>
              )}
              <div className={s.priceRow}>
                <span>Taxes</span>
                <span>{formatPrice(booking.pricing?.taxes?.total || 0)}</span>
              </div>
              <div className={`${s.priceRow} ${s.total}`}>
                <strong>Total Amount</strong>
                <strong>
                  {formatPrice(booking.pricing?.totalAmount || 0)}
                </strong>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className={s.detailsCard}>
            <h2>Payment Details</h2>
            <div className={s.paymentInfo}>
              <div className={s.paymentMethod}>
                <strong>Payment Method:</strong>
                <span className={s.method}>
                  {booking.payment?.method === "cash" && "Cash on Service"}
                  {booking.payment?.method === "card" && "Credit/Debit Card"}
                  {booking.payment?.method === "upi" && "UPI"}
                </span>
              </div>
              <div className={s.paymentStatus}>
                <strong>Payment Status:</strong>
                <span className={`${s.status} ${s[booking.payment?.status]}`}>
                  {booking.payment?.status?.charAt(0).toUpperCase() +
                    booking.payment?.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className={s.nextSteps}>
            <h2>What's Next?</h2>
            <div className={s.steps}>
              <div className={s.step}>
                <div className={s.stepNumber}>1</div>
                <div className={s.stepContent}>
                  <h3>Confirmation</h3>
                  <p>
                    The service provider will confirm your booking within 2
                    hours
                  </p>
                </div>
              </div>
              <div className={s.step}>
                <div className={s.stepNumber}>2</div>
                <div className={s.stepContent}>
                  <h3>Preparation</h3>
                  <p>Make sure the service area is accessible and ready</p>
                </div>
              </div>
              <div className={s.step}>
                <div className={s.stepNumber}>3</div>
                <div className={s.stepContent}>
                  <h3>Service Day</h3>
                  <p>The professional will arrive at your scheduled time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={s.actions}>
            <Link to="/" className={s.homeBtn}>
              <FiHome />
              Go Home
            </Link>
            {/* <Link to="/bookings" className={s.bookingsBtn}>
              View All Bookings
            </Link> */}
            <Link to="/contact" className={s.supportBtn}>
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
