import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setLocation } from '@/store/locationSlice';
import { fetchNearbyShops } from '@/store/shopsSlice';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import Navbar from '@/components/Navbar';
import RatingStars from '@/components/RatingStars';
import AIAssistant from '@/components/AIAssistant';
import { mechanicsApi, Mechanic } from '@/lib/api';
import { Loader2, Phone, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom mechanic marker icon (Custom Image)
const mechanicIcon = new L.Icon({
  iconUrl: '/mechanic-shop-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: 'rounded-full border-2 border-white shadow-lg'
});

// User location marker (DARK BLUE)
const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="8" fill="#1e3a8a" stroke="white" stroke-width="3"/>
</svg>`;
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(userSvg),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface RecenterProps {
  target: [number, number] | null;
  zoom?: number;
}

const RecenterOnTarget: React.FC<RecenterProps> = ({ target, zoom = 13 }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.setView(target, zoom);
    }
  }, [target, zoom, map]);
  return null;
};

// Custom component to draw radius circle using Leaflet API directly
interface RadiusCircleProps {
  center: [number, number];
  radius: number;
}

const RadiusCircle: React.FC<RadiusCircleProps> = ({ center, radius }) => {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!map || !center) return;

    try {
      // Remove existing circle if it exists
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }

      // Create circle using Leaflet's L.circle
      circleRef.current = L.circle(center, {
        radius: radius,
        color: '#3b82f6',
        fillColor: '#93c5fd',
        fillOpacity: 0.25,
        weight: 4,
        opacity: 0.8,
      });

      // Add to map
      circleRef.current.addTo(map);

      console.log('Radius circle added to map', { center, radius });
    } catch (error) {
      console.error('Error adding radius circle:', error);
    }

    // Cleanup on unmount or when center/radius changes
    return () => {
      if (circleRef.current && map) {
        try {
          map.removeLayer(circleRef.current);
        } catch (error) {
          console.error('Error removing circle:', error);
        }
      }
    };
  }, [center, radius, map]);

  return null;
};

interface FitBoundsProps {
  points: [number, number][];
  padding?: [number, number];
  maxZoom?: number;
}

const FitBounds: React.FC<FitBoundsProps> = ({ points, padding = [50, 50], maxZoom = 13 }) => {
  const map = useMap();
  const hasFitRef = useRef(false);

  useEffect(() => {
    if (!map || points.length === 0) return;
    if (hasFitRef.current) return;

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: L.point(padding[0], padding[1]), maxZoom });
    hasFitRef.current = true;
  }, [map, points, padding, maxZoom]);

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const MapView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { nearbyShops } = useSelector((state: any) => state.shops);
  const { currentLocation } = useSelector((state: any) => state.location);

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  // Use global state for mechanics if available, or fetch locally if needed (though LocationTracker handles it)
  // For now, let's defer to the ones in Redux for consistency

  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai
  const [mapReady, setMapReady] = useState(false);
  const [recenterTarget, setRecenterTarget] = useState<[number, number] | null>(null);
  const highlightedId = searchParams.get('id');
  const hasCenteredRef = useRef(false);

  // Derived state to use resolved coordinates
  const mechanicPoints = nearbyShops
    .map(resolveLatLng)
    .filter((p): p is [number, number] => Array.isArray(p));

  // Sync Redux location to Map Center

  const safeNearbyCount = currentLocation
    ? nearbyShops.filter((shop: Mechanic) => {
      const coords = resolveLatLng(shop);
      if (!coords) return false;
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        coords[0],
        coords[1]
      );
      return dist <= 20000; // 20km radius
    }).length
    : nearbyShops.length;

  useEffect(() => {
    if (currentLocation && !hasCenteredRef.current) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
      hasCenteredRef.current = true;
      setIsLoading(false);
      setMapReady(true);
    } else if (currentLocation) {
      // Just ensure loading is done
      setIsLoading(false);
      setMapReady(true);
    }

    // Fallback if no location yet
    const timer = setTimeout(() => {
      setIsLoading(false);
      setMapReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentLocation]);

  // Initial fetch for "All" mechanics if needed, but nearbyShops from Redux is primarily what we show.
  // We can keep the "All Shops" fetch purely for the "All" view if we want, but for now let's show nearby.

  useEffect(() => {
    // If we have URL params for lat/long, override center
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');
    if (urlLat && urlLng) {
      setMapCenter([parseFloat(urlLat), parseFloat(urlLng)]);
      hasCenteredRef.current = true;
    }
  }, [searchParams]);

  const getDirections = (lat: number, lng: number) => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    if (currentLocation) {
      url += `&origin=${currentLocation.latitude},${currentLocation.longitude}`;
    }
    window.open(url, '_blank');
  };

  const recenterMap = () => {
    if (currentLocation) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
      setRecenterTarget([currentLocation.latitude, currentLocation.longitude]);
      toast({
        title: 'Location Updated',
        description: 'Centered on your current location.',
      });
    } else {
      // Manual detection fallback
      if (navigator.geolocation) {
        toast({
          title: 'Detecting Location...',
          description: 'Please wait while we fetch your location.',
        });
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc = { latitude, longitude };
            dispatch(setLocation(newLoc));
            // Also fetch shops manually to ensure data presence
            dispatch(fetchNearbyShops({ lat: latitude, lng: longitude, radius: 5000000 }) as any);
            setMapCenter([latitude, longitude]);
            setRecenterTarget([latitude, longitude]);
            toast({
              title: 'Location Found',
              description: 'Map centered on your location.',
            });
          },
          (error) => {
            console.error('Manual location detection failed:', error);
            toast({
              title: 'Detection Failed',
              description: 'Could not access your location. Please check permissions.',
              variant: 'destructive',
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        toast({
          title: 'Location Not Supported',
          description: 'Your browser does not support geolocation.',
          variant: 'destructive',
        });
      }
    }
  };

  // Auto-detect location on mount if missing
  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      toast({
        title: 'Detecting Location...',
        description: 'Fetching your current location.',
      });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLoc = { latitude, longitude };
          dispatch(setLocation(newLoc));
          // Fetch ALL shops (large radius)
          dispatch(fetchNearbyShops({ lat: latitude, lng: longitude, radius: 5000000 }) as any);
          setMapCenter([latitude, longitude]);
          setRecenterTarget([latitude, longitude]);
          toast({
            title: 'Location Found',
            description: 'Map centered on your location.',
          });
        },
        (error) => {
          console.error('Auto detection failed:', error);
          // Silent fail or toast, LocationTracker might still pick it up
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [dispatch, currentLocation]);

  if (isLoading && !mapReady) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 h-screen">
        <div className="h-[calc(100vh-80px)] p-4">
          <div className="h-full rounded-2xl overflow-hidden glass-card">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
              zoomControl={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <RecenterOnTarget target={recenterTarget} />

              <FitBounds
                points={[
                  ...(currentLocation ? [[currentLocation.latitude, currentLocation.longitude] as [number, number]] : []),
                  ...mechanicPoints
                ]}
                maxZoom={12}
              />

              {/* 50km radius circle around user - using custom component */}
              {currentLocation && (
                <RadiusCircle center={[currentLocation.latitude, currentLocation.longitude]} radius={20000} />
              )}

              {/* User location marker */}
              {currentLocation && (
                <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={userIcon}>
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-semibold text-white">Your Location</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Mechanic markers */}
              {nearbyShops
                .map((mechanic: Mechanic) => ({
                  mechanic,
                  latLng: resolveLatLng(mechanic),
                }))
                .filter((item: any): item is { mechanic: Mechanic; latLng: [number, number] } => Array.isArray(item.latLng))
                .map(({ mechanic, latLng }: { mechanic: Mechanic; latLng: [number, number] }) => {
                  const [lat, lng] = latLng;
                  const isHighlighted = mechanic.id === highlightedId;
                  // const isNearby = nearbyMechanics.some((m) => m.id === mechanic.id); // No longer needed for icon distinction

                  return (
                    <Marker
                      key={mechanic.id}
                      position={[lat, lng]}
                      icon={mechanicIcon}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
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
                          <button
                            onClick={() => getDirections(lat, lng)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            Get Directions
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>
        </div>

        {/* Map Legend */}
        <div className="fixed bottom-8 left-8 glass-card p-4 z-[1000]">
          <h4 className="font-semibold text-foreground mb-3 text-sm">Map Legend</h4>
          <div className="flex flex-col gap-2 text-sm mb-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#1e3a8a]"></div>
              <span className="text-muted-foreground">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/mechanic-shop-icon.png" className="w-4 h-4 rounded-full" alt="Shop" />
              <span className="text-muted-foreground">Mechanic Shop</span>
            </div>
          </div>
          <Button
            onClick={recenterMap}
            className="w-full gradient-bg text-primary-foreground text-sm"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Detect My Location
          </Button>
        </div>

        {/* Mechanics count - equal spacing from edges */}
        <div className="fixed top-40 right-20 glass-card px-4 py-2 z-[500]">
          <span className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">{safeNearbyCount}</span> mechanics shop nearby
          </span>
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default MapView;
