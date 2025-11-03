import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, MapPin, Users, ClipboardList, Share2, Copy, X, GripVertical, ThumbsUp, ThumbsDown } from 'lucide-react';
import { InteractiveMapComponent } from './InteractiveMapComponent';
import TripCreationAutocomplete from './TripCreationAutocomplete';
import LoginAuth from './LoginAuth';
import ExpenseTab from './ExpenseTab';
import ItineraryTab from './ItineraryTab';
import ProfileComponent from './ProfileComponent';
import TaskTab from './TaskTab';


export default function TravelPlanner() {
  const [currentTab, setCurrentTab] = useState('trips');
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);

  const [newTask, setNewTask] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [tripInvites, setTripInvites] = useState({});

  const [customPins, setCustomPins] = useState({});
  const [draggedPin, setDraggedPin] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');


  const voteForPin = (pinId, voteType) => {
    if (currentTrip) {
      const pins = customPins[currentTrip.id] || [];
      const updatedPins = pins.map(pin => {
        if (pin.id === pinId) {
          const likes = pin.likes || [];
          const dislikes = pin.dislikes || [];
          const hasLiked = likes.includes(currentUser);
          const hasDisliked = dislikes.includes(currentUser);

          if (voteType === 'like') {
            if (hasLiked) {
              // Remove like
              return {
                ...pin,
                likes: likes.filter(user => user !== currentUser)
              };
            } else {
              // Add like and remove dislike if exists
              return {
                ...pin,
                likes: [...likes, currentUser],
                dislikes: dislikes.filter(user => user !== currentUser)
              };
            }
          } else if (voteType === 'dislike') {
            if (hasDisliked) {
              // Remove dislike
              return {
                ...pin,
                dislikes: dislikes.filter(user => user !== currentUser)
              };
            } else {
              // Add dislike and remove like if exists
              return {
                ...pin,
                dislikes: [...dislikes, currentUser],
                likes: likes.filter(user => user !== currentUser)
              };
            }
          }
        }
        return pin;
      });

      setCustomPins({
        ...customPins,
        [currentTrip.id]: updatedPins,
      });
    }
  };

  const addTask = () => {
    if (currentTrip && newTask && newAssignee) {
      const task = {
        id: Date.now(),
        title: newTask,
        assignee: newAssignee,
        completed: false,
      };
      const updated = {
        ...currentTrip,
        tasks: [...currentTrip.tasks, task],
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
      setNewTask('');
      setNewAssignee('');
    }
  };

  const toggleTask = (taskId) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        tasks: currentTrip.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
    }
  };


  const deleteTask = (taskId) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        tasks: currentTrip.tasks.filter(t => t.id !== taskId),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
    }
  };

  const addCustomPin = (pin) => {
    if (currentTrip) {
      const pins = customPins[currentTrip.id] || [];
      setCustomPins({
        ...customPins,
        [currentTrip.id]: [...pins, { ...pin, likes: [], dislikes: [] }],
      });
    }
  };

  const deleteCustomPin = (pinId) => {
    if (currentTrip) {
      const pins = customPins[currentTrip.id] || [];
      setCustomPins({
        ...customPins,
        [currentTrip.id]: pins.filter(p => p.id !== pinId),
      });
    }
  };

  const updateCustomPin = (index, updatedPin) => {
    if (currentTrip) {
      const pins = [...(customPins[currentTrip.id] || [])];
      if (pins[index]) {
        pins[index] = {
          ...pins[index],
          x: updatedPin.x,
          y: updatedPin.y,
        };
        setCustomPins({
          ...customPins,
          [currentTrip.id]: pins,
        });
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedPin(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedPin === null || draggedPin === dropIndex) {
      setDraggedPin(null);
      setDragOverIndex(null);
      return;
    }

    if (currentTrip) {
      const currentPins = customPins[currentTrip.id] || [];
      const newPins = [...currentPins];
      const [movedPin] = newPins.splice(draggedPin, 1);
      newPins.splice(dropIndex, 0, movedPin);

      // IMPORTANT: Clear x,y coordinates when reordering so they recalculate
      const reorderedPins = newPins.map(pin => ({
        ...pin,
        x: undefined,
        y: undefined
      }));

      setCustomPins({
        ...customPins,
        [currentTrip.id]: reorderedPins,
      });

      setMapKey(prev => prev + 1);
    }

    setDraggedPin(null);
    setDragOverIndex(null);
  };

  useEffect(() => {
    console.log('CustomPins updated in map:', customPins);
  }, [customPins]);

  const inviteMember = () => {
    if (inviteEmail && currentTrip) {
      const currentMembers = tripInvites[currentTrip.id] || [];
      if (!currentMembers.includes(inviteEmail)) {
        const updated = {
          ...currentTrip,
          members: [...currentTrip.members, inviteEmail],
        };
        setCurrentTrip(updated);
        setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
        setTripInvites({
          ...tripInvites,
          [currentTrip.id]: [...currentMembers, inviteEmail],
        });
        setInviteEmail('');
      }
    }
  };

  const removeMember = (email) => {
    if (currentTrip) {
      const updated = {
        ...currentTrip,
        members: currentTrip.members.filter(m => m !== email),
      };
      setCurrentTrip(updated);
      setTrips(trips.map(t => t.id === currentTrip.id ? updated : t));
      const currentMembers = tripInvites[currentTrip.id] || [];
      setTripInvites({
        ...tripInvites,
        [currentTrip.id]: currentMembers.filter(m => m !== email),
      });
    }
  };

  const generateShareLink = () => {
    if (currentTrip) {
      const link = `${window.location.origin}?trip=${currentTrip.shareCode}`;
      setShareLink(link);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  if (!isLoggedIn) {
    return (
      <LoginAuth
        onLoginSuccess={(userData) => {
          setCurrentUser(userData.name);
          setCurrentUserEmail(userData.email);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-indigo-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TripTogether
                </h1>
                <p className="text-xs text-gray-500">Plan your group trips together, effortlessly</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentTrip && (
                <button
                  onClick={() => setCurrentTrip(null)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  All Trips
                </button>
              )}
              <ProfileComponent
                currentUser={currentUser}
                userEmail={currentUserEmail}
                tripsCreated={trips.length}
                tripsJoined={0}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                  setCurrentUserEmail('');
                  setCurrentTrip(null);
                  setTrips([]);
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {!currentTrip ? (
          <div className="mt-8">
            <TripCreationAutocomplete
              onCreateTrip={(tripData) => {
                console.log('Creating trip with data:', tripData);
                const trip = {
                  id: Date.now(),
                  name: tripData.name,
                  destination: tripData.destination,
                  startPoint: tripData.start,
                  startCoords: tripData.startCoords,
                  destCoords: tripData.destCoords,
                  places: [],
                  tasks: [],
                  members: ['You'],
                  shareCode: Math.random().toString(36).substr(2, 9).toUpperCase(),
                };
                console.log('New trip created:', trip);
                setTrips([...trips, trip]);
                setCurrentTrip(trip);
                setCustomPins({ ...customPins, [trip.id]: [] });
                setCurrentTab('map');
              }}
              existingTrips={trips}
              onSelectTrip={setCurrentTrip}
              currentUser={currentUser}
              userEmail={currentUserEmail}
              tripsCreated={trips.length}
              tripsJoined={0}
              onLogout={() => {
                setIsLoggedIn(false);
                setCurrentUser(null);
                setCurrentUserEmail('');
                setCurrentTrip(null);
                setTrips([]);
              }}
            />
          </div>
        ) : (
          <div>
            {/* Trip Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{currentTrip.name}</h2>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <span className="text-green-600 font-semibold">{currentTrip.startPoint}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-red-600 font-semibold">{currentTrip.destination}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md flex items-center gap-2 font-semibold"
                >
                  <Share2 size={18} />
                  Invite Friends
                </button>
              </div>

              {/* Members Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Users size={18} className="text-indigo-600" />
                  Trip Members ({currentTrip.members.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentTrip.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-800 rounded-full text-sm font-medium shadow-sm"
                    >
                      {member === 'You' ? '👤 ' + member : '👥 ' + member}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Invite Friends
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Email Invite */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Add by Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && inviteMember()}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={inviteMember}
                        className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Invited Members */}
                  {currentTrip && tripInvites[currentTrip.id] && tripInvites[currentTrip.id].length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Invited ({tripInvites[currentTrip.id].length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tripInvites[currentTrip.id].map((email, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                          >
                            <span className="text-sm text-gray-800 font-medium">{email}</span>
                            <button
                              onClick={() => removeMember(email)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="mb-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or Share Link
                    </label>
                    <button
                      onClick={generateShareLink}
                      className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
                    >
                      <Share2 size={18} />
                      Generate Share Link
                    </button>
                    {shareLink && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Share this link with friends:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded text-gray-700 font-mono"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-1 shadow-sm"
                          >
                            <Copy size={16} />
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setCurrentTab('map')}
                className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm whitespace-nowrap ${
                  currentTab === 'map'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <MapPin className="inline mr-2" size={18} />
                Trip Map
              </button>
              <button
                onClick={() => setCurrentTab('tasks')}
                className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm whitespace-nowrap ${
                  currentTab === 'tasks'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <ClipboardList className="inline mr-2" size={18} />
                Tasks
              </button>

              <button
                onClick={() => setCurrentTab('expenses')}
                className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm whitespace-nowrap ${
                  currentTab === 'expenses'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                💰 Expenses
              </button>

              <button
                onClick={() => setCurrentTab('itinerary')}
                className={`px-6 py-3 rounded-lg font-semibold transition shadow-sm whitespace-nowrap ${
                  currentTab === 'itinerary'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                📅 Itinerary
              </button>
            </div>

            {/* Trip Map Tab */}
            {currentTab === 'map' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-96">
                {/* Left Side - Pins */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-indigo-600" />
                      Map Pins
                    </h3>

                    {/* Route Info */}
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg mb-2 shadow-sm">
                      <p className="text-xs font-semibold text-green-700">🚀 START</p>
                      <p className="text-sm font-bold text-gray-800">{currentTrip.startPoint}</p>
                    </div>

                    {/* Custom Pins Section - Draggable */}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="space-y-2 my-2">
                        {(customPins[currentTrip.id] || []).map((pin, idx) => (
                          <div
                            key={pin.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg text-xs hover:shadow-md transition cursor-move ${
                              dragOverIndex === idx ? 'border-purple-600 border-dashed shadow-lg' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical size={16} className="text-purple-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 text-sm">{pin.name}</p>
                                  <p className="text-gray-700 text-xs mt-1">{pin.description}</p>
                                </div>
                              </div>
                              {currentUser === pin.addedBy && (
                                <button
                                  onClick={() => deleteCustomPin(pin.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition"
                                  title="Delete pin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            
                            {/* Vote Buttons */}
                            <div className="flex gap-2 mb-2">
                              <button
                                onClick={() => voteForPin(pin.id, 'like')}
                                className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                  (pin.likes || []).includes(currentUser)
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                                }`}
                                title="Like this place"
                              >
                                <ThumbsUp size={14} />
                                <span className="text-sm font-semibold">{(pin.likes || []).length}</span>
                              </button>
                              <button
                                onClick={() => voteForPin(pin.id, 'dislike')}
                                className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                  (pin.dislikes || []).includes(currentUser)
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50'
                                }`}
                                title="Dislike this place"
                              >
                                <ThumbsDown size={14} />
                                <span className="text-sm font-semibold">{(pin.dislikes || []).length}</span>
                              </button>
                            </div>

                            <div className="text-gray-600 border-t border-purple-200 pt-2 mt-1">
                              <p className="text-xs">✨ Added by: <span className="font-medium">{pin.addedBy}</span></p>
                              <p className="text-xs text-gray-500 mt-0.5">📍 {pin.address}</p>
                              {((pin.likes || []).length > 0 || (pin.dislikes || []).length > 0) && (
                                <div className="mt-2 text-xs space-y-1">
                                  {(pin.likes || []).length > 0 && (
                                    <p className="text-green-600">
                                      👍 Liked by: {(pin.likes || []).join(', ')}
                                    </p>
                                  )}
                                  {(pin.dislikes || []).length > 0 && (
                                    <p className="text-red-600">
                                      👎 Disliked by: {(pin.dislikes || []).join(', ')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-lg shadow-sm">
                      <p className="text-xs font-semibold text-red-700">🏁 DESTINATION</p>
                      <p className="text-sm font-bold text-gray-800">{currentTrip.destination}</p>
                    </div>

                    {/* Info Text */}
                    {(customPins[currentTrip.id] || []).length === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                          📍 Click on the map to add places along your route!
                        </p>
                      </div>
                    )}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          ↕️ Drag pins to reorder your stops
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Interactive Map */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="relative w-full h-96 lg:h-full min-h-96">
                    <InteractiveMapComponent
                      key={mapKey}
                      startPoint={currentTrip.startPoint}
                      destination={currentTrip.destination}
                      stops={[]}
                      customPins={customPins[currentTrip.id] || []}
                      onAddPin={addCustomPin}
                      onUpdatePin={updateCustomPin}
                      currentUser={currentUser}
                      startCoordinates={currentTrip.startCoords}
                      destCoordinates={currentTrip.destCoords}
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-indigo-200">
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">🗺️ Route:</span> {currentTrip.startPoint} → {currentTrip.destination}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {currentTab === 'tasks' && (
              <TaskTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpenseTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}

            {currentTab === 'itinerary' && (
              <ItineraryTab
                currentTrip={currentTrip}
                setCurrentTrip={setCurrentTrip}
                trips={trips}
                setTrips={setTrips}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}