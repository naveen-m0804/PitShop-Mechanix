import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setNearbyShops, setAllShops, setLoading } from '../store/shopsSlice';
import { getCurrentLocation, formatDistance } from '../services/geolocation';
import api from '../services/api';
import { MapPin, Star, Clock, Wrench, Map, List, AlertCircle, LogOut } from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils';
import { logout } from '../store/authSlice';

const ClientHomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { nearbyShops, loading: shopsLoading } = useSelector((state) => state.shops);
  const { user } = useSelector((state) => state.auth);
  const { currentLocation, loading: locationLoading, error: locationError } = useSelector((state) => state.location);


  const [viewMode, setViewMode] = useState('list');
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('');
  const [localError, setLocalError] = useState('');

  // No local fetching on mount - handled by LocationTracker


  // Fetch logic only for manual actions or filter changes
  const fetchNearbyShops = async (loc, showAllShops = false) => {
    try {
      const params = showAllShops ? {} : {
        lat: loc.latitude,
        lng: loc.longitude,
        radius: 20000,
      };

      if (filter) {
        params.shopType = filter;
      }

      const endpoint = showAllShops ? '/client/all-shops' : '/client/nearby-shops';
      const response = await api.get(endpoint, { params });

      if (response.data.success) {
        dispatch(showAllShops ? setAllShops(response.data.data) : setNearbyShops(response.data.data));
      }
      setLoadingState(false);
    } catch (err) {
      setError('Failed to fetch shops');
      setLoadingState(false);
    }
  };

  const handleShowAll = () => {
    setShowAll(true);
    if (currentLocation) {
      fetchNearbyShops(currentLocation, true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isShopOpen = (openTime, closeTime) => {
    const now = new Date();
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  if (locationLoading && !currentLocation && nearbyShops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-text-secondary">Finding nearby mechanics...</p>
        </div>
      </div>
    );
  }

  if (locationError || localError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Location Required</h2>
          <p className="text-text-secondary mb-6">{locationError || localError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="glass-card rounded-b-3xl p-6 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.name}!</h1>
            <p className="text-text-secondary flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {currentLocation && `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
            </p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-bg-card rounded-lg transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary'
              }`}
          >
            <List className="w-5 h-5 inline mr-2" />
            List
          </button>
          <button
            onClick={() => {
              setViewMode('map');
              navigate('/map');
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${viewMode === 'map' ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary'
              }`}
          >
            <Map className="w-5 h-5 inline mr-2" />
            Map
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 mb-4">
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            fetchNearbyShops(currentLocation, showAll);
          }}
          className="input-field"
        >
          <option value="">All Types</option>
          <option value="CAR_REPAIR">Car Repair</option>
          <option value="BIKE_REPAIR">Bike Repair</option>
          <option value="PUNCTURE">Puncture Only</option>
        </select>
      </div>

      {/* Shops List */}
      <div className="px-4 space-y-4">
        {nearbyShops.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Wrench className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Mechanics Nearby</h3>
            <p className="text-text-secondary mb-4">
              No mechanic shops found within 20km radius
            </p>
            {!showAll && (
              <button onClick={handleShowAll} className="btn-primary">
                Show All Shops
              </button>
            )}
          </div>
        ) : (
          nearbyShops.map((shop) => (
            <div
              key={shop.id}
              className="glass-card p-5 hover:border-primary transition-all cursor-pointer animate-slide-up"
              onClick={() => navigate(`/create-request/${shop.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{shop.shopName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                    <span className="text-text-secondary text-sm">
                      ({shop.totalRatings} ratings)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold">
                    {shop.distance ? formatDistance(shop.distance) : 'N/A'}
                  </div>
                  <div className={`text-sm ${isShopOpen(shop.openTime, shop.closeTime) ? 'text-success' : 'text-danger'}`}>
                    {isShopOpen(shop.openTime, shop.closeTime) ? 'Open' : 'Closed'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime12Hour(shop.openTime)} - {formatTime12Hour(shop.closeTime)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {shop.shopTypes.map((type) => (
                  <span
                    key={type}
                    className="badge bg-primary bg-opacity-20 text-primary border border-primary"
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl p-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Wrench className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => navigate('/my-requests')}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary transition-colors"
          >
            <List className="w-6 h-6" />
            <span className="text-xs font-semibold">Requests</span>
          </button>
          <button
            onClick={() => navigate('/map')}
            className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary transition-colors"
          >
            <Map className="w-6 h-6" />
            <span className="text-xs font-semibold">Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage;
