import React, { useState } from 'react';

const Banner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div 
        className={`relative mx-auto max-w-2xl transition-all duration-1000 ease-in-out transform ${isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-b-3xl shadow-2xl p-8 text-white pointer-events-auto cursor-pointer overflow-hidden relative group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="inline-block animate-pulse group-hover:scale-105 transition-transform">上岸！</span>
            </h1>
            <p className="text-lg md:text-2xl font-serif italic max-w-md">
              追风赶月莫停留，平芜尽处是春山！
            </p>
            <div className="w-24 h-1.5 bg-white/70 rounded-full animate-pulse" />
          </div>
          
          <button 
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            aria-label="Close banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;