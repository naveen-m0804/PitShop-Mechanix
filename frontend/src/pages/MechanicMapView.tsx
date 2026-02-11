import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '@/components/Navbar';
import { mechanicApi, userApi, mechanicsApi, UserProfile, Mechanic } from '@/lib/api';
import { Loader2, Phone, MapPin, Navigation, Clock, Car, Store, User, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AIAssistant from '@/components/AIAssistant';
import 'leaflet/dist/leaflet.css';
import socketService from '../services/socket';
import RatingStars from '@/components/RatingStars';

// Custom CSS removed to match Client MapView popup consistency

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});



// Client location marker (Red Car)
const carSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="8" fill="#ef4444" stroke="white" stroke-width="3"/>
  <circle cx="12" cy="12" r="8" fill="#ef4444" opacity="0.3" stroke="none">
    <animate attributeName="r" from="8" to="12" dur="1.5s" repeatCount="indefinite" />
    <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
  </circle>
</svg>`;

const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(carSvg),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Shop location marker (Custom Image)
const shopIcon = new L.Icon({
  iconUrl: '/mechanic-shop-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'rounded-full border-2 border-white shadow-lg' // Optional: adds styling to the image
});

// Other Shops Icon (Same image but maybe different styling if needed, or same)
// Using same icon for all mechanics
const otherShopIcon = new L.Icon({
  iconUrl: '/mechanic-shop-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'rounded-full border-2 border-white shadow-lg'
});

// Live location marker (Purple Man)
const manSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
  <circle cx="12" cy="12" r="12" fill="#a855f7" opacity="0.3"/>
  <circle cx="12" cy="12" r="7" fill="#a855f7" stroke="white" stroke-width="2"/>
</svg>`;

const manIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(manSvg),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface ActiveLocation {
  id: string;
  clientName: string;
  clientPhone: string;
  vehicleType: string;
  problemDescription: string;
  clientLocation: {
    coordinates?: [number, number]; // [lng, lat]
    x?: number; // fallback for longitude
    y?: number; // fallback for latitude
  };
  acceptedAt: string;
  expiresAt: string;
}

const RecenterMap: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15); // Zoom to level 15 for better visibility
    }
  }, [center, map]);
  return null;
};

const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (!map || points.length === 0) return;
    if (hasFitRef.current) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: L.point(50, 50), maxZoom: 12 });
    hasFitRef.current = true;
  }, [map, points]);

  return null;
};

const resolveLatLng = (mechanic: Mechanic): [number, number] | null => {
  const coords = mechanic.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    return [coords[1], coords[0]];
  }
  const x = mechanic.location?.x;
  const y = mechanic.location?.y;
  if (typeof x === 'number' && typeof y === 'number') {
    return [y, x];
  }
  return null;
};

