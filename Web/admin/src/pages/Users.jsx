import React, { useState, useEffect } from 'react';
import UsersList from '../components/Users/UsersList';
import UserForm from '../components/Users/UserForm';
import UserDetails from '../components/Users/UserDetails';
import { FiDownload, FiUpload, FiUserPlus, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { usersAPI } from '../utils/api';
import styles from '../styles/pages/Users.module.css';

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formMode, setFormMode] = useState('create');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      const response = await usersAPI.getUsers(params);
      
      if (response.success) {
        setUsers(response.data);
        setPagination({
          total: response.total,
          page: response.page || 1,
          pages: response.pages || 1,
                    hasNext: response.pagination?.next,
          hasPrev: response.pagination?.prev
        });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        const response = await usersAPI.deleteUser(user._id);
        if (response.success) {
          await loadUsers(); // Refresh the list
        }
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      let response;
      
      if (formMode === 'create') {
        response = await usersAPI.createUser(userData);
      } else {
        response = await usersAPI.updateUser(selectedUser._id, userData);
      }
      
      if (response.success) {
        await loadUsers(); // Refresh the list
        setShowForm(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save user: ' + error.message);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  const handleExport = async () => {
    try {
      const response = await usersAPI.getUsers({ 
        ...filters, 
        limit: 1000,
        export: true 
      });
      
      if (response.success) {
        const csvContent = convertUsersToCSV(response.data);
        downloadCSV(csvContent, `users-${Date.now()}.csv`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertUsersToCSV = (data) => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Status', 'Total Bookings', 'Total Spent', 'Joined'];
    const rows = data.map(user => [
      user.name,
      user.email,
      user.phone,
      `${user.address?.city || ''}, ${user.address?.state || ''}`.trim().replace(/^,|,$/g, '') || 'N/A',
      user.status,
      user.stats?.totalBookings || 0,
      `₹${user.stats?.totalSpent || 0}`,
      new Date(user.createdAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.usersPage}>
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage customer accounts and user information</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline" onClick={loadUsers}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-outline" onClick={handleExport}>
            <FiDownload />
            Export Users
          </button>
          <button className="btn btn-outline">
            <FiUpload />
            Import Users
          </button>
          <button className="btn btn-outline">
            <FiFilter />
            Advanced Filter
          </button>
        </div>
      </div>

      <div className={styles.usersContent}>
        <UsersList
          users={users}
          loading={loading}
          error={error}
          pagination={pagination}
          filters={filters}
          setFilters={setFilters}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onView={handleViewUser}
          onCreate={handleCreateUser}
          onRefresh={loadUsers}
        />
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={selectedUser}
          mode={formMode}
          onClose={handleCloseForm}
          onSave={handleSaveUser}
        />
      )}

      {/* User Details Modal */}
      {showDetails && (
        <UserDetails
          user={selectedUser}
          onClose={handleCloseDetails}
          onEdit={handleEditUser}
        />
      )}
    </div>
  );
}