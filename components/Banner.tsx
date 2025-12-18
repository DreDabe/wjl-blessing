import React, { useState } from 'react';

const Banner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div 
        className={`relative mx-auto max-w-2xl transition-all duration-1000 ease-in-out transform ${isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-b-3xl shadow-2xl p-6 text-white pointer-events-auto cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="inline-block animate-pulse">上岸！</span>
            </h1>
            <p className="text-lg md:text-xl font-serif italic">
              追风赶月莫停留，平芜尽处是春山！
            </p>
            <div className="w-16 h-1 bg-white/50 rounded-full animate-pulse" />
          </div>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;