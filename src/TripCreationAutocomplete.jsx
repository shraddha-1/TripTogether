import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, MapPin, Navigation, Sparkles, ArrowRight } from 'lucide-react';
import ProfileComponent from './ProfileComponent';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hyYWRkaGEtc2hpbmRlIiwiYSI6ImNtZ29mbnA5azF1dmsybm9rYnk1d29tNHUifQ.WggehwJ0oUYLhFR8mzVnnQ';

export default function TripCreationAutocomplete({onCreateTrip, existingTrips = [], onSelectTrip, currentUser,
  userEmail,
  onLogout}) {
  const [newTripName, setNewTripName] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripDest, setNewTripDest] = useState('');
  
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingDest, setLoadingDest] = useState(false);
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const startTimeoutRef = useRef(null);
  const destTimeoutRef = useRef(null);

  const searchPlaces = async (query, type) => {
    if (!query.trim() || query.length < 2) {
      if (type === 'start') {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
      return;
    }

    const setLoading = type === 'start' ? setLoadingStart : setLoadingDest;
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,region`
      );
      const data = await response.json();

      const suggestions = data.features?.map((place) => ({
        name: place.place_name,
        shortName: place.text,
        id: place.id,
        coordinates: place.geometry.coordinates
      })) || [];

      if (type === 'start') {
        setStartSuggestions(suggestions);
        setShowStartSuggestions(suggestions.length > 0);
      } else {
        setDestSuggestions(suggestions);
        setShowDestSuggestions(suggestions.length > 0);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    setNewTripStart(value);

    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'start');
    }, 300);
  };

  const handleDestChange = (e) => {
    const value = e.target.value;
    setNewTripDest(value);

    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
    destTimeoutRef.current = setTimeout(() => {
      searchPlaces(value, 'dest');
    }, 300);
  };

  const handleSelectStart = (place) => {
    setNewTripStart(place.name);
    setStartCoords(place.coordinates);
    setShowStartSuggestions(false);
    setStartSuggestions([]);
  };

  const handleSelectDest = (place) => {
    setNewTripDest(place.name);
    setDestCoords(place.coordinates);
    setShowDestSuggestions(false);
    setDestSuggestions([]);
  };

  const handleCreateTrip = () => {
    if (!newTripName || !newTripStart || !newTripDest) return;
    
    const newTrip = {
      id: Date.now(),
      name: newTripName,
      start: newTripStart,
      destination: newTripDest,
      startCoords: startCoords,
      destCoords: destCoords,
    };
    
    onCreateTrip(newTrip);
    
    // Reset form
    setNewTripName('');
    setNewTripStart('');
    setNewTripDest('');
    setStartCoords(null);
    setDestCoords(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50  px-4">
      <div className="max-w-4xl mx-auto">

        {/* Create Trip Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 rounded-lg p-2.5">
              <Plus className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create New Trip</h2>
          </div>
          
          <div className="space-y-5">
            {/* Trip Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trip Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Summer Road Trip 2025"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
                />
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Starting Point with Autocomplete */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Starting Point
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Boulder, Colorado"
                  value={newTripStart}
                  onChange={handleStartChange}
                  onFocus={() => newTripStart && setShowStartSuggestions(true)}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 rounded-full p-1">
                  <Navigation className="text-green-600" size={16} />
                </div>
                
                {showStartSuggestions && startSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 max-h-64 overflow-y-auto">
                    {startSuggestions.map((suggestion, idx) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectStart(suggestion)}
                        className="w-full text-left px-5 py-4 hover:bg-green-50 border-b last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-lg p-2 group-hover:bg-green-200 transition-colors">
                            <MapPin className="text-green-600" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                            <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {loadingStart && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                      <p className="text-sm text-gray-600">Searching locations...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Destination with Autocomplete */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Utah"
                  value={newTripDest}
                  onChange={handleDestChange}
                  onFocus={() => newTripDest && setShowDestSuggestions(true)}
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-800"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-100 rounded-full p-1">
                  <MapPin className="text-red-600" size={16} />
                </div>
                
                {showDestSuggestions && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 max-h-64 overflow-y-auto">
                    {destSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectDest(suggestion)}
                        className="w-full text-left px-5 py-4 hover:bg-red-50 border-b last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 rounded-lg p-2 group-hover:bg-red-200 transition-colors">
                            <MapPin className="text-red-600" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                            <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {loadingDest && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      <p className="text-sm text-gray-600">Searching locations...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Route Indicator */}
            {newTripStart && newTripDest && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                    <Navigation className="text-green-600" size={16} />
                    <span className="font-semibold text-green-800 truncate max-w-32">
                      {newTripStart.split(',')[0]}
                    </span>
                  </div>
                  <ArrowRight className="text-indigo-600" size={20} />
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
                    <MapPin className="text-red-600" size={16} />
                    <span className="font-semibold text-red-800 truncate max-w-32">
                      {newTripDest.split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCreateTrip}
              disabled={!newTripName || !newTripStart || !newTripDest}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
            >
              <Plus size={24} />
              Create Trip
            </button>
          </div>
        </div>

        {/* Existing Trips */}
        {existingTrips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 rounded-lg p-2.5">
                <MapPin className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Your Trips</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className="p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all text-left group bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {trip.name}
                    </h4>
                    <ArrowRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-lg">
                      <Navigation className="text-green-600" size={14} />
                      <span className="text-green-700 font-medium truncate max-w-24">
                        {trip.startPoint?.split(',')[0] || trip.startPoint}
                      </span>
                    </div>
                    <ArrowRight className="text-gray-400" size={16} />
                    <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-lg">
                      <MapPin className="text-red-600" size={14} />
                      <span className="text-red-700 font-medium truncate max-w-24">
                        {trip.destination?.split(',')[0] || trip.destination}
                      </span>
                    </div>
                  </div>

                  {trip.members && trip.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Members:</span>
                        <div className="flex -space-x-2">
                          {trip.members.slice(0, 3).map((member, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center"
                              title={member}
                            >
                              <span className="text-xs font-semibold text-indigo-600">
                                {member === 'You' ? '👤' : member[0]}
                              </span>
                            </div>
                          ))}
                          {trip.members.length > 3 && (
                            <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">
                                +{trip.members.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Trips */}
        {existingTrips.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <MapPin className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No trips yet</h3>
            <p className="text-gray-600">
              Create your first trip above to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}