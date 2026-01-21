import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiUser,
  FiLock,
  FiBell,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiMail,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { adminAPI } from "../utils/api";
import { useAuth } from "../components/Auth/AuthProvider";
import styles from '../styles/pages/Settings.module.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { user, updateProfile, changePassword } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();

      if (response.success) {
        setSettings({
          siteName: response.data.general?.siteName || "LG Smart Services",
          siteDescription:
            response.data.general?.siteDescription ||
            "Professional home services platform",
          contactEmail:
            response.data.general?.contactEmail || "admin@bagajatin.com",
          contactPhone: response.data.general?.contactPhone || "+91 98765 43210",
          address:
            response.data.general?.address ||
            "123 Tech Street, Smart City, SC 12345",

          adminName: user?.name || "Admin User",
          adminEmail: user?.email || "admin@bagajatin.com",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",

          emailNotifications:
            response.data.notifications?.emailNotifications ?? true,
          smsNotifications:
            response.data.notifications?.smsNotifications ?? false,
          pushNotifications:
            response.data.notifications?.pushNotifications ?? true,
          marketingEmails:
            response.data.notifications?.marketingEmails ?? false,
          newBookingAlert:
            response.data.notifications?.newBookingAlert ?? true,
          paymentAlert: response.data.notifications?.paymentAlert ?? true,
          reviewAlert: response.data.notifications?.reviewAlert ?? true,

          twoFactorAuth: response.data.security?.twoFactorAuth ?? false,
          sessionTimeout: response.data.security?.sessionTimeout ?? 30,
          passwordExpiry: response.data.security?.passwordExpiry ?? 90,
          loginAttempts: response.data.security?.loginAttempts ?? 5,

          maintenanceMode: response.data.system?.maintenanceMode ?? false,
          debugMode: response.data.system?.debugMode ?? false,
          cacheEnabled: response.data.system?.cacheEnabled ?? true,
          autoBackup: response.data.system?.autoBackup ?? true,
          backupFrequency: response.data.system?.backupFrequency || "daily",
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      showMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.updateSettings(settings);

      if (response.success) {
        showMessage("success", "Settings updated successfully!");
      } else {
        showMessage("error", response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Save error:", error);
      showMessage("error", "An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    loadSettings();
    showMessage("info", "Settings reset to last saved values");
  };

  const tabs = [
    { id: "general", label: "General", icon: FiGlobe },
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiShield },
    { id: "system", label: "System", icon: FiDatabase },
  ];

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className="page-header">
        <h1>Settings</h1>
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === "success" && <FiCheck />}
            {message.type === "error" && <FiAlertCircle />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      <div className={styles.settingsContainer}>
        <aside className={styles.settingsSidebar}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.settingsTab} ${
                  activeTab === tab.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon /> {tab.label}
              </button>
            );
          })}
        </aside>

        <main className={styles.settingsMain}>
          {/* ✅ reuse your second-version tab UI here */}
          {/* You can drop in your existing JSX for each tab (general, profile, notifications, etc.)
              and just wire inputs with handleSettingChange(key, value) */}
        </main>
      </div>

      <div className={styles.settingsFooter}>
        <button className="btn btn-outline" onClick={resetSettings}>
          <FiRefreshCw /> Reset
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          <FiSave /> {saving ? "Saving..." : "Save All"}
        </button>
      </div>
    </div>
  );
}