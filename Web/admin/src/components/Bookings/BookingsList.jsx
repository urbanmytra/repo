import React, { useState } from "react";
import {
  FiEye,
  FiEdit,
  FiPhone,
  FiMapPin,
  FiClock,
  FiUser,
  FiMoreVertical,
  FiRefreshCw,
  FiDownload,
  FiMessageCircle,
} from "react-icons/fi";
import styles from "../../styles/Bookings/BookingsList.module.css";

const statusConfig = {
  pending: { color: "orange", label: "Pending" },
  confirmed: { color: "blue", label: "Confirmed" },
  "in-progress": { color: "purple", label: "In Progress" },
  completed: { color: "green", label: "Completed" },
  cancelled: { color: "red", label: "Cancelled" },
};

export default function BookingsList({
  bookings = [],
  loading,
  error,
  pagination = {},
  onPageChange,
  onRefresh,
  onViewDetails,
  onUpdateStatus,
  onExport,
}) {
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const handleSelectBooking = (bookingId) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBookings.size === bookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map((b) => b._id)));
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    try {
      await onUpdateStatus(booking._id, { status: newStatus });
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleBulkExport = () => {
    if (selectedBookings.size === 0) {
      onExport();
    } else {
      const selectedBookingData = bookings.filter((b) =>
        selectedBookings.has(b._id)
      );
      onExport(selectedBookingData);
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`${styles.statusBadge} ${styles[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const isOnlyTime = /^[0-9]{1,2}:[0-9]{2}(\s?[APMapm]{2})?$/.test(
      timeString
    );
    if (isOnlyTime) return timeString;

    const date = new Date(timeString);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className={styles.bookingsList}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <FiRefreshCw className={styles.spinning} />
            <p>Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.bookingsList}>
        <div className={styles.errorContainer}>
          <p>Error loading bookings: {error}</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookingsList}>
      <div className={styles.listHeader}>
        <div className={styles.headerLeft}>
          <h3>All Bookings ({pagination.total || bookings.length})</h3>
          {selectedBookings.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                {selectedBookings.size} selected
              </span>
              <button
                className={styles.bulkActionBtn}
                onClick={handleBulkExport}>
                <FiDownload />
                Export Selected
              </button>
            </div>
          )}
        </div>

        <div className={styles.listControls}>
          <button className="btn btn-outline" onClick={onRefresh}>
            <FiRefreshCw />
            Refresh
          </button>
          {/* <button className="btn btn-outline" onClick={handleBulkExport}>
            <FiDownload />
            Export All
          </button> */}
        </div>
      </div>

      <div className={styles.bookingsTable}>
        <div className={styles.tableHeader}>
          <div className={`${styles.headerCell} ${styles.checkbox}`}>
            <input
              type="checkbox"
              checked={
                selectedBookings.size === bookings.length && bookings.length > 0
              }
              onChange={handleSelectAll}
            />
          </div>
          <div className={styles.headerCell}>Booking ID</div>
          <div className={styles.headerCell}>Customer</div>
          <div className={styles.headerCell}>Service</div>
          {/* <div className={styles.headerCell}>Provider</div> */}
          <div className={styles.headerCell}>Date & Time</div>
          <div className={styles.headerCell}>Amount</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        <div className="table-body">
          {bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No bookings found</p>
              <p className={styles.emptySubtitle}>
                Try adjusting your filters or refresh the page
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.checkbox}`}>
                  <input
                    type="checkbox"
                    checked={selectedBookings.has(booking._id)}
                    onChange={() => handleSelectBooking(booking._id)}
                  />
                </div>

                <div className={styles.tableCell}>
                  <span className={styles.bookingId}>
                    {booking.bookingId || booking._id?.substring(0, 8) || "N/A"}
                  </span>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerAvatar}>
                      {booking.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className={styles.customerDetails}>
                      <div className={styles.customerName}>
                        {booking.user?.name || "Unknown User"}
                      </div>
                      <div className={styles.customerContact}>
                        <FiPhone size={12} />
                        {booking.user?.phone ||
                          booking.contactInfo?.phone ||
                          "No phone"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.serviceInfo}>
                    <div className={styles.serviceName}>
                      {booking.service?.name || "Service not found"}
                    </div>
                    {/* <div className={styles.serviceLocation}>
                      <FiMapPin size={12} />
                      {booking.address ? 
                        `${booking.address.city}, ${booking.address.state}` :
                        booking.location || 'Location not specified'
                      }
                    </div> */}
                  </div>
                </div>

                {/* <div className={styles.tableCell}>
                  <div className={styles.providerInfo}>
                    <div className={styles.providerAvatar}>
                      {booking.provider?.name?.charAt(0) || 'P'}
                    </div>
                    <span className={styles.providerName}>
                      {booking.provider?.name || 'Not assigned'}
                    </span>
                  </div>
                </div> */}

                <div className={styles.tableCell}>
                  <div className={styles.datetimeInfo}>
                    <div className={styles.bookingDate}>
                      {formatDate(booking.scheduledDate || booking.createdAt)}
                    </div>
                    <div className={styles.bookingTime}>
                      <FiClock size={12} />
                      {formatTime(
                        booking.scheduledTime ||
                          booking.scheduledDate ||
                          booking.createdAt
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <span className={styles.bookingAmount}>
                    ₹
                    {(
                      booking.pricing?.totalAmount ||
                      booking.amount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className={styles.tableCell}>
                  {getStatusBadge(booking.status)}
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionBtn} ${styles.view}`}
                      title="View Details"
                      onClick={() => onViewDetails(booking)}>
                      <FiEye />
                    </button>

                    {booking.messages?.length > 0 && (
                      <button
                        className={`${styles.actionBtn} ${styles.message}`}
                        title="View Messages">
                        <FiMessageCircle />
                      </button>
                    )}

                    <div className={styles.actionMenu}>
                      <button
                        className={`${styles.actionBtn} ${styles.more}`}
                        title="More Options"
                        onClick={() =>
                          setActionMenuOpen(
                            actionMenuOpen === booking._id ? null : booking._id
                          )
                        }>
                        <FiMoreVertical />
                      </button>

                      {actionMenuOpen === booking._id && (
                        <div className={styles.actionDropdown}>
                          {booking.status === "pending" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking, "confirmed")
                              }
                              className={styles.dropdownItem}>
                              Confirm Booking
                            </button>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking, "in-progress")
                              }
                              className={styles.dropdownItem}>
                              Start Service
                            </button>
                          )}
                          {booking.status === "in-progress" && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking, "completed")
                              }
                              className={styles.dropdownItem}>
                              Complete Service
                            </button>
                          )}
                          {["pending", "confirmed"].includes(
                            booking.status
                          ) && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking, "cancelled")
                              }
                              className={`${styles.dropdownItem} ${styles.danger}`}>
                              Cancel Booking
                            </button>
                          )}
                          <button
                            onClick={() => onViewDetails(booking)}
                            className={styles.dropdownItem}>
                            View Full Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={styles.tablePagination}>
          <div className={styles.paginationInfo}>
            Showing {(pagination.page - 1) * 10 + 1}-
            {Math.min(pagination.page * 10, pagination.total)} of{" "}
            {pagination.total} bookings
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationBtn}
              disabled={!pagination.hasPrev}
              onClick={() => handlePageClick(pagination.page - 1)}>
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum =
                pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
              if (pageNum <= pagination.pages) {
                return (
                  <button
                    key={pageNum}
                    className={`${styles.paginationBtn} ${
                      pageNum === pagination.page ? styles.active : ""
                    }`}
                    onClick={() => handlePageClick(pageNum)}>
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}

            <button
              className={styles.paginationBtn}
              disabled={!pagination.hasNext}
              onClick={() => handlePageClick(pagination.page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
