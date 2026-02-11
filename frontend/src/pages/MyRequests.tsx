import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairRequestsApi, mechanicApi, RepairRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, CheckCircle, MapPin, Wrench, Phone, Clock, User, AlertCircle, Navigation } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RatingStars from '@/components/RatingStars';
import { ratingApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import socketService from '../services/socket';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMechanic = user?.role === 'MECHANIC';
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Rating State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedRequestToRate, setSelectedRequestToRate] = useState<RepairRequest | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Get current location for navigation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.log('Error getting location', error)
      );
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    
    // Connect to WebSocket
    if (user?.userId) {
        socketService.connect(() => {
            socketService.subscribeToUserNotifications(user.userId, (notification) => {
                console.log("Real-time update received:", notification);
                
                if (notification.type === 'REQUEST_ACCEPTED') {
                    toast({
                        title: 'Request Accepted!',
                        description: 'A mechanic has accepted your request.',
                        className: 'bg-green-500 text-white'
                    });
                    fetchRequests();
                } else if (notification.type === 'REQUEST_REJECTED') {
                    toast({
                        title: 'Request Rejected',
                        description: 'A mechanic rejected your request.',
                        variant: 'destructive'
                    });
                    fetchRequests();
                } else if (notification.type === 'STATUS_UPDATE') {
                    toast({
                        title: 'Status Update',
                        description: `Your request status is now: ${notification.data.status}`,
                    });
                    fetchRequests();
                } else {
                    fetchRequests();
                }
            });
        });
    }

    // Poll for updates (backup)
    const interval = setInterval(fetchRequests, 5000); // 5s polling is sufficient with websockets
    return () => {
        clearInterval(interval);
        socketService.disconnect();
    };
  }, [user]);

  const fetchRequests = async () => {
    try {
      // setIsLoading(true); // Removed to prevent flickering during polling
      let data: RepairRequest[] = [];
      if (user?.role === 'MECHANIC') {
         // Use the new history endpoint that includes rejected requests
         data = await mechanicApi.getWorkHistory();
      } else {
         data = await repairRequestsApi.getMyRequests();
      }
      
      // Sort by newest first
      data.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
      });

      setRequests(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch requests',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateClick = (request: RepairRequest) => {
    setSelectedRequestToRate(request);
    setRatingValue(0); 
    setIsRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedRequestToRate || !selectedRequestToRate.mechanicShopId) return;
    
    if (ratingValue === 0) {
        toast({
            title: "Please select a rating",
            description: "You must select at least 1 star.",
            variant: "destructive"
        });
        return;
    }

    try {
      setIsSubmittingRating(true);
      await ratingApi.submitRating({
        userId: selectedRequestToRate.clientId,
        mechanicShopId: selectedRequestToRate.mechanicShopId,
        rating: ratingValue,
        requestId: selectedRequestToRate.id || ''
      });

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });

      setIsRatingModalOpen(false);
      // Refresh requests to update any local state if needed
      fetchRequests(); 
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit rating",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/5">
        <div className="loading-spinner" />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                {isMechanic ? 'Work History' : 'My Requests'}
            </h1>
            <p className="text-muted-foreground">
                {isMechanic ? 'View your completed repair jobs' : 'View your booked repair requests'}
            </p>
          </div>

        {/* Status Filters - Maybe complete only for mechanic history? But let's keep all for flexibility if API returns more */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(isMechanic ? ['ALL', 'ACCEPTED', 'COMPLETED', 'REJECTED'] : ['ALL', 'ACCEPTED', 'PENDING', 'COMPLETED', 'REJECTED']).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === status
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {status === 'ALL' ? (isMechanic ? 'All Jobs' : 'All Requests') : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="glass-card p-12 text-center fade-in">
            <PackageOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No {filter.toLowerCase()} {isMechanic ? 'jobs' : 'requests'}</h3>
            <p className="text-muted-foreground">
              {filter === 'ALL' 
                ? (isMechanic ? "You haven't completed any jobs yet." : "You haven't made any repair requests yet.")
                : `You don't have any ${filter.toLowerCase()} ${isMechanic ? 'jobs' : 'requests'}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="glass-card p-6 hover-scale fade-in border border-border/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {request.status === 'ACCEPTED' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : request.status === 'REJECTED' ? (
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-500 font-bold">✕</span>
                      </div>
                    ) : request.status === 'COMPLETED' ? (
                       <CheckCircle className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {request.vehicleType.replace('_', ' ')} Repair
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isMechanic ? 'Created' : 'Requested'} on {new Date(request.createdAt || '').toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    request.status === 'ACCEPTED' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : request.status === 'REJECTED'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : request.status === 'COMPLETED'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {request.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Problem Description */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Problem Description :</div>
                    <p className="text-foreground">{request.problemDescription || 'Not mentioned'}</p>
                  </div>

                  {/* AI Suggestion */}
                  {request.repairGuess && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                      <div className="text-sm font-medium text-primary mb-1">AI Suggestion</div>
                      <p className="text-foreground">{request.repairGuess}</p>
                    </div>
                  )}

                  {/* Display Logic for Details */}
                  {isMechanic ? (
                      // For Mechanic: Show Client Details ONLY if Accepted
                      request.status === 'ACCEPTED' && (request.clientName || request.clientPhone) && (
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-3">
                             <User className="w-5 h-5 text-primary" />
                             <div>
                                <div className="text-sm text-muted-foreground">Client Details</div>
                                <div className="font-medium text-foreground">{request.clientName || 'Unknown Name'}</div>
                                {request.clientPhone && <a href={`tel:${request.clientPhone}`} className="text-sm text-primary hover:underline">{request.clientPhone}</a>}
                             </div>
                          </div>
                        </div>
                      )
                  ) : (
                      // For Client: Show Shop/Mechanic Details
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        {(request.shopName || (request.status === 'ACCEPTED' && request.mechanicUserId)) && (
                        <div className="flex items-start gap-3">
                          <Wrench className="w-5 h-5 text-primary mt-1" />
                          <div>
                            <div className="text-sm text-muted-foreground">Assigned Mechanic / Shop</div>
                            <div className="font-medium text-foreground">
                              {request.shopName || (request.status === 'ACCEPTED' ? 'Mechanic on the way' : 'Waiting for mechanic')}
                            </div>
                             {/* Address removed as it is displayed in the location section */}
                             {request.shopPhone && (
                                <div className="mt-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-primary" />
                                    <a href={`tel:${request.shopPhone}`} className="text-sm text-primary hover:underline">{request.shopPhone}</a>
                                </div>
                             )}
                          </div>
                        </div>
                        )}
                        
                        {/* Track Mechanic Button Removed */}
                      </div>
                  )}

                  {/* Location or Action Button */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    {isMechanic ? (
                     
                         (() => {
                            let lat, lng;
                            // Check valid coordinates
                            if (request.clientLocation?.coordinates) {
                                [lng, lat] = request.clientLocation.coordinates;
                            } else if (typeof (request.clientLocation as any)?.x === 'number' && typeof (request.clientLocation as any)?.y === 'number') {
                                lng = (request.clientLocation as any).x;
                                lat = (request.clientLocation as any).y;
                            }

                            const hasValidLocation = lat !== undefined && lng !== undefined;

                            if (!hasValidLocation) {
                                return (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-muted-foreground text-sm font-medium">
                                        <MapPin className="w-4 h-4 opacity-50" />
                                        Location: Not provided
                                    </div>
                                );
                            }

                            // Only show navigation buttons for Accepted requests
                            if (request.status !== 'ACCEPTED') {
                                return null;
                            }

                            return (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        className="gap-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm"
                                        size="sm"
                                        onClick={() => {
                                            const url = currentLocation 
                                                ? `https://www.google.com/maps/dir/?api=1&origin=${currentLocation[0]},${currentLocation[1]}&destination=${lat},${lng}`
                                                : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                       <Navigation className="w-4 h-4" />
                                       Navigate
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        size="sm" 
                                        className="gap-2"
                                        onClick={() => {
                                            navigate(`/mechanic-map?lat=${lat}&lng=${lng}&requestId=${request.id}`);
                                        }}
                                    >
                                        <MapPin className="w-4 h-4" />
                                        View on Map
                                    </Button>
                                </div>
                            );
                         })()
                     
                    ) : (
                        // Client View
                        <>
                            <MapPin className="w-4 h-4" />
                            <span>
                                {request.shopAddress && (request.status === 'ACCEPTED' || request.status === 'COMPLETED') ? (
                                    <>Shop Location: {request.shopAddress}</>
                                ) : (() => {
                                    let lat, lng;
                                    if (request.clientLocation?.coordinates) {
                                      [lng, lat] = request.clientLocation.coordinates;
                                    } else if (typeof (request.clientLocation as any)?.x === 'number' && typeof (request.clientLocation as any)?.y === 'number') {
                                      lng = (request.clientLocation as any).x;
                                      lat = (request.clientLocation as any).y;
                                    }
                                    
                                    if (lat !== undefined && lng !== undefined) {
                                        return <>My Location: {lat.toFixed(4)}, {lng.toFixed(4)}</>;
                                    }
                                    return 'Location not available';
                                })()}
                            </span>
                        </>
                    )}
                  </div>

                  {/* SOS Badge */}
                  {request.type === 'SOS' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Emergency SOS Request
                    </div>
                  )}

                  {/* Rating Section for Completed Requests */}
                  {request.status === 'COMPLETED' && !isMechanic && (
                    <div className="pt-4 border-t border-border mt-4">
                       <h4 className="text-sm font-medium text-foreground mb-2">Rate this Service</h4>
                       <div className="flex items-center gap-4">
                          <RatingStars 
                            rating={0} // Default to 0, or controlled state if we want to track it per request
                            maxRating={5}
                            onChange={(val) => {
                                // We could handle optimized rating via a small inline component or state
                                // For now, let's just use a simple approach: if we want to rate, we enable it.
                                // But mapping state for each request is tricky with just one state variable.
                                // I'll assume we use a specialized sub-component or manage it.
                                // Actually, let's just triggering a modal would be cleaner.
                                // But for this multi-replace, I can't easily add a new function component outside.
                                // Let's use a function in the main component to open a dialog.
                                handleRateClick(request);
                            }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRateClick(request)}
                          >
                            Rate Shop
                          </Button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate Service</DialogTitle>
            <DialogDescription>
              How was your experience with this mechanic?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-4">
             <div className="text-center space-y-2">
                <p className="font-medium">{selectedRequestToRate?.mechanicShopId ? 'Mechanic Shop' : 'Mechanic'}</p>
                <p className="text-sm text-gray-500">Click the stars to rate</p>
             </div>
             <RatingStars 
                rating={ratingValue} 
                maxRating={5} 
                size="lg"
                onChange={setRatingValue}
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingModalOpen(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={isSubmittingRating}>
              {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