const MechanicMapView = () => {
  const [activeLocations, setActiveLocations] = useState<ActiveLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [shopLocation, setShopLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]); // Default Center
  const [shopName, setShopName] = useState<string>('');
  const [otherMechanics, setOtherMechanics] = useState<Mechanic[]>([]);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const { toast } = useToast();
  const otherMechanicPoints = otherMechanics
    .map(resolveLatLng)
    .filter((p): p is [number, number] => Array.isArray(p));

  useEffect(() => {
    fetchInitialData();
    // Refresh active locations every minute
    const interval = setInterval(fetchActiveLocations, 60000);

    // Check URL params for navigation from Work History
    const params = new URLSearchParams(window.location.search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    if (lat && lng) {
      const center: [number, number] = [parseFloat(lat), parseFloat(lng)];
      setMapCenter(center);
      setCurrentLocation(center); // Optional: treat as current for a moment or just center
    } else {
      // Initial geolocation
      detectLocation();
    }

    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [profile, locations] = await Promise.all([
        userApi.getProfile(),
        mechanicApi.getActiveLocations()
      ]);

      if (profile.mechanicShop?.location) {
        // Mongo stores as [lng, lat], Leaflet needs [lat, lng]
        const coords = profile.mechanicShop.location.coordinates;
        const x = profile.mechanicShop.location.x;
        const y = profile.mechanicShop.location.y;
        let shopLatLng: [number, number] | null = null;

        if (Array.isArray(coords) && coords.length === 2) {
          shopLatLng = [coords[1], coords[0]];
        } else if (typeof x === 'number' && typeof y === 'number') {
          shopLatLng = [y, x];
        }

        if (shopLatLng) {
          setShopLocation(shopLatLng);
        }

        setShopName(profile.mechanicShop.shopName);
        setMechanicId(profile.id);

        // Fetch other mechanics (prefer all shops, fallback to wide radius)
        try {
          let others: Mechanic[] = [];
          try {
            const all = await mechanicsApi.getAll();
            others = all.filter(m => m.id !== profile.mechanicShop?.id);
          } catch (err) {
            console.warn("All-shops endpoint failed, falling back to wide radius", err);
          }

          if (others.length === 0) {
            // Fallback to wide radius to approximate "all shops"
            const wideRadiusKm = 2000;
            if (shopLatLng) {
              const nearby = await mechanicsApi.getNearby(shopLatLng[0], shopLatLng[1], wideRadiusKm, undefined, true);
              others = nearby.filter(m => m.id !== profile.mechanicShop?.id);
            }
          }

          setOtherMechanics(others);
        } catch (err) {
          console.error("Failed to fetch other mechanics", err);
        }
      }

      setActiveLocations(locations);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveLocations = async () => {
    try {
      const data = await mechanicApi.getActiveLocations();
      setActiveLocations(data);
    } catch (error) {
      console.error('Failed to fetch active locations:', error);
    }
  };

  // Local tracking only (fresh positions, no cache)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Location error:", error);
          toast({
            title: "Location Required",
            description: "Please allow location access to show your current position.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        () => {
          // Keep last known location if updates fail
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [toast]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]); // Force map update
          toast({
            title: "Location Updated",
            description: "Showing your latest location.",
          });
        },
        (error) => {
          console.error("Location error:", error);
          toast({
            title: "Location Required",
            description: "Please enable GPS and allow location access to update your position.",
            variant: "destructive"
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive"
      });
    }
  };

  const getDirections = (lat: number, lng: number) => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    if (currentLocation) {
        url += `&origin=${currentLocation[0]},${currentLocation[1]}`;
    }
    window.open(url, '_blank');
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <main className="pt-20 h-screen">
        <div className="h-[calc(100vh-80px)] p-4">
          <div className="h-full rounded-2xl overflow-hidden glass-card relative border border-white/10">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <RecenterMap center={mapCenter} />

              <FitBounds
                points={[
                  ...(shopLocation ? [shopLocation] : []),
                  ...otherMechanicPoints
                ]}
              />

              {/* Shop Marker (Green) */}
              {shopLocation && (
                <Marker position={shopLocation} icon={shopIcon} zIndexOffset={1000}>
                  <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent className="font-bold text-sm">
                    {shopName} (You)
                  </Tooltip>
                  <Popup>
                    <div className="p-2 text-center">
                      <Store className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <h3 className="font-bold text-white-900 mb-1">{shopName}</h3>
                      <p className="text-xs text-white-700">Your Base Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Other Mechanics Markers */}
              {otherMechanics
                .map((mechanic) => ({
                  mechanic,
                  latLng: resolveLatLng(mechanic),
                }))
                .filter((item): item is { mechanic: Mechanic; latLng: [number, number] } => Array.isArray(item.latLng))
                .map(({ mechanic, latLng }) => {
                  const [lat, lng] = latLng;
                  return (
                    <Marker key={mechanic.id} position={[lat, lng]} icon={otherShopIcon}>
                      <Tooltip direction="top" offset={[0, -40]} opacity={0.8}>
                        {mechanic.shopName}
                      </Tooltip>
                      <Popup>
                        <div className="min-w-[200px] p-2">
                          <h3 className="font-bold text-white-900 text-lg mb-1">
                            {mechanic.shopName}
                          </h3>
                          <div className="flex items-center gap-1 mb-2">
                            <RatingStars rating={mechanic.rating || 0} readOnly size="sm" />
                            <span className="text-xs text-white-500">({mechanic.totalRatings || 0})</span>
                          </div>
                          <div className="flex items-center gap-2 text-white-700 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{mechanic.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white-700 mb-3">
                            <Phone className="w-4 h-4" />
                            <a
                              href={`tel:${mechanic.phone}`}
                              className="text-sm hover:text-primary"
                            >
                              {mechanic.phone}
                            </a>
                          </div>
                          <Button 
                            onClick={() => getDirections(lat, lng)} 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-auto py-2"
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              {/* Live Location Marker (Purple) - Only active when detecting location */}
              {currentLocation && (
                <Marker position={currentLocation} icon={manIcon} zIndexOffset={100}>
                  <Popup>
                    <div className="p-2 text-center">
                      <User className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                      <h3 className="font-bold text-white-900 mb-1">You are here</h3>
                      <p className="text-xs text-white-700">Live Device Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Active Client Markers (Red) - Static location from request time */}
              {activeLocations.map((loc) => {
                if (!loc.clientLocation) return null;

                let lat: number, lng: number;

                if (loc.clientLocation.coordinates) {
                  [lng, lat] = loc.clientLocation.coordinates;
                } else if (loc.clientLocation.x !== undefined && loc.clientLocation.y !== undefined) {
                  lng = loc.clientLocation.x;
                  lat = loc.clientLocation.y;
                } else {
                  return null;
                }

                return (
                  <Marker key={loc.id} position={[lat, lng]} icon={carIcon}>
                    <Popup>
                      <div className="min-w-[200px] p-2">
                        <h3 className="font-bold text-white-900 text-lg mb-1">
                          {loc.clientName}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Car className="w-4 h-4 text-white-500" />
                          <span className="text-xs text-white-500">{loc.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white-700 mb-2">
                          <span className="text-sm italic">"{loc.problemDescription}"</span>
                        </div>
                        <div className="flex items-center gap-2 text-white-700 mb-3">
                          <Phone className="w-4 h-4" />
                          <a
                            href={`tel:${loc.clientPhone}`}
                            className="text-sm hover:text-primary"
                          >
                            {loc.clientPhone}
                          </a>
                        </div>
                        <button
                          onClick={() => getDirections(lat, lng)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          Navigate to Client
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map Legend - Style to match Client MapView */}
            <div className="fixed bottom-8 left-8 glass-card p-4 z-[1000] min-w-[200px]">
              <h4 className="font-semibold text-foreground mb-3 text-sm">Map Legend</h4>
              <div className="flex flex-col gap-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500 border border-white shadow-sm"></div>
                  <span className="text-muted-foreground">Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/mechanic-shop-icon.png" className="w-4 h-4 rounded-full" alt="Shop" />
                  <span className="text-muted-foreground">Mechanic Shop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm box-border"></div>
                  <span className="text-muted-foreground">Client Location</span>
                </div>
              </div>
              <Button
                onClick={detectLocation}
                className="w-full gradient-bg text-primary-foreground text-sm"
                size="sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Detect My Location
              </Button>
            </div>
          </div>

          {/* Active Requests Overlay */}
          <div className="fixed top-32 right-20 glass-card px-4 py-2 z-[500]">
            <span className="text-sm text-muted-foreground">
              <span className="text-green-400 font-semibold">{activeLocations.length}</span> active requests
            </span>
          </div>

        </div>

      </main >
      <AIAssistant />
    </div >
  );
};

export default MechanicMapView;


