// src/pages/BookService.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { servicesAPI, bookingsAPI, apiUtils } from "../config/api";
import s from "../assets/css/pages/BookService.module.css";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import QRImage from '../assets/images/QR.jpg';

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [bookingData, setBookingData] = useState({
    quantity: location.state?.quantity || 1,
    customerInfo: {
      name: "",
      email: "",
      phone: "",
      alternatePhone: "",
    },
    serviceAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      landmark: "",
      instructions: "",
    },
    scheduling: {
      preferredDate: "",
      preferredTimeSlot: "",
    },
    requirements: {
      specialInstructions: "",
      materials: [],
    },
    payment: {
      method: "cash",
    },
  });

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "01:00 PM - 03:00 PM",
    "03:00 PM - 05:00 PM",
    "05:00 PM - 07:00 PM",
    "07:00 PM - 09:00 PM",
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?return=${encodeURIComponent(location.pathname)}`);
      return;
    }

    fetchServiceDetails();
  }, [serviceId, isAuthenticated]);

  useEffect(() => {
    if (user) {
      // Pre-fill customer info from user data
      setBookingData((prev) => ({
        ...prev,
        customerInfo: {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          alternatePhone: prev.customerInfo.alternatePhone,
        },
        serviceAddress: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          landmark: prev.serviceAddress.landmark,
          instructions: prev.serviceAddress.instructions,
        },
      }));
    }
  }, [user]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getService(serviceId);
      const result = apiUtils.formatResponse(response);

      if (result.success) {
        setService(result.data);
      } else {
        navigate("/404");
      }
    } catch (error) {
      console.error("Failed to fetch service:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setBookingData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear errors
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    switch (stepNumber) {
      case 1: // Customer Info
        if (!bookingData.customerInfo.name.trim()) {
          newErrors["customerInfo.name"] = "Name is required";
        }
        if (!bookingData.customerInfo.email.trim()) {
          newErrors["customerInfo.email"] = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(bookingData.customerInfo.email)) {
          newErrors["customerInfo.email"] = "Invalid email format";
        }
        if (!bookingData.customerInfo.phone.trim()) {
          newErrors["customerInfo.phone"] = "Phone number is required";
        }
        break;

      case 2: // Service Address
        if (!bookingData.serviceAddress.street.trim()) {
          newErrors["serviceAddress.street"] = "Street address is required";
        }
        if (!bookingData.serviceAddress.city.trim()) {
          newErrors["serviceAddress.city"] = "City is required";
        }
        if (!bookingData.serviceAddress.state.trim()) {
          newErrors["serviceAddress.state"] = "State is required";
        }
        if (!bookingData.serviceAddress.zipCode.trim()) {
          newErrors["serviceAddress.zipCode"] = "ZIP code is required";
        }
        break;

      case 3: // Scheduling
        if (!bookingData.scheduling.preferredDate) {
          newErrors["scheduling.preferredDate"] = "Preferred date is required";
        } else {
          const selectedDate = new Date(bookingData.scheduling.preferredDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            newErrors["scheduling.preferredDate"] =
              "Date cannot be in the past";
          }
        }
        if (!bookingData.scheduling.preferredTimeSlot) {
          newErrors["scheduling.preferredTimeSlot"] = "Time slot is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const calculateTotal = () => {
    const basePrice =
      service?.pricing?.discountPrice || service?.pricing?.basePrice || 0;
    const visitCharge = 300;
    const subtotal = (basePrice * bookingData.quantity) + visitCharge;
    const subtotalWithVisit = subtotal + visitCharge;
    // const taxes = subtotal * 0.18; // 18% GST
    const taxes = 0;
    return {
      subtotal,
      taxes,
      total: subtotal + taxes,
    };
  };

  // src/pages/BookService.jsx - Update the handleBooking function

  const handleBooking = async () => {
    if (!validateStep(3)) return;

    try {
      setBookingLoading(true);
      setErrors({});

      const { subtotal, taxes, total } = calculateTotal();

      // Create a properly formatted booking payload
      const bookingPayload = {
        service: serviceId,
        customerInfo: {
          name: bookingData.customerInfo.name,
          email: bookingData.customerInfo.email,
          phone: bookingData.customerInfo.phone,
          alternatePhone: bookingData.customerInfo.alternatePhone || "",
        },
        serviceAddress: {
          street: bookingData.serviceAddress.street,
          city: bookingData.serviceAddress.city,
          state: bookingData.serviceAddress.state,
          zipCode: bookingData.serviceAddress.zipCode,
          landmark: bookingData.serviceAddress.landmark || "",
          instructions: bookingData.serviceAddress.instructions || "",
        },
        scheduling: {
          preferredDate: bookingData.scheduling.preferredDate,
          preferredTimeSlot: bookingData.scheduling.preferredTimeSlot,
        },
        requirements: {
          specialInstructions:
            bookingData.requirements.specialInstructions || "",
          materials: [],
        },
        pricing: {
          baseAmount: service.pricing?.basePrice || 0,
          additionalCharges: [],
          discount: 0,
          taxes: {
            total: taxes,
          },
          totalAmount: total,
        },
        payment: {
          method: bookingData.payment.method || "cash",
        },
      };

      console.log("Sending booking data:", bookingPayload);

      try {
        const response = await bookingsAPI.createBooking(bookingPayload);
        const result = apiUtils.formatResponse(response);

        if (result.success) {
          // Navigate to booking confirmation
          navigate(`/booking-confirmation/${result.data._id}`, {
            state: { booking: result.data },
          });
        } else {
          setErrors({
            submit: result.message || "Booking failed. Please try again.",
          });
        }
      } catch (error) {
        console.error("Booking failed:", error);

        let errorMessage = "Booking failed. Please try again.";

        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error("Booking preparation failed:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className={s.loading}>
        <div className={s.spinner}>Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={s.error}>
        <h2>Service not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const { subtotal, taxes, total } = calculateTotal();

  return (
    <div className={s.bookingPage}>
      <div className={s.container}>
        {/* Header */}
        <div className={s.header}>
          <button className={s.backBtn} onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back
          </button>
          <h1>Book Service</h1>
        </div>

        <div className={s.content}>
          {/* Service Summary */}
          <div className={s.serviceSummary}>
            <div className={s.serviceInfo}>
              <img
                src={
                  service.images?.[0]?.url ||
                  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E`
                }
                alt={service.name}
                className={s.serviceImage}
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='12' text-anchor='middle' alignment-baseline='middle' font-family='Arial, sans-serif' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E`;
                }}
              />
              <div className={s.serviceDetails}>
                <h3>{service.name}</h3>
                <p>{service.provider?.name}</p>
                <div className={s.servicePrice}>
                  {formatPrice(
                    service.pricing?.discountPrice ||
                      service.pricing?.basePrice,
                  )}
                  {service.pricing?.discountPrice && (
                    <span className={s.originalPrice}>
                      {formatPrice(service.pricing.basePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={s.bookingContent}>
            {/* Progress Steps */}
            <div className={s.progressSteps}>
              {[1, 2, 3, 4].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`${s.progressStep} ${
                    step >= stepNum ? s.active : ""
                  } ${step > stepNum ? s.completed : ""}`}>
                  <div className={s.stepNumber}>
                    {step > stepNum ?
                      <FiCheckCircle />
                    : stepNum}
                  </div>
                  <span className={s.stepLabel}>
                    {stepNum === 1 && "Contact Info"}
                    {stepNum === 2 && "Address"}
                    {stepNum === 3 && "Schedule"}
                    {stepNum === 4 && "Confirm"}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className={s.stepContent}>
              {step === 1 && (
                <div className={s.step}>
                  <h2>
                    <FiUser /> Contact Information
                  </h2>
                  <div className={s.form}>
                    <div className={s.formGroup}>
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={bookingData.customerInfo.name}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "name",
                            e.target.value,
                          )
                        }
                        className={errors["customerInfo.name"] ? s.error : ""}
                      />
                      {errors["customerInfo.name"] && (
                        <span className={s.errorText}>
                          {errors["customerInfo.name"]}
                        </span>
                      )}
                    </div>

                    <div className={s.formRow}>
                      <div className={s.formGroup}>
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={bookingData.customerInfo.email}
                          onChange={(e) =>
                            handleInputChange(
                              "customerInfo",
                              "email",
                              e.target.value,
                            )
                          }
                          className={
                            errors["customerInfo.email"] ? s.error : ""
                          }
                        />
                        {errors["customerInfo.email"] && (
                          <span className={s.errorText}>
                            {errors["customerInfo.email"]}
                          </span>
                        )}
                      </div>

                      <div className={s.formGroup}>
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={bookingData.customerInfo.phone}
                          onChange={(e) =>
                            handleInputChange(
                              "customerInfo",
                              "phone",
                              e.target.value,
                            )
                          }
                          className={
                            errors["customerInfo.phone"] ? s.error : ""
                          }
                        />
                        {errors["customerInfo.phone"] && (
                          <span className={s.errorText}>
                            {errors["customerInfo.phone"]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label>Alternate Phone</label>
                      <input
                        type="tel"
                        value={bookingData.customerInfo.alternatePhone}
                        onChange={(e) =>
                          handleInputChange(
                            "customerInfo",
                            "alternatePhone",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={s.step}>
                  <h2>
                    <FiMapPin /> Service Address
                  </h2>
                  <div className={s.form}>
                    <div className={s.formGroup}>
                      <label>Street Address *</label>
                      <input
                        type="text"
                        value={bookingData.serviceAddress.street}
                        onChange={(e) =>
                          handleInputChange(
                            "serviceAddress",
                            "street",
                            e.target.value,
                          )
                        }
                        className={
                          errors["serviceAddress.street"] ? s.error : ""
                        }
                        placeholder="House/Flat no, Building name, Street"
                      />
                      {errors["serviceAddress.street"] && (
                        <span className={s.errorText}>
                          {errors["serviceAddress.street"]}
                        </span>
                      )}
                    </div>

                    <div className={s.formRow}>
                      <div className={s.formGroup}>
                        <label>City *</label>
                        <input
                          type="text"
                          value={bookingData.serviceAddress.city}
                          onChange={(e) =>
                            handleInputChange(
                              "serviceAddress",
                              "city",
                              e.target.value,
                            )
                          }
                          className={
                            errors["serviceAddress.city"] ? s.error : ""
                          }
                        />
                        {errors["serviceAddress.city"] && (
                          <span className={s.errorText}>
                            {errors["serviceAddress.city"]}
                          </span>
                        )}
                      </div>

                      <div className={s.formGroup}>
                        <label>State *</label>
                        <input
                          type="text"
                          value={bookingData.serviceAddress.state}
                          onChange={(e) =>
                            handleInputChange(
                              "serviceAddress",
                              "state",
                              e.target.value,
                            )
                          }
                          className={
                            errors["serviceAddress.state"] ? s.error : ""
                          }
                        />
                        {errors["serviceAddress.state"] && (
                          <span className={s.errorText}>
                            {errors["serviceAddress.state"]}
                          </span>
                        )}
                      </div>

                      <div className={s.formGroup}>
                        <label>ZIP Code *</label>
                        <input
                          type="text"
                          value={bookingData.serviceAddress.zipCode}
                          onChange={(e) =>
                            handleInputChange(
                              "serviceAddress",
                              "zipCode",
                              e.target.value,
                            )
                          }
                          className={
                            errors["serviceAddress.zipCode"] ? s.error : ""
                          }
                        />
                        {errors["serviceAddress.zipCode"] && (
                          <span className={s.errorText}>
                            {errors["serviceAddress.zipCode"]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={s.formGroup}>
                      <label>Landmark</label>
                      <input
                        type="text"
                        value={bookingData.serviceAddress.landmark}
                        onChange={(e) =>
                          handleInputChange(
                            "serviceAddress",
                            "landmark",
                            e.target.value,
                          )
                        }
                        placeholder="Nearby landmark for easy location"
                      />
                    </div>

                    <div className={s.formGroup}>
                      <label>Special Instructions</label>
                      <textarea
                        value={bookingData.serviceAddress.instructions}
                        onChange={(e) =>
                          handleInputChange(
                            "serviceAddress",
                            "instructions",
                            e.target.value,
                          )
                        }
                        placeholder="Any special instructions for the service provider"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={s.step}>
                  <h2>
                    <FiCalendar /> Schedule Service
                  </h2>
                  <div className={s.form}>
                    <div className={s.formGroup}>
                      <label>Preferred Date *</label>
                      <input
                        type="date"
                        value={bookingData.scheduling.preferredDate}
                        onChange={(e) =>
                          handleInputChange(
                            "scheduling",
                            "preferredDate",
                            e.target.value,
                          )
                        }
                        className={
                          errors["scheduling.preferredDate"] ? s.error : ""
                        }
                        min={getMinDate()}
                      />
                      {errors["scheduling.preferredDate"] && (
                        <span className={s.errorText}>
                          {errors["scheduling.preferredDate"]}
                        </span>
                      )}
                    </div>

                    <div className={s.formGroup}>
                      <label>Preferred Time Slot *</label>
                      <div className={s.timeSlots}>
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`${s.timeSlot} ${
                              (
                                bookingData.scheduling.preferredTimeSlot ===
                                slot
                              ) ?
                                s.selected
                              : ""
                            }`}
                            onClick={() =>
                              handleInputChange(
                                "scheduling",
                                "preferredTimeSlot",
                                slot,
                              )
                            }>
                            <FiClock />
                            {slot}
                          </button>
                        ))}
                      </div>
                      {errors["scheduling.preferredTimeSlot"] && (
                        <span className={s.errorText}>
                          {errors["scheduling.preferredTimeSlot"]}
                        </span>
                      )}
                    </div>

                    {/* <div className={s.formGroup}>
                      <label>Quantity</label>
                      <div className={s.quantitySelector}>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingData((prev) => ({
                              ...prev,
                              quantity: Math.max(1, prev.quantity - 1),
                            }))
                          }
                          disabled={bookingData.quantity <= 1}>
                          -
                        </button>
                        <span>{bookingData.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setBookingData((prev) => ({
                              ...prev,
                              quantity: prev.quantity + 1,
                            }))
                          }>
                          +
                        </button>
                      </div>
                    </div> */}

                    <div className={s.formGroup}>
                      <label>Additional Requirements</label>
                      <textarea
                        value={bookingData.requirements.specialInstructions}
                        onChange={(e) =>
                          handleInputChange(
                            "requirements",
                            "specialInstructions",
                            e.target.value,
                          )
                        }
                        placeholder="Any special requirements or instructions for the service"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className={s.step}>
                  <h2>
                    <FiCheckCircle /> Booking Summary
                  </h2>

                  {/* Booking Details Summary */}
                  <div className={s.summary}>
                    <div className={s.summarySection}>
                      <h3>Service Details</h3>
                      <p>
                        <strong>Service:</strong> {service.name}
                      </p>
                      <p>
                        <strong>Provider:</strong> {service.provider?.name}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {bookingData.quantity}
                      </p>
                      <p>
                        <strong>Duration:</strong> {service.duration?.estimated}
                      </p>
                    </div>

                    <div className={s.summarySection}>
                      <h3>Contact Information</h3>
                      <p>
                        <strong>Name:</strong> {bookingData.customerInfo.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {bookingData.customerInfo.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {bookingData.customerInfo.phone}
                      </p>
                    </div>

                    <div className={s.summarySection}>
                      <h3>Service Address</h3>
                      <p>
                        {bookingData.serviceAddress.street},{" "}
                        {bookingData.serviceAddress.city},
                        {bookingData.serviceAddress.state}{" "}
                        {bookingData.serviceAddress.zipCode}
                      </p>
                      {bookingData.serviceAddress.landmark && (
                        <p>
                          <strong>Landmark:</strong>{" "}
                          {bookingData.serviceAddress.landmark}
                        </p>
                      )}
                    </div>

                    <div className={s.summarySection}>
                      <h3>Schedule</h3>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          bookingData.scheduling.preferredDate,
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {bookingData.scheduling.preferredTimeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className={s.paymentMethod}>
                    <h3>
                      <FiCreditCard /> Payment Method
                    </h3>
                    <div className={s.paymentOptions}>
                      <label className={s.paymentOption}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={bookingData.payment.method === "cash"}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "method",
                              e.target.value,
                            )
                          }
                        />
                        <span>Cash on Service</span>
                      </label>
                      {/* <label className={s.paymentOption}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={bookingData.payment.method === "card"}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "method",
                              e.target.value
                            )
                          }
                        />
                        <span>Credit/Debit Card</span>
                      </label> */}
                      <label className={s.paymentOption}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={bookingData.payment.method === "upi"}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "method",
                              e.target.value,
                            )
                          }
                        />
                        <span>UPI</span>
                      </label>
                      {bookingData.payment.method === "upi" && (
                        <div className={s.qrCodeContainer}>
                          <img
                            src={QRImage}
                            alt="UPI QR Code"
                            className={s.qrCode}
                          />
                          <p>Scan to pay via UPI</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className={s.priceBreakdown}>
                    <h3>Price Breakdown</h3>
                    <div className={s.priceRow}>
                      <span>Service Cost ({bookingData.quantity}x)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className={s.priceRow}>
                      <span>Visit Charge</span>
                      <span>{formatPrice(300)}</span>
                    </div>
                    {/* <div className={s.priceRow}>
                      <span>Taxes (18% GST)</span>
                      <span>{formatPrice(taxes)}</span>
                    </div> */}
                    <div className={`${s.priceRow} ${s.total}`}>
                      <strong>Total Amount</strong>
                      <strong>{formatPrice(total)}</strong>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className={s.errorAlert}>
                      <FiAlertCircle />
                      {errors.submit}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className={s.navigation}>
              {step > 1 && (
                <button
                  className={s.prevBtn}
                  onClick={handlePrevious}
                  disabled={bookingLoading}>
                  Previous
                </button>
              )}

              {step < 4 ?
                <button
                  className={s.nextBtn}
                  onClick={handleNext}
                  disabled={bookingLoading}>
                  Next
                </button>
              : <button
                  className={s.bookBtn}
                  onClick={handleBooking}
                  disabled={bookingLoading}>
                  {bookingLoading ?
                    "Booking..."
                  : `Confirm Booking - ${formatPrice(total)}`}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
