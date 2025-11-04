import React, { useState } from 'react';
import { User, LogOut, Mail, UserCircle, X, MapPin } from 'lucide-react';

export default function ProfileComponent({ currentUser, userEmail, onLogout, tripsCreated = 0, tripsJoined = 0 }) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    setShowProfileModal(false);
    onLogout();
    // Redirect to homepage
    window.location.href = '/';
  };

  return (
    <>
      {/* Profile Icon Button */}
      <button
        onClick={() => setShowProfileModal(true)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
        title="View Profile"
      >
        <span className="text-sm">{getInitials(currentUser)}</span>
      </button>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-indigo-600 p-6 relative">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
              >
                <X size={24} />
              </button>
              
              {/* Avatar Circle */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-3">
                  <span className="text-4xl font-bold text-indigo-600">
                    {getInitials(currentUser)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white text-center">
                  {currentUser || 'User'}
                </h2>
              </div>
            </div>

            {/* Profile Information */}
            <div className="p-6 space-y-4">
              {/* Name Section */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserCircle size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Full Name</p>
                  <p className="text-base font-semibold text-gray-800">
                    {currentUser || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Email Section */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mail size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Email Address</p>
                  <p className="text-base font-semibold text-gray-800 break-all">
                    {userEmail || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{tripsCreated}</p>
                  <p className="text-xs text-gray-600 font-semibold">Trips Created</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                  <p className="text-2xl font-bold text-green-600">{tripsJoined}</p>
                  <p className="text-xs text-gray-600 font-semibold">Trips Joined</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
                
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}