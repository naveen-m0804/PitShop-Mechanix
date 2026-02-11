import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AIAssistant from '@/components/AIAssistant';
import { repairRequestsApi, RepairRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Car,
  Bike,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  Send,
  AlertCircle,
} from 'lucide-react';

type VehicleType = 'TWO_WHEELER' | 'FOUR_WHEELER';
type RequestType = 'NORMAL' | 'SOS';

const CreateRequest: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>('FOUR_WHEELER');
  const [requestType, setRequestType] = useState<RequestType>('NORMAL');
  const [problemDescription, setProblemDescription] = useState('');
  const [repairGuess, setRepairGuess] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAISuggestion = (suggestion: string) => {
    setRepairGuess(suggestion);
  };

  useEffect(() => {
    if (navigator.geolocation) {
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
          toast({
            title: 'Location Required',
            description: 'Please enable location access to submit a request',
            variant: 'destructive',
          });
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!problemDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your vehicle problem',
        variant: 'destructive',
      });
      return;
    }

    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Unable to detect your location. Please enable GPS.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.userId) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in again',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const request: RepairRequest = {
        clientId: user.userId,
        vehicleType,
        problemDescription: problemDescription.trim(),
        aiSuggestion: repairGuess.trim() || undefined,
        type: requestType,
        clientLocation: {
          latitude: location.lat,
          longitude: location.lng,
        } as any,
      };

      await repairRequestsApi.create(request);

      toast({
        title: requestType === 'SOS' ? '🚨 SOS Request Sent!' : '✅ Request Submitted!',
        description:
          requestType === 'SOS'
            ? 'Nearby mechanics have been alerted'
            : 'Mechanics will respond shortly',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'Could not send your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 slide-up text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Create <span className="gradient-text">Repair Request</span>
            </h1>
            <p className="text-muted-foreground">
              Describe your issue and we'll connect you with nearby mechanics
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 fade-in">
            {/* Vehicle Type */}
            <div className="glass-card p-6">
              <Label className="text-lg font-display font-semibold text-foreground mb-4 block">
                Vehicle Type
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setVehicleType('TWO_WHEELER')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    vehicleType === 'TWO_WHEELER'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Bike className="w-10 h-10" />
                  <span className="font-medium">Two Wheeler</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleType('FOUR_WHEELER')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    vehicleType === 'FOUR_WHEELER'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Car className="w-10 h-10" />
                  <span className="font-medium">Four Wheeler</span>
                </button>
              </div>
            </div>

            {/* Problem Description */}
            <div className="glass-card p-6">
              <Label htmlFor="problem" className="text-lg font-display font-semibold text-foreground mb-4 block">
                Problem Description *
              </Label>
              <Textarea
                id="problem"
                placeholder="Describe what's wrong with your vehicle..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="input-glass min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Repair Guess */}
            <div className="glass-card p-6">
              <Label htmlFor="guess" className="text-lg font-display font-semibold text-foreground mb-2 block">
                Your Guess (Optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                What do you think might be the issue?
              </p>
              <Input
                id="guess"
                placeholder="e.g., Battery issue, flat tire, engine problem..."
                value={repairGuess}
                onChange={(e) => setRepairGuess(e.target.value)}
                className="input-glass h-12"
                disabled={isLoading}
              />
            </div>

            {/* Request Type */}
            <div className="glass-card p-6">
              <Label className="text-lg font-display font-semibold text-foreground mb-4 block">
                Request Type
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRequestType('NORMAL')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    requestType === 'NORMAL'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <CheckCircle className="w-10 h-10" />
                  <span className="font-medium">Normal</span>
                  <span className="text-xs text-muted-foreground">Standard request</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('SOS')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                    requestType === 'SOS'
                      ? 'border-destructive bg-destructive/10 text-foreground sos-pulse'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-destructive/50'
                  }`}
                >
                  <AlertTriangle className="w-10 h-10" />
                  <span className="font-medium">SOS</span>
                  <span className="text-xs text-muted-foreground">Emergency help</span>
                </button>
              </div>
              {requestType === 'SOS' && (
                <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    SOS requests alert all nearby mechanics immediately. Use this only for emergencies.
                  </p>
                </div>
              )}
            </div>

            {/* Location Status */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3">
                {isLocating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Detecting your location...</span>
                  </>
                ) : location ? (
                  <>
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-foreground">
                      Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive">Location access required</span>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full h-14 text-lg font-semibold ${
                requestType === 'SOS'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'gradient-bg glow-button text-primary-foreground'
              }`}
              disabled={isLoading || isLocating || !location}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  {requestType === 'SOS' ? 'Send SOS Request' : 'Submit Request'}
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant onSuggestion={handleAISuggestion} />
    </div>
  );
};

export default CreateRequest;
