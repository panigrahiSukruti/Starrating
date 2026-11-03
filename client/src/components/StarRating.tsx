import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null | undefined;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const numericValue = value ?? 0;
  const activeRating = hoverValue !== null ? hoverValue : numericValue;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(activeRating);
          return (
            <button
              type="button"
              key={star}
              disabled={readOnly}
              onClick={() => {
                if (!readOnly && onChange) {
                  onChange(star);
                }
              }}
              onMouseEnter={() => {
                if (!readOnly) {
                  setHoverValue(star);
                }
              }}
              onMouseLeave={() => {
                if (!readOnly) {
                  setHoverValue(null);
                }
              }}
              className={`p-0.5 transition-all focus:outline-none ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
              title={readOnly ? `${numericValue} Stars` : `Rate ${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${sizeClasses[size]} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300 hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700 ml-1.5">
          {numericValue > 0 ? numericValue.toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
};

