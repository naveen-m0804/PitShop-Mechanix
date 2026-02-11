import React from 'react';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mechanic } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { isShopOpen, formatTime12Hour } from '@/lib/utils';

interface MechanicCardProps {
  mechanic: Mechanic;
}

const MechanicCard: React.FC<MechanicCardProps & { 
  onRequest?: (mechanic: Mechanic) => void; 
  distance?: number;
}> = ({ mechanic, onRequest, distance }) => {
  const navigate = useNavigate();
  const isOpen = isShopOpen(mechanic.openTime, mechanic.openTime && mechanic.closeTime ? mechanic.closeTime : '');

  const handleViewDetails = () => {
    navigate(`/mechanic/${mechanic.id}`);
  };

  const handleRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRequest) {
      onRequest(mechanic);
    }
  };

  return (
    <div 
      className="glass-card-hover p-5 flex flex-col gap-4 cursor-pointer relative group"
      onClick={handleViewDetails}
    >
      {/* Availability Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          mechanic.isAvailable && isOpen
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-red-500/10 text-red-500'
        }`}>
          {mechanic.isAvailable && isOpen ? 'Available' : (!isOpen ? 'Closed' : 'Busy')}
        </span>
      </div>

      <div className="flex items-start justify-between pr-16">
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {mechanic.shopName}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-foreground font-medium">
                {mechanic.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({mechanic.totalRatings})
              </span>
            </div>
            {distance !== undefined && (
              <span className="text-muted-foreground text-xs bg-secondary/50 px-2 py-0.5 rounded">
                {distance.toFixed(1)} km away
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-xs line-clamp-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{mechanic.address}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm mt-1">
        <div className="flex items-center gap-2 text-foreground/80">
          <Phone className="w-4 h-4 text-primary" />
          <span>{mechanic.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <Clock className="w-4 h-4 text-primary" />
          <span>{formatTime12Hour(mechanic.openTime)} - {formatTime12Hour(mechanic.closeTime)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {mechanic.shopTypes.map((type) => (
          <span
            key={type}
            className="px-2 py-0.5 rounded-full text-[10px] uppercase font-medium bg-primary/5 text-primary border border-primary/20"
          >
            {type.replace('_', ' ')}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          className="w-full text-xs h-9"
        >
          View Profile
        </Button>
        <Button
          onClick={handleRequest}
          className="w-full gradient-bg glow-button text-primary-foreground font-medium text-xs h-9 border-none"
          disabled={!mechanic.isAvailable || !isOpen}
        >
          Request Service
        </Button>
      </div>
    </div>
  );
};

export default MechanicCard;
