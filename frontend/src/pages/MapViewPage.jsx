import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Wrench } from 'lucide-react';
import { formatTime12Hour } from '@/lib/utils';
import L from 'leaflet';
import { getCurrentLocation } from '../services/geolocation';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapViewPage = () => {
  const navigate = useNavigate();
  const { nearbyShops } = useSelector((state) => state.shops);
  const [clientLocation, setClientLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        setClientLocation([loc.latitude, loc.longitude]);
        setLoading(false);
      } catch (err) {
        console.error('Failed to get location:', err);
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  if (loading || !clientLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="glass-card p-4 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-bg-card rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Nearby Mechanics Map</h1>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={clientLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Client Marker */}
          <Marker position={clientLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-bold">Your Location</p>
              </div>
            </Popup>
          </Marker>

          {/* 20km Radius Circle */}
          <Circle
            center={clientLocation}
            radius={20000}
            pathOptions={{
              color: 'hsl(220, 90%, 56%)',
              fillColor: 'hsl(220, 90%, 56%)',
              fillOpacity: 0.1,
              dashArray: '10, 10',
            }}
          />

          {/* Mechanic Markers */}
          {nearbyShops.map((shop) => (
            <Marker
              key={shop.id}
              position={[
                shop.location.coordinates[1],
                shop.location.coordinates[0],
              ]}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{shop.shopName}</h3>
                  <div className="space-y-1 text-sm">
                    <p>⭐ {shop.rating.toFixed(1)} ({shop.totalRatings} ratings)</p>
                    <p>🕒 {formatTime12Hour ? formatTime12Hour(shop.openTime) : shop.openTime} - {formatTime12Hour ? formatTime12Hour(shop.closeTime) : shop.closeTime}</p>
                    <p>📍 {shop.distance ? `${(shop.distance / 1000).toFixed(1)} km away` : 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/create-request/${shop.id}`)}
                    className="btn-primary w-full mt-3 text-sm py-2"
                  >
                    Request Repair
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapViewPage;
