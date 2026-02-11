import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, LayoutDashboard, Map, ClipboardList, LogOut, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userApi } from '@/lib/api';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const profile = await userApi.getProfile();
      setUserName(profile.name);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'MECHANIC' ?
    [
      { path: '/mechanic-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/mechanic-map', label: 'Map View', icon: Map },
      { path: '/work-history', label: 'Work History', icon: ClipboardList },
      { path: '/profile', label: 'Profile', icon: User },
    ] : [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/map', label: 'Map View', icon: Map },
      { path: '/my-requests', label: 'My Requests', icon: ClipboardList },
      { path: '/profile', label: 'Profile', icon: User },
    ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-4 py-3 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to={user?.role === 'MECHANIC' ? '/mechanic-dashboard' : '/dashboard'} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              PitShop <span className="gradient-text">Mechanix</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    className={`${
                      isActive(item.path)
                        ? 'gradient-bg text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {userName || 'User'}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                {user?.role?.toLowerCase() || 'User'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Right Section */}
          <div className="flex md:hidden items-center gap-2">
             <NotificationBell />
             <button
                className="p-2 text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 glass-card p-4 fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive(item.path)
                          ? 'gradient-bg text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <hr className="border-border my-2" />
              <div className="px-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {userName || 'User'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {user?.role?.toLowerCase() || 'User'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
