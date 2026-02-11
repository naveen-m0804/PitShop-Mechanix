import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mechanicsApi, Mechanic } from '@/lib/api';
import { isShopOpen, formatTime12Hour } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Clock, Star, Wrench, ArrowLeft, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import api, { ratingApi, repairRequestsApi } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MechanicDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  // Form state
  const [vehicleType, setVehicleType] = useState<'TWO_WHEELER' | 'FOUR_WHEELER'>('TWO_WHEELER');
  const [problemDescription, setProblemDescription] = useState('');
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (id) fetchMechanic();
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (mechanic) {
        if (mechanic.shopTypes.length === 1) {
             setVehicleType(mechanic.shopTypes[0] as any);
        } else if (mechanic.shopTypes.length > 0 && !mechanic.shopTypes.includes(vehicleType)) {
             setVehicleType(mechanic.shopTypes[0] as any);
        }
    }
  }, [mechanic]);

  const fetchMechanic = async () => {
    try {
      setIsLoading(true);
      const data = await mechanicsApi.getById(id!);
      setMechanic(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch mechanic details',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mechanic) return;

    // Problem description is now optional

    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Please enable location access to send a request to this shop.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestData = {
        mechanicShopId: mechanic.id,
        vehicleType,
        problemDescription,
        type: 'NORMAL',
        clientLocation: {
          latitude: location.lat,
          longitude: location.lng,
        } as any,
        clientId: localStorage.getItem('userId') || undefined,
      };

      await repairRequestsApi.create(requestData);

      toast({
        title: 'Success',
        description: 'Repair request submitted successfully!',
      });

      navigate('/my-requests');
    } catch (error: any) {
      const rawMessage = error.response?.data?.message || error.message || '';
      const isLocationError = rawMessage.toLowerCase().includes('clientlocation');
      const friendlyMessage = isLocationError
        ? 'We need your location to send this request. Please enable location access and try again.'
        : rawMessage || 'Failed to submit request';
      toast({
        title: 'Error',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handeSubmitRating = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            toast({ title: 'Error', description: 'You must be logged in to rate', variant: 'destructive' });
            return;
        }

        await ratingApi.submitRating({
            userId: userId,
            mechanicShopId: mechanic!.id,
            rating: rating
        });
        
        toast({ title: 'Success', description: 'Rating submitted successfully' });
        setIsRatingOpen(false);
        fetchMechanic(); // Refresh to see new rating
      } catch (error: any) {
        toast({ title: 'Error', description: 'Failed to submit rating', variant: 'destructive' });
      }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/5">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!mechanic) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Mechanic Details */}
        <div className="glass-card p-8 fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  {mechanic.shopName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-foreground">
                    {mechanic.rating.toFixed(1)} ({mechanic.totalRatings} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
                {(() => {
                  const isOpen = isShopOpen(mechanic.openTime, mechanic.openTime && mechanic.closeTime ? mechanic.closeTime : '');
                  return (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      mechanic.isAvailable && isOpen
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {mechanic.isAvailable && isOpen ? 'Available' : (!isOpen ? 'Closed' : 'Busy')}
                    </div>
                  );
                })()}
                <Button variant="outline" size="sm" onClick={() => setIsRatingOpen(true)}>
                    Rate Shop
                </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{mechanic.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                  <div className="font-medium">{formatTime12Hour(mechanic.openTime)} - {formatTime12Hour(mechanic.closeTime)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <div className="text-sm text-muted-foreground">Vehicle Types</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mechanic.shopTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                    >
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 text-foreground">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div>{mechanic.address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-foreground">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Services Offered</div>
                <div className="whitespace-pre-wrap">{mechanic.servicesOffered || 'No specific services listed.'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Request Form */}
        <div className="glass-card p-8 fade-in">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Create Repair Request
          </h2>

          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vehicle Type
              </label>
              {mechanic.shopTypes.length === 1 ? (
                 <div className="p-3 bg-secondary/20 rounded-md border border-white/10 text-sm font-medium">
                    {mechanic.shopTypes[0].replace('_', ' ')} Only
                 </div>
              ) : (
                  <Select value={vehicleType} onValueChange={(value: any) => setVehicleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {mechanic.shopTypes.includes('TWO_WHEELER') && (
                          <SelectItem value="TWO_WHEELER">Two Wheeler</SelectItem>
                      )}
                      {mechanic.shopTypes.includes('FOUR_WHEELER') && (
                          <SelectItem value="FOUR_WHEELER">Four Wheeler</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Problem Description
              </label>
              <Textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe the issue with your vehicle..."
                rows={4}
              />
            </div>

            {/* AI Suggestion Removed */}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="gradient-bg text-primary-foreground flex-1"
                disabled={isSubmitting || isLocating || !location || !mechanic.isAvailable || !isShopOpen(mechanic.openTime, mechanic.openTime && mechanic.closeTime ? mechanic.closeTime : '')}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
            <DialogContent className="glass-card border-none text-foreground">
                <DialogHeader>
                    <DialogTitle>Rate {mechanic.shopName}</DialogTitle>
                    <DialogDescription>
                        How was your experience with this shop?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-8 h-8 cursor-pointer transition-colors ${
                                star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                            }`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRatingOpen(false)}>Cancel</Button>
                    <Button className="gradient-bg" onClick={handeSubmitRating} disabled={rating === 0}>Submit Rating</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
}
