import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Trip</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Trip name (e.g., Utah Vacation)"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Starting Point with Autocomplete */}
            <div className="relative">
              <input
                type="text"
                placeholder="Starting point (e.g., Boulder, Colorado)"
                value={newTripStart}
                onChange={handleStartChange}
                onFocus={() => newTripStart && setShowStartSuggestions(true)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              {showStartSuggestions && startSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-48 overflow-y-auto">
                  {startSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectStart(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b last:border-b-0 transition"
                    >
                      <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                      <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                    </button>
                  ))}
                </div>
              )}

              {loadingStart && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-3">
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              )}
            </div>

            {/* Destination with Autocomplete */}
            <div className="relative">
              <input
                type="text"
                placeholder="Destination (e.g., Utah)"
                value={newTripDest}
                onChange={handleDestChange}
                onFocus={() => newTripDest && setShowDestSuggestions(true)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              {showDestSuggestions && destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-48 overflow-y-auto">
                  {destSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectDest(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b last:border-b-0 transition"
                    >
                      <p className="font-semibold text-sm text-gray-800">{suggestion.shortName}</p>
                      <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                    </button>
                  ))}
                </div>
              )}

              {loadingDest && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-3">
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCreateTrip}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              disabled={!newTripName || !newTripStart || !newTripDest}
            >
              <Plus size={20} />
              Create Trip
            </button>
          </div>

          {existingTrips.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-indigo-50 transition"
              >
                <h4 className="font-semibold text-gray-800">{trip.name}</h4>
                <p className="text-sm text-gray-600">{trip.startPoint} → {trip.destination}</p>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}