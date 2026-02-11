import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wrench, Mail, Lock, User, Phone, Loader2, Car, Cog, Eye, EyeOff, MapPin, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Role = 'CLIENT' | 'MECHANIC';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [shopTypes, setShopTypes] = useState<string[]>([]);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [role, setRole] = useState<Role>('CLIENT');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLoading(false);
        toast({
          title: 'Location detected',
          description: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: 'Location error',
          description: 'Unable to retrieve your location',
          variant: 'destructive',
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (role === 'MECHANIC') {
      if (!shopName || !address || !servicesOffered || shopTypes.length === 0) {
        toast({
          title: 'Missing shop details',
          description: 'Please provide shop name, address, services offered, and at least one service type',
          variant: 'destructive',
        });
        return;
      }

      if (!latitude || !longitude) {
        toast({
          title: 'Location required',
          description: 'Please detect your location using the Detect My Location button',
          variant: 'destructive',
        });
        return;
      }
    }

    if (password.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await register({ 
      name, 
      email, 
      phone, 
      password, 
      role,

      ...(role === 'MECHANIC' ? { 
        shopName, 
        address, 
        servicesOffered,
        shopTypes, 
        openTime, 
        closeTime,
        latitude: latitude,
        longitude: longitude 
      } : {})
    });
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Please log in with your credentials',
      });
      navigate('/login');
    } else {
      toast({
        title: 'Registration failed',
        description: result.error || 'Could not create account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="absolute top-20 left-10 md:left-20 opacity-10 animate-float hidden md:block">
        <Cog className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-20 right-10 md:right-20 opacity-10 animate-float hidden md:block" style={{ animationDelay: '1s' }}>
        <Car className="w-28 h-28 text-primary" />
      </div>

      <div className="w-full max-w-md fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-4">
            <Wrench className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            PitShop<span className="gradient-text"> Mechanix</span>
          </h1>
          <p className="text-muted-foreground mt-2">Join our network today</p>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-6 text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 input-glass h-12"
                  disabled={isLoading}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 input-glass h-12"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-11 input-glass h-12"
                  disabled={isLoading}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 input-glass h-12"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                    role === 'CLIENT'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                  disabled={isLoading}
                >
                  <Car className="w-6 h-6" />
                  <span className="font-medium">Vehicle Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('MECHANIC')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                    role === 'MECHANIC'
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  }`}
                  disabled={isLoading}
                >
                  <Wrench className="w-6 h-6" />
                  <span className="font-medium">Mechanic</span>
                </button>
              </div>
            </div>

            {/* Shop Details (Only for Mechanics) */}
            {role === 'MECHANIC' && (
              <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="shopName" className="text-foreground">Shop Name</Label>
                  <div className="relative">
                    <Input
                      id="shopName"
                      type="text"
                      placeholder="Joe's Garage"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="pl-11 input-glass h-12"
                      disabled={isLoading}
                    />
                    <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">Shop Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-11 input-glass h-12"
                      disabled={isLoading}
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicesOffered" className="text-foreground">Services Offered</Label>
                  <Textarea
                    id="servicesOffered"
                    placeholder="List the services you offer (e.g., Oil change, Brake repair, General service)"
                    value={servicesOffered}
                    onChange={(e) => setServicesOffered(e.target.value)}
                    className="input-glass min-h-[100px]"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Vehicle Types</Label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopTypes.includes('TWO_WHEELER')}
                        onChange={(e) => {
                          if (e.target.checked) setShopTypes([...shopTypes, 'TWO_WHEELER']);
                          else setShopTypes(shopTypes.filter(t => t !== 'TWO_WHEELER'));
                        }}
                        className="rounded border-primary text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Two Wheeler</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shopTypes.includes('FOUR_WHEELER')}
                        onChange={(e) => {
                          if (e.target.checked) setShopTypes([...shopTypes, 'FOUR_WHEELER']);
                          else setShopTypes(shopTypes.filter(t => t !== 'FOUR_WHEELER'));
                        }}
                        className="rounded border-primary text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Four Wheeler</span>
                    </label>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime" className="text-foreground">Opening Time</Label>
                    <div className="relative">
                      <Input
                        id="openTime"
                        type="time"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="input-glass h-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime" className="text-foreground">Closing Time</Label>
                    <div className="relative">
                      <Input
                        id="closeTime"
                        type="time"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="input-glass h-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>


                <div className="space-y-2 mt-4">
                  <Label className="text-foreground">Shop Location</Label>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4 mb-3">
                      <Button
                        type="button"
                        onClick={detectLocation}
                        variant="outline"
                        className="flex items-center gap-2 border-primary/50 text-foreground hover:bg-primary/10"
                        disabled={isLoading}
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                        Detect My Location
                      </Button>
                      {latitude && longitude && (
                        <span className="text-sm text-green-400 flex items-center gap-1 animate-in fade-in">
                          <Check className="w-4 h-4" />
                          Set
                        </span>
                      )}
                    </div>
                    {latitude && longitude ? (
                      <div className="grid grid-cols-2 gap-2">
                         <div className="bg-black/20 p-2 rounded text-xs font-mono text-gray-300">
                           Lat: {latitude.toFixed(6)}
                         </div>
                         <div className="bg-black/20 p-2 rounded text-xs font-mono text-gray-300">
                           Lng: {longitude.toFixed(6)}
                         </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Please detect your location for accurate map placement.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 gradient-bg glow-button text-primary-foreground font-semibold text-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
