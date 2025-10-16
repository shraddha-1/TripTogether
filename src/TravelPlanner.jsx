import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, MapPin, Users, ClipboardList, Share2, Copy, X, GripVertical, ThumbsUp } from 'lucide-react';
import { InteractiveMapComponent } from './InteractiveMapComponent';
import TripCreationAutocomplete from './TripCreationAutocomplete';
import LoginAuth from './LoginAuth';
import ExpenseTab from './ExpenseTab';
import ItineraryTab from './ItineraryTab';


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


  const voteForPin = (pinId) => {
    if (currentTrip) {
      const pins = customPins[currentTrip.id] || [];
      const updatedPins = pins.map(pin => {
        if (pin.id === pinId) {
          const votes = pin.votes || [];
          const hasVoted = votes.includes(currentUser);

          if (hasVoted) {
            // Remove vote
            return {
              ...pin,
              votes: votes.filter(user => user !== currentUser)
            };
          } else {
            // Add vote
            return {
              ...pin,
              votes: [...votes, currentUser]
            };
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
        [currentTrip.id]: [...pins, { ...pin, votes: [] }],
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
  // Add a useEffect to log when customPins changes (for debugging)
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
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">TripTogether</h1>
          <p className="text-gray-600">Plan your group trips together, effortlessly</p>
        </div>

        {!currentTrip ? (
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
          />
        ) : (
          <div>
            {/* Trip Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{currentTrip.name}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-2">
                    <MapPin size={18} />
                    {currentTrip.startPoint} → {currentTrip.destination}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <Share2 size={18} />
                    Invite Friends
                  </button>
                  <button
                    onClick={() => setCurrentTrip(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Back to Trips
                  </button>
                </div>
              </div>

              {/* Members Section */}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <Users size={18} />
                  Trip Members ({currentTrip.members.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentTrip.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                    >
                      {member === 'You' ? '👤 ' + member : member}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Invite Friends</h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="text-gray-500 hover:text-gray-700"
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
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={inviteMember}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
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
                            className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                          >
                            <span className="text-sm text-gray-800">{email}</span>
                            <button
                              onClick={() => removeMember(email)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="mb-6 pt-6 border-t border-gray-300">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or Share Link
                    </label>
                    <button
                      onClick={generateShareLink}
                      className="w-full mb-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Generate Share Link
                    </button>
                    {shareLink && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-xs text-gray-600 mb-2">Share this link with friends:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 p-2 text-xs bg-white border border-gray-300 rounded text-gray-700"
                          />
                          <button
                            onClick={copyToClipboard}
                            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-1"
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
                    className="w-full px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6">

              <button
                onClick={() => setCurrentTab('map')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${currentTab === 'map'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <MapPin className="inline mr-2" size={18} />
                Trip Map
              </button>
              <button
                onClick={() => setCurrentTab('tasks')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${currentTab === 'tasks'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
              >


                <ClipboardList className="inline mr-2" size={18} />
                Tasks
              </button>

              <button
                onClick={() => setCurrentTab('expenses')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${currentTab === 'expenses'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
              >
                💰 Expenses
              </button>

              <button
                onClick={() => setCurrentTab('itinerary')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${currentTab === 'itinerary'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
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
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Map Pins</h3>

                    {/* Route Info */}
                    <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg mb-2">
                      <p className="text-xs font-semibold text-green-700">START</p>
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
                            className={`p-3 bg-purple-50 border-2 border-purple-300 rounded-lg text-xs hover:bg-purple-100 transition cursor-move ${dragOverIndex === idx ? 'border-purple-600 border-dashed' : ''
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical size={16} className="text-purple-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 text-sm">{pin.name}</p>
                                  <p className="text-gray-700 text-xs mt-1">{pin.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-1 items-center">
                                <button
                                  onClick={() => voteForPin(pin.id)}
                                  className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${(pin.votes || []).includes(currentUser)
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  title="Vote for this place"
                                >
                                  <span className="text-sm">👍</span>
                                  <span className="text-xs font-semibold">{(pin.votes || []).length}</span>
                                </button>
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
                            </div>
                            <div className="text-gray-600 border-t border-purple-200 pt-1 mt-1">
                              <p className="text-xs">Added by: {pin.addedBy}</p>
                              <p className="text-xs text-gray-500">{pin.address}</p>
                              {(pin.votes || []).length > 0 && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  Voted by: {(pin.votes || []).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                      <p className="text-xs font-semibold text-red-700">DESTINATION</p>
                      <p className="text-sm font-bold text-gray-800">{currentTrip.destination}</p>
                    </div>

                    {/* Info Text */}
                    {(customPins[currentTrip.id] || []).length === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-sm text-gray-600 text-center">Click on the map to add places along your route!</p>
                      </div>
                    )}
                    {(customPins[currentTrip.id] || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-xs text-gray-500 text-center">Drag to reorder your stops</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Interactive Map */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
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

                  <div className="p-4 bg-blue-50 border-t border-blue-200">
                    <p className="text-xs text-gray-700">
                      <span className="font-semibold">Route:</span> {currentTrip.startPoint} → {currentTrip.destination}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {currentTab === 'tasks' && (
              <div className="space-y-6">
                {/* Add Task */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Add a Task</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Task (e.g., Book flights)"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Assign to (e.g., John)"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={addTask}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Task List</h3>
                  {currentTrip.tasks.length === 0 ? (
                    <p className="text-gray-600">No tasks yet. Add one above!</p>
                  ) : (
                    <div className="space-y-3">
                      {currentTrip.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`border rounded-lg p-4 flex items-center justify-between transition ${task.completed
                            ? 'bg-gray-100 border-gray-300'
                            : 'border-indigo-300 bg-indigo-50'
                            }`}
                        >
                          <div className="flex-1">
                            <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-600' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600">Assigned to: <strong>{task.assignee}</strong></p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`px-4 py-2 rounded-lg font-semibold transition ${task.completed
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                }`}
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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