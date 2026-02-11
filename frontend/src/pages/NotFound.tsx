import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'MECHANIC' ? '/mechanic-dashboard' : '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center fade-in relative z-10">
        <div className="text-8xl mb-6">🚗</div>
        <h1 className="text-6xl font-display font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! This road doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={dashboardPath}>
            <Button className="gradient-bg glow-button text-primary-foreground">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-border hover:bg-secondary/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
