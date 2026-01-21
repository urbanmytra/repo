import React, { useState, useEffect } from "react";
import {
  FiX,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUser,
  FiDollarSign,
  FiMessageCircle,
  FiEdit,
  FiLoader,
  FiStar,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { bookingsAPI } from "../../utils/api";
import styles from "../../styles/Bookings/BookingDetails.module.css";

export default function BookingDetails({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking?.status || "pending");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingNote, setAddingNote] = useState(false); // ✅ ADD THIS LINE
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [bookingNotes, setBookingNotes] = useState([]); // ✅ ADD THIS LINE
  const [error, setError] = useState(null); // ✅ ADD THIS LINE
  const [success, setSuccess] = useState(null); // ✅ ADD THIS LINE

  const statusOptions = [
    { value: "pending", label: "Pending", color: "orange" },
    { value: "confirmed", label: "Confirmed", color: "blue" },
    { value: "in-progress", label: "In Progress", color: "purple" },
    { value: "completed", label: "Completed", color: "green" },
    { value: "cancelled", label: "Cancelled", color: "red" },
  ];

  useEffect(() => {
    if (booking) {
      setStatus(booking.status || "pending");
      setBookingNotes(booking.notes || []);
      loadMessages();
    }
  }, [booking]);

  const loadMessages = async () => {
    if (!booking?._id) return;

    try {
      // Load messages for this booking
      // const response = await bookingsAPI.getBookingMessages(booking._id);
      // if (response.success) {
      //   setMessages(response.data);
      // }

      // Mock messages for now
      setMessages(booking.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!booking?._id) return;

    try {
      setLoading(true);
      setError(null); // ✅ Add this

      const updateData = {
        status,
      };

      await onUpdate(updateData);
      setSuccess("Booking status updated successfully"); // ✅ Add this

      setTimeout(() => setSuccess(null), 3000); // ✅ Add this
    } catch (error) {
      console.error("Failed to update booking:", error);
      setError(error.message || "Failed to update booking"); // ✅ Add this
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!notes.trim() || !booking?._id) {
      setError("Please enter a note");
      return;
    }

    try {
      setAddingNote(true);
      setError(null);

      const response = await bookingsAPI.addNote(booking._id, {
        content: notes.trim(),
        author: "Admin",
      });

      if (response.success) {
        const newNote = {
          content: notes.trim(),
          author: "Admin",
          createdAt: new Date().toISOString(),
          id: Date.now(),
        };

        setBookingNotes((prev) => [...prev, newNote]);
        setNotes("");
        setSuccess("Note added successfully");

        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || "Failed to add note");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
      setError(error.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !booking?._id) return;

    try {
      setLoading(true);
      setError(null); // ✅ Add this

      const response = await bookingsAPI.addMessage(booking._id, {
        message: newMessage.trim(),
        sender: "admin",
      });

      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage("");
        setSuccess("Message sent successfully"); // ✅ Add this
        setTimeout(() => setSuccess(null), 3000); // ✅ Add this
      } else {
        throw new Error(response.error || "Failed to send message"); // ✅ Add this
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(error.message || "Failed to send message"); // ✅ Changed from string to use error.message
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Not specified";

    const date = new Date(dateValue);
    if (isNaN(date)) return "Invalid date";

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not specified";

    // If it's an object (like booking.scheduling), try to extract a date field
    if (typeof dateValue === "object") {
      if (dateValue.date) dateValue = dateValue.date;
      else if (dateValue.start) dateValue = dateValue.start;
      else dateValue = String(dateValue);
    }

    const date = new Date(dateValue);
    if (isNaN(date)) return "Invalid date";

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "Not specified";

    // Handle non-string types safely
    if (typeof timeValue === "object") {
      if (timeValue.time) timeValue = timeValue.time;
      else if (timeValue.dateTime) timeValue = timeValue.dateTime;
      else if (timeValue.start) timeValue = timeValue.start;
      else timeValue = String(timeValue);
    } else if (typeof timeValue !== "string") {
      timeValue = String(timeValue);
    }

    // Detect simple time strings like "14:30" or "08:15 AM"
    const isOnlyTime = /^[0-9]{1,2}:[0-9]{2}(\s?[APMapm]{2})?$/.test(timeValue);
    if (isOnlyTime) return timeValue;

    const date = new Date(timeValue);
    if (isNaN(date)) return "Invalid time";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock />;
      case "confirmed":
        return <FiCheckCircle />;
      case "in-progress":
        return <FiTruck />;
      case "completed":
        return <FiCheckCircle />;
      case "cancelled":
        return <FiX />;
      default:
        return <FiClock />;
    }
  };

  if (!booking) return null;

  return (
    <div className={styles.modalOverlay}>
      {/* Alert Messages */}
      {/* {error && (
  <div className={styles.alertError}>
    <FiAlertCircle />
    <span>{error}</span>
    <button onClick={() => setError(null)}>
      <FiX />
    </button>
  </div>
)}
{success && (
  <div className={styles.alertSuccess}>
    <FiCheckCircle />
    <span>{success}</span>
    <button onClick={() => setSuccess(null)}>
      <FiX />
    </button>
  </div>
)} */}

      <div className={styles.bookingDetailsModal}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>Booking Details</h2>
            <div className={styles.bookingId}>
              ID: {booking.bookingId || booking._id?.substring(0, 8) || "N/A"}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.bookingInfoGrid}>
            {/* Customer Information */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <FiUser />
                Customer Information
              </h3>
              <div className={styles.customerCard}>
                <div className={`${styles.customerAvatar} ${styles.large}`}>
                  {booking.user?.name?.charAt(0) || "U"}
                </div>
                <div className={styles.customerDetails}>
                  <h4>{booking.user?.name || "Unknown User"}</h4>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <FiPhone />
                      <span>
                        {booking.user?.phone ||
                          booking.contactInfo?.phone ||
                          "Not provided"}
                      </span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiMail />
                      <span>
                        {booking.user?.email ||
                          booking.contactInfo?.email ||
                          "Not provided"}
                      </span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiMapPin />
                      <span>
                        {booking?.serviceAddress
                          ? `${
                              booking.serviceAddress.street
                                ? booking.serviceAddress.street + ", "
                                : ""
                            }${booking.serviceAddress.city}, ${
                              booking.serviceAddress.state
                            } ${booking.serviceAddress.zipCode || ""}`.trim()
                          : booking.location || "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <FiCalendar />
                Service Information
              </h3>
              <div className={styles.serviceDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Service:</span>
                  <span className={styles.detailValue}>
                    {booking.service?.name || "Service not found"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category:</span>
                  <span className={styles.detailValue}>
                    {booking.service?.category || "Not specified"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Provider:</span>
                  <span className={styles.detailValue}>
                    {/* {booking.provider?.name || "Not assigned"} */}
                    Sourav Das
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Scheduled Date:</span>
                  <span className={styles.detailValue}>
                    {formatDate(booking?.scheduling.preferredDate)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Scheduled Time:</span>
                  <span className={styles.detailValue}>
                    <FiClock />
                    {booking?.scheduling.preferredTimeSlot ||
                      formatTime(
                        booking?.scheduledTime ||
                          booking?.scheduledDate ||
                          booking?.scheduling
                      )}
                  </span>
                </div>
                {/* <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duration:</span>
                  <span className={styles.detailValue}>
                    {booking.service?.duration ||
                      booking.scheduling?.duration ||
                      "Not specified"}
                  </span>
                </div> */}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Created:</span>
                  <span className={styles.detailValue}>
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                Pricing Details
              </h3>
              <div className={styles.pricingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Base Price:</span>
                  <span className={styles.detailValue}>
                    ₹
                    {(
                      booking.pricing?.basePrice ||
                      booking.service?.pricing?.basePrice ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                {booking.pricing?.additionalCharges > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>
                      Additional Charges:
                    </span>
                    <span className={styles.detailValue}>
                      ₹{booking.pricing.additionalCharges.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.pricing?.discount > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Discount:</span>
                    <span
                      className={`${styles.detailValue} ${styles.discount}`}>
                      -₹{booking.pricing.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.pricing?.tax > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Tax:</span>
                    <span className={styles.detailValue}>
                      ₹{booking.pricing.tax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className={`${styles.detailRow} ${styles.total}`}>
                  <span className={styles.detailLabel}>Total Amount:</span>
                  <span className={`${styles.detailValue} ${styles.amount}`}>
                  ₹
                    {(
                      booking.pricing?.totalAmount ||
                      booking.amount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment Status:</span>
                  <span
                    className={`${styles.statusBadge} ${
                      booking.paymentStatus || "pending"
                    }`}>
                    {booking.paymentStatus || "pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Status and Actions */}
            <div className={`${styles.infoSection} ${styles.fullWidth}`}>
              <h3 className={styles.sectionTitle}>
                <FiEdit />
                Status Management
              </h3>
              <div className={styles.statusControls}>
                <div className={styles.currentStatus}>
                  <span className={styles.statusLabel}>Current Status:</span>
                  <div className={styles.statusDisplay}>
                    {getStatusIcon(booking.status)}
                    <span
                      className={`${styles.statusBadge} ${
                        statusOptions.find((s) => s.value === booking.status)
                          ?.color
                      }`}>
                      {
                        statusOptions.find((s) => s.value === booking.status)
                          ?.label
                      }
                    </span>
                  </div>
                </div>

                <div className={styles.statusUpdate}>
                  <label className={styles.formLabel}>Update Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={styles.statusSelect}
                    disabled={loading}>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* <div className={styles.notesSection}>
                <label className={styles.formLabel}>
                  <FiFileText />
                  Add Note:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or comments about this booking..."
                  className={styles.notesTextarea}
                  rows={3}
                  disabled={addingNote}
                />
                <button
                  className={`${styles.addNoteBtn} btn btn-outline`}
                  onClick={handleAddNote}
                  disabled={!notes.trim() || addingNote}>
                  {addingNote ? (
                    <>
                      <FiLoader className={styles.spinning} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiFileText />
                      Add Note
                    </>
                  )}
                </button>
              </div> */}

              {/* {bookingNotes && bookingNotes.length > 0 && (
                <div className={styles.previousNotes}>
                  <h4>
                    <FiFileText />
                    Notes History ({bookingNotes.length})
                  </h4>
                  <div className={styles.notesList}>
                    {bookingNotes.map((note, index) => (
                      <div key={note.id || index} className={styles.noteItem}>
                        <div className={styles.noteMeta}>
                          <span className={styles.noteAuthor}>
                            {note.author || "Admin"}
                          </span>
                          <span className={styles.noteDate}>
                            {formatDateTime(note.createdAt || note.date)}
                          </span>
                        </div>
                        <p className={styles.noteContent}>
                          {note.content || note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>

            {/* Messages/Communication */}
            {/* <div className={`${styles.infoSection} ${styles.fullWidth}`}>
              <h3 className={styles.sectionTitle}>
                <FiMessageCircle />
                Messages & Communication
              </h3>
              
              <div className={styles.messagesContainer}>
                {messages.length > 0 ? (
                  <div className={styles.messagesList}>
                    {messages.map((message, index) => (
                      <div key={index} className={`${styles.messageItem} ${message.sender === 'admin' ? styles.admin : styles.user}`}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageSender}>
                            {message.sender === 'admin' ? 'Admin' : booking.user?.name || 'User'}
                          </span>
                          <span className={styles.messageTime}>
                            {formatDate(message.createdAt || message.timestamp)}
                          </span>
                        </div>
                        <p className={styles.messageContent}>{message.content || message.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyMessages}>
                    <p>No messages yet</p>
                  </div>
                )}
                
                <div className={styles.messageInput}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message to the customer..."
                    className={styles.messageTextarea}
                    rows={2}
                    disabled={loading}
                  />
                  <button 
                    className={styles.sendMessageBtn}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading}
                  >
                    {loading ? <FiLoader className={styles.spinning} /> : <FiMessageCircle />}
                    Send
                  </button>
                </div>
              </div>
            </div> */}

            {/* Rating & Review (if completed) */}
            {/* {booking.status === 'completed' && booking.rating && (
              <div className={`${styles.infoSection} ${styles.fullWidth}`}>
                <h3 className={styles.sectionTitle}>
                  <FiStar />
                  Customer Feedback
                </h3>
                <div className={styles.feedbackContent}>
                  <div className={styles.ratingDisplay}>
                    <span className={styles.ratingLabel}>Rating:</span>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`${styles.star} ${i < booking.rating ? styles.filled : ''}`} 
                        />
                      ))}
                    </div>
                    <span className={styles.ratingValue}>({booking.rating}/5)</span>
                  </div>
                  {booking.review && (
                    <div className={styles.reviewContent}>
                      <span className={styles.reviewLabel}>Review:</span>
                      <p className={styles.reviewText}>{booking.review}</p>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdateStatus}
            disabled={loading || status === booking.status}>
            {loading ? (
              <>
                <FiLoader className={styles.spinning} />
                Updating...
              </>
            ) : (
              "Update Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
