import React from 'react';

export const Overlay: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
      {/* 
        All text and prompts have been removed as requested.
        This layer remains for potential future UI elements or touch handling.
      */}
    </div>
  );
};