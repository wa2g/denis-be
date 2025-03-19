'use client';
// import { useState } from 'react';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#066b3a] mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Profile Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-black"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border rounded text-black"
                  placeholder="Your email"
                />
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded text-black"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded text-black"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full p-2 border rounded text-black"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-[#066b3a]" />
                <span className="ml-2 text-sm text-gray-900">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-[#066b3a]" />
                <span className="ml-2 text-sm text-gray-900">Order updates</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-[#066b3a]" />
                <span className="ml-2 text-sm text-gray-900">Inventory alerts</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 