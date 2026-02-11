import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating?: number;  // Current rating value (0-5)
  maxRating?: number; // Max stars, default 5
  readOnly?: boolean; // If true, just displays stars
  onChange?: (rating: number) => void; // Callback when user clicks a star
  size?: 'sm' | 'md' | 'lg'; // Size of stars
  className?: string; // Extra classes
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  maxRating = 5,
  readOnly = false,
  onChange,
  size = 'md',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const currentSize = starSize[size] || starSize.md;

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };

  // For display mode (readOnly), we can support fractional stars if needed, 
  // but for now let's stick to full stars.
  // The 'rating' prop can be a float (e.g. 4.5).
  // If we want to show partial stars, we need more logic. 
  // Let's keep it simple: fill star if index <= rating (rounded or floor).
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;
        
        // Handle partial fill for readOnly display if rating is like 4.5
        // If rating is 4.5, star 5 should be half filled? 
        // For simplicity in this version, let's just use full stars based on round/presence.
        // Or if we want to be fancy, we can use a different icon or svg fill.
        // Let's settle for: if (rating >= starValue) filled. 
        // If (rating > starValue - 1 && rating < starValue) half-filled?
        // Let's implement full stars for now.
        
        return (
          <button
            key={i}
            type="button"
            className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
            disabled={readOnly}
          >
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
