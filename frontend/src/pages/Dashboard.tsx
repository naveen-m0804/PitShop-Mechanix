import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MechanicCard from '@/components/MechanicCard';
import AIAssistant from '@/components/AIAssistant';
import RequestDialog from '@/components/RequestDialog';
import { mechanicsApi, repairRequestsApi, Mechanic } from '@/lib/api';
import { MapPin, Loader2, AlertCircle, RefreshCw, Search, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isShopOpen } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { setLocation } from '@/store/locationSlice';
import { setNearbyShops } from '@/store/shopsSlice';

const Dashboard: React.FC = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [isRequestingAll, setIsRequestingAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(coords);
          // Sync with Redux
          dispatch(setLocation({ latitude: coords.lat, longitude: coords.lng }));
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const fetchMechanics = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      setError(null);
      // Increased radius to 20km as per requirement
      const data = await mechanicsApi.getNearby(lat, lng, 20); 
      setMechanics(data);
      // Sync with Redux so MapView has data immediately
      dispatch(setNearbyShops(data));
    } catch (err) {
      setError('Failed to fetch nearby mechanics. Please try again.');
      toast({
        title: 'Error',
        description: 'Could not load nearby mechanics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeLocation = async () => {
    try {
      setIsLoading(true);
      const coords = await fetchLocation();
      setLocation(coords);
      await fetchMechanics(coords.lat, coords.lng);
    } catch (err: any) {
      if (err.code === 1 || err.message?.includes('Geolocation')) {
        setError('LOCATION_PERMISSION_DENIED');
        toast({
          title: 'Location Required',
          description: 'Please enable location access in your browser',
          variant: 'destructive',
        });
      } else {
        setError('API_ERROR');
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  const handleRefresh = () => {
    if (location) {
      fetchMechanics(location.lat, location.lng);
    } else {
      initializeLocation();
    }
  };

  // Helper to calculate distance (Haversine formula approximation)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const filteredMechanics = mechanics.filter(
    (m) =>
      m.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableMechanics = filteredMechanics.filter((m) => {
      const isOpen = isShopOpen(m.openTime, m.closeTime || '');
      return m.isAvailable && isOpen;
  });

  // Request Handlers
  const handleRequestClick = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setIsRequestingAll(false);
    setIsDialogOpen(true);
  };

  const handleRequestAllClick = () => {
    if (filteredMechanics.length === 0) {
        toast({ title: 'No mechanics to request', variant: "destructive" });
        return;
    }
    setSelectedMechanic(null);
    setIsRequestingAll(true);
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = async (data: { vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER'; problemDescription: string }) => {
    if (!location) return;
    setIsSubmitting(true);

    try {
      const baseRequest = {
        vehicleType: data.vehicleType,
        problemDescription: data.problemDescription,
        type: 'NORMAL',
        clientLocation: {
          latitude: location.lat,
          longitude: location.lng
        } as any,
        clientId: localStorage.getItem('userId'), // Ensure userId is available or backend handles it from token
      };

      if (isRequestingAll) {
        // Send request to ALL filtered mechanics
        // Note: Ideally backend should have a bulk endpoint, but we loop for now as per plan
        const validMechanics = filteredMechanics
            .filter(m => m.isAvailable)
            .filter(m => isShopOpen(m.openTime, m.closeTime))
            .filter(m => m.shopTypes.includes(data.vehicleType));

        if (validMechanics.length === 0) {
            toast({
                title: 'No Mechanics Found',
                description: `No available ${data.vehicleType.toLowerCase().replace('_', ' ')} mechanics found nearby.`,
                variant: "destructive"
            });
            setIsSubmitting(false);
            return;
        }

        const promises = validMechanics.map(m => repairRequestsApi.create({
                ...baseRequest,
                mechanicShopId: m.id
            }));
            
        await Promise.allSettled(promises);
        
        toast({
            title: 'Requests Sent',
            description: `Sent requests to ${promises.length} mechanics. The first to accept will get the job.`,
        });
      } else if (selectedMechanic) {
        // Send single request
        await repairRequestsApi.create({
            ...baseRequest,
            mechanicShopId: selectedMechanic.id
        });
        
        toast({
            title: 'Request Sent',
            description: `Request sent to ${selectedMechanic.shopName}`,
        });
      }

      setIsDialogOpen(false);
      navigate('/my-requests'); // Redirect to track requests

    } catch (error: any) {
      console.error("Request failed", error);
      toast({
        title: 'Request Failed',
        description: error.response?.data?.message || 'Failed to send request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 slide-up flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Find <span className="gradient-text">Mechanics</span> Near You
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {location ? (
                    <span>
                    Showing results near {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                ) : (
                    <span>Detecting your location...</span>
                )}
                </div>
            </div>
            
            {availableMechanics.length > 0 && (
                 <Button 
                    onClick={handleRequestAllClick}
                    className="gradient-bg glow-button border-none shadow-lg animate-pulse w-full md:w-auto"
                    size="lg"
                 >
                    <Zap className="w-4 h-4 mr-2" />
                    Request All Nearby ({availableMechanics.length})
                 </Button>
            )}
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by shop name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 input-glass h-12 w-full"
              />
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="h-12 border-border hover:bg-secondary/50 w-full sm:w-auto"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 fade-in">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Finding mechanics near you...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center fade-in">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {error === 'LOCATION_PERMISSION_DENIED' 
                  ? 'Location Access Needed' 
                  : 'Could not load mechanics'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {error === 'LOCATION_PERMISSION_DENIED'
                  ? 'Please enable location access to find nearby mechanics'
                  : 'Failed to fetch nearby mechanics. Please try again.'
                }
              </p>
              <Button 
                onClick={error === 'LOCATION_PERMISSION_DENIED' ? initializeLocation : handleRefresh} 
                className="gradient-bg text-primary-foreground"
              >
                {error === 'LOCATION_PERMISSION_DENIED' ? (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Enable Location
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          ) : filteredMechanics.length === 0 ? (
            <div className="glass-card p-8 text-center fade-in">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                No Mechanics Found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'No mechanics available in your area (20km) right now'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMechanics
                .map((mechanic) => {
                  let dist = 0;
                  if (location && mechanic.location?.coordinates) {
                      dist = calculateDistance(
                          location.lat, 
                          location.lng, 
                          mechanic.location.coordinates[1], 
                          mechanic.location.coordinates[0]
                      );
                  } else if (mechanic.distance) {
                      dist = mechanic.distance;
                  }
                  const isOpen = isShopOpen(mechanic.openTime, mechanic.openTime && mechanic.closeTime ? mechanic.closeTime : '');
                  const isEffectivelyAvailable = mechanic.isAvailable && isOpen;
                  return { ...mechanic, calculatedDistance: dist, isEffectivelyAvailable, isOpen };
                })
                .sort((a, b) => {
                    // 1. Availability (Available first)
                    if (a.isEffectivelyAvailable !== b.isEffectivelyAvailable) {
                        return a.isEffectivelyAvailable ? -1 : 1;
                    }
                    // 2. Distance (Nearest first)
                    return a.calculatedDistance - b.calculatedDistance;
                })
                .map((mechanic, index) => {
                return (
                    <div
                    key={mechanic.id}
                    className="fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    >
                    <MechanicCard 
                        mechanic={mechanic} 
                        distance={mechanic.calculatedDistance}
                        onRequest={handleRequestClick}
                    />
                    </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {!isLoading && !error && mechanics.length > 0 && (
            <div className="mt-8 text-center text-muted-foreground fade-in">
              Found <span className="text-primary font-semibold">{mechanics.length}</span> mechanics
              within 20km of your location
            </div>
          )}
        </div>
      </main>
      
      {/* Request Dialog */}
      <RequestDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        mechanicName={isRequestingAll ? undefined : selectedMechanic?.shopName}
        shopTypes={selectedMechanic?.shopTypes}
        isSubmitting={isSubmitting}
      />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};
export default Dashboard;
