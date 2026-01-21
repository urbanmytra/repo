import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import Navbar from "./includes/Navbar";
import Footer from "./includes/Footer";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* Existing Pages */
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Listing from "./pages/Listing";
import ServiceDetails from "./pages/ServiceDetails";
import FAQPage from "./pages/FAQ";

/* Authentication Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* Booking Pages */
import BookService from "./pages/BookService";
import BookingConfirmation from "./pages/BookingConfirmation";

/* User Dashboard Pages */
// import UserDashboard from "./pages/UserDashboard";
import UserBookings from "./pages/Bookings";
// import UserProfile from "./pages/UserProfile";
// import UserFavorites from "./pages/UserFavorites";

/* Utility Pages */
import NotFound from "./pages/NotFound";
// import TermsOfService from "./pages/TermsOfService";
// import PrivacyPolicy from "./pages/PrivacyPolicy";

function AppContent() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar
          theme={theme}
          resolvedTheme={resolvedTheme}
          toggleTheme={toggleTheme}
        />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQPage />} />
            {/* <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} /> */}

            {/* Service Routes */}
            <Route path="/services" element={<Listing />} />
            <Route path="/listing" element={<Listing />} />
            <Route path="/service/:id" element={<ServiceDetails />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />


            {/* Booking Routes - Protected */}
            <Route path="/book/:serviceId" element={
              <ProtectedRoute>
                <BookService />
              </ProtectedRoute>
            } />
            <Route path="/booking-confirmation/:bookingId" element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute>
                <UserBookings />
              </ProtectedRoute>
            } />

            {/* User Dashboard Routes - Protected */}
            {/* <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
          
            <Route path="/favorites" element={
              <ProtectedRoute>
                <UserFavorites />
              </ProtectedRoute>
            } /> */}

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;