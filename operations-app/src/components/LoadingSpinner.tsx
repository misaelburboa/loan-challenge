// LoadingSpinner.js
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin animation-delay-200"></div>
      </div>
    </div>
  );
};

