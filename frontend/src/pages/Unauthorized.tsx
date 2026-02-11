import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();

  const dashboardPath = user?.role === 'MECHANIC' ? '/mechanic-dashboard' : '/dashboard';
  const roleName = user?.role === 'MECHANIC' ? 'Mechanic' : 'Client';
  const attemptedPath = location.state?.attemptedPath || 'this page';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-destructive/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center fade-in relative z-10 max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 mb-6">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-display font-bold text-foreground mb-2">403</h1>
        <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
          Access Denied
        </h2>

        {/* Error Message */}
        <div className="glass-card p-5 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground text-sm">
              You are logged in as a <span className="text-primary font-semibold">{roleName}</span> and 
              do not have permission to access <code className="text-xs bg-secondary/80 px-2 py-1 rounded text-foreground">{attemptedPath}</code>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground text-sm">
              This page is restricted to <span className="text-amber-500 font-semibold">
                {user?.role === 'MECHANIC' ? 'Client' : 'Mechanic'}
              </span> accounts only. Please navigate to your own dashboard.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={dashboardPath}>
            <Button className="gradient-bg glow-button text-primary-foreground w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go to My Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-border hover:bg-secondary/50"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
