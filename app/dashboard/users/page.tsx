'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORDER_MANAGER' | 'ACCOUNTANT' | 'CEO' | 'MANAGER' | 'EXTENSION_OFFICER' | 'MARKETING_OFFICER' | 'CUSTOMER';
  center: 'KAHAMA' | 'SHINYANGA' | 'MAGANZO' | null;
  isActive: boolean;
}

export default function UserManagement() {
  // All hooks must be called at the top level
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ORDER_MANAGER' as User['role'],
    center: null as User['center']
  });
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Constants
  const usersPerPage = 10;
  const canAddUsers = true; // Temporarily show button for all roles for testing

  // Derived state
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Callbacks
  const getAuthHeaders = useCallback(() => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, router]);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Event handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Create payload by picking only the fields we need
      const userPayload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        center: newUser.center
      };
      
      const response = await fetch(`${process.env.BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      await fetchUsers();
      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ORDER_MANAGER',
        center: null
      });
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error instanceof Error ? error.message : 'Failed to add user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`${process.env.BASE_URL}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          center: editingUser.center,
          isActive: editingUser.isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const getActiveUsersCount = () => users.filter(user => user.isActive).length;

  const handleDeactivateUser = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const selectedUser = users.find(u => u.id === selectedUserId);
      if (!selectedUser) {
        throw new Error('User not found');
      }

      // If user is active, we deactivate. If user is inactive, we activate.
      const action = selectedUser.isActive ? 'deactivate' : 'activate';
      const endpoint = `${process.env.BASE_URL}/users/${selectedUserId}/${action}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to ${action} user`);
      }

      setIsDeactivateModalOpen(false);
      setSelectedUserId('');
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/users/${selectedUserId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: passwordData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setShowChangePasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setError('');
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  return (
    <div className="p-6">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage system users and their permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </div>
            <div className="p-3 rounded-full bg-indigo-100">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        {/* Active Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="text-2xl font-bold text-gray-900">{getActiveUsersCount()}</div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Kahama Center Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div>
            <div className="text-sm text-gray-500">Kahama Center</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.center === 'KAHAMA').length}
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Shinyanga Center Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div>
            <div className="text-sm text-gray-500">Shinyanga Center</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.center === 'SHINYANGA').length}
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <UserGroupIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Maganzo Center Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div>
            <div className="text-sm text-gray-500">Maganzo Center</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(user => user.center === 'MAGANZO').length}
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <UserGroupIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">User List</h2>
          {canAddUsers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New User
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.center ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.center}
                          </span>
                        ) : (
                          <span className="text-gray-500">No Center</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsDeactivateModalOpen(true);
                        }}
                        className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowChangePasswordModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Change Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, users.length)} of {users.length} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-[600px] shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {error && (
              <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleEditUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as User['role'] })}
                    required
                  >
                    <option value="ORDER_MANAGER">Order Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="CEO">CEO</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Center
                  </label>
                  <select
                    className="w-full p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={editingUser.center || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, center: e.target.value as User['center'] })}
                  >
                    <option value="">No Center</option>
                    <option value="KAHAMA">Kahama</option>
                    <option value="SHINYANGA">Shinyanga</option>
                    <option value="MAGANZO">Maganzo</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded text-gray-900"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                />
                <label className="ml-2 text-sm text-gray-900">Active</label>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-[600px] shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Add New User</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in the information to create a new user account</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'ORDER_MANAGER',
                    center: null
                  });
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200  text-gray-900${
                      newUser.password && newUser.confirmPassword && newUser.password !== newUser.confirmPassword
                        ? 'border-red-500'
                        : ''
                    }`}
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    required
                  />
                  {newUser.password && newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 text-gray-900">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="ORDER_MANAGER">Order Manager</option>
                    <option value="EXTENSION_OFFICER">Extension officer</option>
                    <option value="MARKETING_OFFICER">Marketing officer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="CEO">CEO</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CUSTOMER">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Center
                  </label>
                  <select
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900"
                    value={newUser.center || ''}
                    onChange={(e) => setNewUser({ ...newUser, center: e.target.value as User['center'] })}
                  >
                    <option value="">No Center</option>
                    <option value="KAHAMA">Kahama</option>
                    <option value="SHINYANGA">Shinyanga</option>
                    <option value="MAGANZO">Maganzo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setNewUser({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      role: 'ORDER_MANAGER',
                      center: null
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-gray-900"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate/Activate User Modal */}
      {isDeactivateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            {(() => {
              const selectedUser = users.find(u => u.id === selectedUserId);
              
              return (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedUser?.isActive ? 'Deactivate' : 'Activate'} User
                    </h3>
                    <button
                      onClick={() => setIsDeactivateModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      {selectedUser?.isActive
                        ? 'Are you sure you want to deactivate this user? They will no longer be able to access the system.'
                        : 'Are you sure you want to activate this user? They will be able to access the system again.'}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setIsDeactivateModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivateUser}
                      className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none ${
                        selectedUser?.isActive
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {selectedUser?.isActive ? 'Deactivate' : 'Activate'} User
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordData({ password: '', confirmPassword: '' });
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    passwordData.password && 
                    passwordData.confirmPassword && 
                    passwordData.password !== passwordData.confirmPassword
                      ? 'border-red-500'
                      : ''
                  }`}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
                {passwordData.password && 
                 passwordData.confirmPassword && 
                 passwordData.password !== passwordData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordData({ password: '', confirmPassword: '' });
                    setError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 