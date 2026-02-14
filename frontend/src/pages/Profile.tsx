import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, UserProfile } from '@/lib/api';
import { isShopOpen, formatTime12Hour } from '@/lib/utils';
import { User, Wrench, Phone, Mail, Clock, MapPin, Star, Edit2, X, Check, FileText, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Edit form states
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedShopName, setEditedShopName] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedOpenTime, setEditedOpenTime] = useState('');
  const [editedCloseTime, setEditedCloseTime] = useState('');
  const [editedIsAvailable, setEditedIsAvailable] = useState(false);
  const [editedLatitude, setEditedLatitude] = useState<number | null>(null);
  const [editedLongitude, setEditedLongitude] = useState<number | null>(null);
  const [editedShopTypes, setEditedShopTypes] = useState<string[]>([]);
  const [editedServicesOffered, setEditedServicesOffered] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      // Initialize edit fields
      setEditedName(data.name);
      setEditedPhone(data.phone || '');
      if (data.mechanicShop) {
        setEditedShopName(data.mechanicShop.shopName);
        setEditedAddress(data.mechanicShop.address);
        setEditedOpenTime(data.mechanicShop.openTime);
        setEditedCloseTime(data.mechanicShop.closeTime);
        setEditedIsAvailable(data.mechanicShop.isAvailable);
        setEditedShopTypes(data.mechanicShop.shopTypes);
        setEditedServicesOffered(data.mechanicShop.servicesOffered || '');
        if (data.mechanicShop.location) {
          setEditedLongitude(data.mechanicShop.location.coordinates[0]);
          setEditedLatitude(data.mechanicShop.location.coordinates[1]);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEditedLatitude(position.coords.latitude);
        setEditedLongitude(position.coords.longitude);
        setIsDetectingLocation(false);
        toast({
          title: 'Location detected',
          description: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setIsDetectingLocation(false);
        toast({
          title: 'Location error',
          description: 'Unable to retrieve your location',
          variant: 'destructive',
        });
      }
    );
  };

  const handleCancel = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedPhone(profile.phone || '');
      if (profile.mechanicShop) {
        setEditedShopName(profile.mechanicShop.shopName);
        setEditedAddress(profile.mechanicShop.address);
        setEditedOpenTime(profile.mechanicShop.openTime);
        setEditedCloseTime(profile.mechanicShop.closeTime);
        setEditedIsAvailable(profile.mechanicShop.isAvailable);
        setEditedShopTypes(profile.mechanicShop.shopTypes);
        setEditedServicesOffered(profile.mechanicShop.servicesOffered || '');
        if (profile.mechanicShop.location) {
          setEditedLongitude(profile.mechanicShop.location.coordinates[0]);
          setEditedLatitude(profile.mechanicShop.location.coordinates[1]);
        }
      }
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update basic profile
      const updatedProfile = await userApi.updateProfile({
        name: editedName,
        phone: editedPhone,
      });

      // If mechanic, update shop details
      if (profile?.role === 'MECHANIC' && profile.mechanicShop) {
        if (profile.mechanicShop) {
          const locationData = (editedLatitude && editedLongitude) ? {
            latitude: editedLatitude,
            longitude: editedLongitude
          } : (profile.mechanicShop.location ? {
            latitude: profile.mechanicShop.location.coordinates[1],
            longitude: profile.mechanicShop.location.coordinates[0]
          } : {
            latitude: 0,
            longitude: 0
          });

          await userApi.updateMechanicShop({
            shopName: editedShopName,
            phone: editedPhone || profile.phone, // Use edited phone as shop phone or fallback to user phone
            address: editedAddress,
            shopTypes: editedShopTypes, 
            openTime: editedOpenTime,
            closeTime: editedCloseTime,
            isAvailable: editedIsAvailable,
            servicesOffered: editedServicesOffered,
            location: locationData
          });
        }
      }

      // Refresh profile
      await fetchProfile();

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
        if (window.confirm("Please confirm again: Do you really want to delete your account?")) {
            try {
                await userApi.deleteAccount();
                toast({
                    title: 'Account Deleted',
                    description: 'Your account has been successfully deleted.',
                });
                logout();
                navigate('/');
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to delete account',
                    variant: 'destructive',
                });
            }
        }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/5">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!profile) return null;

  const isMechanic = profile.role === 'MECHANIC';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="glass-card p-8 fade-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="capitalize inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{profile.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                {isEditing ? (
                  <Input
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1 input-glass"
                  />
                ) : (
                  <div className="font-medium">{profile.phone || 'Not provided'}</div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mb-6 pb-6 border-b border-border">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Full Name
              </label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your name"
                className="input-glass"
              />
            </div>
          )}

          {/* Edit/Save/Cancel Buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="gradient-bg text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gradient-bg text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="border-border hover:bg-secondary/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mechanic Shop Details */}
        {isMechanic && profile.mechanicShop && (
          <div className="glass-card p-8 fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-display font-bold text-foreground">
                Shop Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Shop Name</div>
                {isEditing ? (
                  <Input
                    value={editedShopName}
                    onChange={(e) => setEditedShopName(e.target.value)}
                    placeholder="Shop name"
                    className="input-glass"
                  />
                ) : (
                  <div className="text-lg font-semibold text-foreground">
                    {profile.mechanicShop.shopName}
                  </div>
                )}
              </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Opening Time
                  </Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editedOpenTime}
                        onChange={(e) => setEditedOpenTime(e.target.value)}
                        className="input-glass"
                      />
                    ) : (
                      <div className="font-medium text-foreground">{formatTime12Hour(profile.mechanicShop.openTime)}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                     <Clock className="w-4 h-4 text-primary" />
                     Closing Time
                  </Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={editedCloseTime}
                        onChange={(e) => setEditedCloseTime(e.target.value)}
                        className="input-glass"
                      />
                    ) : (
                      <div className="font-medium text-foreground">{formatTime12Hour(profile.mechanicShop.closeTime)}</div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-primary" />
                        <div className="text-sm text-muted-foreground">Shop Types</div>
                    </div>
                       {isEditing ? (
                          <div className="flex flex-wrap gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editedShopTypes.includes('TWO_WHEELER')}
                                onChange={(e) => {
                                  if (e.target.checked) setEditedShopTypes([...editedShopTypes, 'TWO_WHEELER']);
                                  else setEditedShopTypes(editedShopTypes.filter(t => t !== 'TWO_WHEELER'));
                                }}
                                className="rounded border-primary text-primary focus:ring-primary h-4 w-4"
                              />
                              <span className="text-sm">Two Wheeler</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editedShopTypes.includes('FOUR_WHEELER')}
                                onChange={(e) => {
                                  if (e.target.checked) setEditedShopTypes([...editedShopTypes, 'FOUR_WHEELER']);
                                  else setEditedShopTypes(editedShopTypes.filter(t => t !== 'FOUR_WHEELER'));
                                }}
                                className="rounded border-primary text-primary focus:ring-primary h-4 w-4"
                              />
                              <span className="text-sm">Four Wheeler</span>
                            </label>
                          </div>
                       ) : (
                           <div className="flex flex-wrap gap-2">
                              {profile.mechanicShop.shopTypes.map((type) => (
                              <span
                                  key={type}
                                  className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                              >
                                  {type.replace('_', ' ')}
                              </span>
                              ))}
                            </div>
                       )}
                    </div>
                </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div className="text-sm text-muted-foreground">Address</div>
                </div>
                {isEditing ? (
                  <Input
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    placeholder="Shop address"
                    className="input-glass"
                  />
                ) : (
                  <div className="text-foreground">{profile.mechanicShop.address}</div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="text-sm text-muted-foreground">Services Offered</div>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedServicesOffered}
                    onChange={(e) => setEditedServicesOffered(e.target.value)}
                    placeholder="Describe your services (e.g. Engine Repair, Oil Change, Tire Replacement)"
                    className="input-glass min-h-[100px]"
                  />
                ) : (
                  <div className="text-foreground whitespace-pre-wrap">{profile.mechanicShop.servicesOffered || 'No services listed.'}</div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                   <MapPin className="w-5 h-5 text-primary" />
                   <div className="text-sm text-muted-foreground">Location</div>
                </div>
                 {isEditing ? (
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4 mb-3">
                      <Button
                        type="button"
                        onClick={detectLocation}
                        variant="outline"
                        className="flex items-center gap-2 border-primary/50 text-foreground hover:bg-primary/10"
                        disabled={isDetectingLocation}
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                        {isDetectingLocation ? 'Detecting...' : 'Detect My Location'}
                      </Button>
                      {editedLatitude && editedLongitude && (
                        <span className="text-sm text-green-400 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-4 h-4" />
                          Detected
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Latitude</Label>
                            <Input 
                                type="number" 
                                value={editedLatitude ?? ''} 
                                onChange={(e) => setEditedLatitude(parseFloat(e.target.value))} 
                                className="input-glass"
                                placeholder="0.0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Longitude</Label>
                            <Input 
                                type="number" 
                                value={editedLongitude ?? ''} 
                                onChange={(e) => setEditedLongitude(parseFloat(e.target.value))} 
                                className="input-glass"
                                placeholder="0.0000"
                            />
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-foreground text-sm text-gray-400">
                    {profile.mechanicShop.location ? (
                       `Lat: ${profile.mechanicShop.location.coordinates[1].toFixed(4)}, Lng: ${profile.mechanicShop.location.coordinates[0].toFixed(4)}`
                    ) : 'Location not set'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="font-medium text-foreground">
                    {profile.mechanicShop.rating.toFixed(1)} ({profile.mechanicShop.totalRatings} reviews)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedIsAvailable}
                      onChange={(e) => setEditedIsAvailable(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Available for requests</span>
                  </label>
                ) : (
                  <>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profile.mechanicShop.isAvailable 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {profile.mechanicShop.isAvailable ? 'Available' : 'Unavailable'}
                    </div>

                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Danger Zone */}
        {!isEditing && (
            <div className="glass-card p-8 fade-in border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-display font-bold text-red-500">
                Danger Zone
                </h2>
            </div>
            <p className="text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white"
            >
                Delete Account
            </Button>
            </div>
        )}
      </div>
      </div>
    </div>
  );
}