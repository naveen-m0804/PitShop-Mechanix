import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Mail, Lock, Loader2, Car, Eye, EyeOff, MapPin, Clock, Shield, Smartphone, ChevronDown, Zap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Scroll Animation Component
const ScrollReveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      });
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, [delay]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
      
      const from = (location.state as any)?.from?.pathname;
      if (from) {
         navigate(from, { replace: true });
         return;
      }

      if (result.role === 'MECHANIC') {
        navigate('/mechanic-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
      `}</style>
      
      {/* Hero / Login Section */}
      <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-background via-background to-primary/5">
        
        {/* Background decorations for Hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Floating car icon */}
        <div className="absolute top-20 right-10 md:right-20 opacity-10 animate-float hidden md:block">
          <Car className="w-32 h-32 text-primary" />
        </div>

      {/* Creative Header */}
      <div className="pt-12 pb-6 text-center z-10 animate-fade-in-down px-4">
         <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight font-display">
           <span className="text-transparent bg-clip-text gradient-text drop-shadow-sm">
             PitShop Mechanix
           </span>
         </h1>
         <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4 mt-4">
           Instant mechanical assistance, anywhere, anytime. Connecting stranded drivers with expert mechanics in real-time.
         </p>
      </div>

      {/* Login Container */}
      <div className="flex-grow flex items-center justify-center p-4 z-10 pb-20">
        <div className="glass-card w-full max-w-md p-8 fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-4">
              <Wrench className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground mt-2">Find mechanics near you, anytime</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-bg glow-button text-primary-foreground font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-muted/20 bg-transparent text-foreground hover:bg-white/5 hover:text-white transition-colors"
              onClick={async () => {
                setIsLoading(true);
                const result = await googleLogin('CLIENT');
                setIsLoading(false);
                
                if (result.success) {
                  toast({ title: 'Welcome!', description: 'Successfully logged in with Google' });
                  if (result.role === 'MECHANIC') {
                    navigate('/mechanic-dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                } else {
                  const errorMsg = result.error?.toLowerCase() || "";
                  if (errorMsg.includes("not registered") || errorMsg.includes("sign up") || errorMsg.includes("not found")) {
                    toast({ 
                      title: 'Account Not Found', 
                      description: 'This email is not registered. Please sign up first.', 
                      variant: 'destructive',
                      duration: 5000
                    });
                    navigate('/register');
                  } else {
                    toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
                  }
                }
              }}
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2" alt="Google" />
              Sign in with Google
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-muted-foreground/50">
        <ChevronDown className="w-8 h-8" />
      </div>
      </div>

      {/* Project Information Section */}
      <section className="py-24 px-4 relative bg-card/30 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block font-display">Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 font-display">Revolutionizing Breakdown Support</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                PitShop Mechanix isn't just an app; it's your safety net on the road. We combine real-time GPS tracking with a vetted network of expert mechanics to get you back on track faster than ever before.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: MapPin, 
                title: "Real-Time Tracking", 
                desc: "Live GPS tracking of your mechanic's location and estimated arrival time.",
                color: "text-blue-400"
              },
              { 
                icon: Clock, 
                title: "Fast Response", 
                desc: "Average response time of under 30 minutes in supported urban areas.",
                color: "text-green-400"
              },
              { 
                icon: Shield, 
                title: "Trusted Pros", 
                desc: "Every mechanic is verified, background-checked, and rated by users like you.",
                color: "text-purple-400"
              },
              { 
                icon: Smartphone, 
                title: "Seamless App", 
                desc: "Easy booking, transparent pricing, and instant communication all in one place.",
                color: "text-pink-400" 
              }
            ].map((feature, index) => (
              <ScrollReveal key={index} delay={index * 150} className="h-full">
                <div className="bg-card/50 border border-white/5 p-8 rounded-2xl h-full hover:bg-card/80 transition-colors duration-300 hover:-translate-y-2 transform">
                  <div className={`p-4 rounded-xl bg-background/50 inline-block mb-6 ${feature.color}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 font-display">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-white/5 bg-background/50">
        <p>&copy; {new Date().getFullYear()} PitShop Mechanix. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
