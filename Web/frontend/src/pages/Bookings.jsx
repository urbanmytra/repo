// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { bookingsAPI, apiUtils } from "../config/api";
import s from "../assets/css/pages/Bookings.module.css";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiX,
  FiPackage,
  FiChevronRight,
  FiFilter,
  FiSearch,
} from "react-icons/fi";

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [statusFilter, searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await bookingsAPI.getAllBookings();
      const result = apiUtils.formatResponse(response);

      if (result.success) {
        setBookings(result.data);
        setFilteredBookings(result.data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status === statusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.serviceDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
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
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  const handleBookingClick = (bookingId) => {
    navigate(`/booking-confirmation/${bookingId}`);
  };

  if (loading) {
    return (
      <div className={s.loading}>
        <div className={s.spinner}>Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.error}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchBookings}>Try Again</button>
      </div>
    );
  }

  return (
    <div className={s.bookingsPage}>
      <div className={s.container}>
        {/* Header */}
        <div className={s.header}>
          <button className={s.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back
          </button>
          <div className={s.headerContent}>
            <h1>My Bookings</h1>
            <p>View and manage all your service bookings</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={s.controls}>
          <div className={s.searchBox}>
            <FiSearch className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search by booking ID or service name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={s.searchInput}
            />
          </div>

          <div className={s.filters}>
            <button
              className={`${s.filterBtn} ${statusFilter === "all" ? s.active : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`${s.filterBtn} ${statusFilter === "pending" ? s.active : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`${s.filterBtn} ${statusFilter === "confirmed" ? s.active : ""}`}
              onClick={() => setStatusFilter("confirmed")}
            >
              Confirmed
            </button>
            <button
              className={`${s.filterBtn} ${statusFilter === "completed" ? s.active : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </button>
            <button
              className={`${s.filterBtn} ${statusFilter === "cancelled" ? s.active : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Bookings Count */}
        <div className={s.bookingsCount}>
          {filteredBookings.length} {filteredBookings.length === 1 ? "Booking" : "Bookings"}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>
              <FiPackage />
            </div>
            <h2>No bookings found</h2>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't made any bookings yet"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link to="/" className={s.browseBtn}>
                Browse Services
              </Link>
            )}
          </div>
        ) : (
          <div className={s.bookingsList}>
            {filteredBookings.map((booking) => (
              <div
                key={booking._id || booking.bookingId}
                className={s.bookingCard}
                onClick={() => handleBookingClick(booking._id || booking.bookingId)}
              >
                <div className={s.bookingHeader}>
                  <div className={s.bookingId}>
                    <span className={s.label}>Booking ID:</span>
                    <span className={s.value}>{booking.bookingId}</span>
                  </div>
                  <div
                    className={s.statusBadge}
                    style={{ "--status-color": getStatusColor(booking.status) }}
                  >
                    {getStatusIcon(booking.status)}
                    <span>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className={s.bookingContent}>
                  <div className={s.serviceSection}>
                    <div className={s.serviceImageContainer}>
                      <img
                        src={
                          booking.service?.images?.[0]?.url ||
                          booking.serviceDetails?.images?.[0]?.url ||
                          "https://via.placeholder.com/80"
                        }
                        alt={booking.service?.name || booking.serviceDetails?.name}
                        className={s.serviceImage}
                      />
                    </div>
                    <div className={s.serviceInfo}>
                      <h3 className={s.serviceName}>
                        {booking.service?.name || booking.serviceDetails?.name}
                      </h3>
                      <p className={s.serviceCategory}>
                        {booking.service?.category || booking.serviceDetails?.category}
                      </p>
                    </div>
                  </div>

                  <div className={s.bookingDetails}>
                    <div className={s.detailItem}>
                      <FiCalendar className={s.detailIcon} />
                      <span>{formatDate(booking.scheduling?.preferredDate)}</span>
                    </div>
                    <div className={s.detailItem}>
                      <FiClock className={s.detailIcon} />
                      <span>{booking.scheduling?.preferredTimeSlot}</span>
                    </div>
                    <div className={s.detailItem}>
                      <FiMapPin className={s.detailIcon} />
                      <span>
                        {booking.serviceAddress?.city}, {booking.serviceAddress?.state}
                      </span>
                    </div>
                  </div>

                  <div className={s.bookingFooter}>
                    <div className={s.price}>
                      {formatPrice(booking.pricing?.totalAmount || 0)}
                    </div>
                    <div className={s.viewDetails}>
                      View Details
                      <FiChevronRight />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}