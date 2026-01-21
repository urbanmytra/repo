import React, { useState } from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiPlus,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import styles from '../../styles/Users/UsersList.module.css';

export default function UsersList({ 
  users = [], 
  loading, 
  error,
  pagination = {},
  filters,
  setFilters,
  onEdit, 
  onDelete, 
  onView, 
  onCreate,
  onRefresh
}) {
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) {
      try {
        for (const userId of selectedUsers) {
          const user = users.find(u => u._id === userId);
          if (user) {
            await onDelete(user);
          }
        }
        setSelectedUsers(new Set());
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.usersList}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <FiRefreshCw className={styles.spinning} />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.usersList}>
        <div className={styles.errorContainer}>
          <p>Error loading users: {error}</p>
          <button className="btn btn-primary" onClick={onRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usersList}>
      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchFilter}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterControls}>
          <select 
            value={filters.status || 'all'} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className={styles.filterInput}
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className={styles.filterInput}
            placeholder="End Date"
          />
          
          <select 
            value={filters.sortBy || 'createdAt'} 
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className={styles.sortSelect}
          >
            <option value="createdAt">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="stats.totalSpent">Sort by Total Spent</option>
            <option value="stats.totalBookings">Sort by Bookings</option>
          </select>
          
          <select 
            value={filters.order || 'desc'} 
            onChange={(e) => handleFilterChange('order', e.target.value)}
            className={styles.sortSelect}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className={styles.listHeader}>
        <div className={styles.headerLeft}>
          <h3>All Users ({pagination.total || users.length})</h3>
          {selectedUsers.size > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                {selectedUsers.size} selected
              </span>
              <button className={styles.bulkActionBtn} onClick={handleBulkDelete}>
                <FiTrash2 />
                Delete Selected
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.headerControls}>
          <button className="btn btn-outline" onClick={onRefresh}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={onCreate}>
            <FiPlus />
            Add User
          </button>
        </div>
      </div>

      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div className={`${styles.headerCell} ${styles.checkbox}`}>
            <input
              type="checkbox"
              checked={selectedUsers.size === users.length && users.length > 0}
              onChange={handleSelectAll}
            />
          </div>
          <div className={styles.headerCell}>User</div>
          <div className={styles.headerCell}>Contact</div>
          <div className={styles.headerCell}>Location</div>
          <div className={styles.headerCell}>Join Date</div>
          <div className={styles.headerCell}>Bookings</div>
          <div className={styles.headerCell}>Total Spent</div>
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Actions</div>
        </div>

        <div className="table-body">
          {users.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No users found</p>
              <button className="btn btn-primary" onClick={onCreate}>
                <FiPlus />
                Add First User
              </button>
            </div>
          ) : (
            users.map((user) => (
              <div key={user._id} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.checkbox}`}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user._id)}
                    onChange={() => handleSelectUser(user._id)}
                  />
                </div>
                
                <div className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <img 
                      src={user.avatar || user.profileImage || '/default-avatar.jpg'} 
                      alt={user.name}
                      className={styles.userAvatar}
                      onError={(e) => {
                        e.target.src = '/default-avatar.jpg';
                      }}
                    />
                    <div className={styles.userDetails}>
                      <h4 className={styles.userName}>{user.name}</h4>
                      <span className={styles.userId}>ID: {user._id?.substring(0, 8) || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.contactInfo}>
                                        <div className={styles.contactItem}>
                      <FiMail size={14} />
                      <span>{user.email}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiPhone size={14} />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.locationInfo}>
                    <FiMapPin size={14} />
                    <span>
                      {user.address ? 
                        `${user.address.city || ''}, ${user.address.state || ''}`.trim().replace(/^,|,$/g, '') || 'Not provided'
                        : user.location || 'Not provided'
                      }
                    </span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.dateInfo}>
                    <FiCalendar size={14} />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.bookingsCount}>
                    <span className={styles.countValue}>{user.stats?.totalBookings || 0}</span>
                    <span className={styles.countLabel}>bookings</span>
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.spentAmount}>
                    ₹{(user.stats?.totalSpent || 0).toLocaleString()}
                  </div>
                </div>

                <div className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${user.status || 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </div>

                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button 
                      className={`${styles.actionBtn} ${styles.view}`}
                      onClick={() => onView(user)}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.edit}`}
                      onClick={() => onEdit(user)}
                      title="Edit User"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => onDelete(user)}
                      title="Delete User"
                    >
                      <FiTrash2 />
                    </button>
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
            Showing {((pagination.page - 1) * filters.limit) + 1}-{Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total} users
          </div>
          <div className={styles.paginationControls}>
            <button 
              className={styles.paginationBtn} 
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
              if (pageNum <= pagination.pages) {
                return (
                  <button
                    key={pageNum}
                    className={`${styles.paginationBtn} ${pageNum === pagination.page ? styles.active : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            
            <button 
              className={styles.paginationBtn} 
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}