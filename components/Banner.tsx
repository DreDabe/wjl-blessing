import React, { useState } from 'react';

const Banner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main Banner Content */}
      <div 
        className={`relative mx-auto max-w-2xl transition-all duration-500 ease-in-out transform ${isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-b-xl shadow-lg p-4 text-white pointer-events-auto" 
        >
          {/* Content is centered */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-xl font-semibold">上岸！</h1>
            <p className="text-sm text-gray-300">追风赶月莫停留，平芜尽处是春山！</p>
          </div>
        </div>
      </div>
      
      {/* Toggle Handle Button - always at top edge */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`group flex items-center justify-center backdrop-blur-md border-x border-white/10 px-12 py-1.5 cursor-pointer hover:bg-gray-900/100 transition-all shadow-lg ${isExpanded ? 'bg-gray-900/90 border-b rounded-b-xl' : 'bg-gray-900/90 border-t rounded-t-xl'}`}
          aria-label={isExpanded ? "收起" : "展开"}
        >
          {/* Up/Down arrow for expand/collapse */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-white/50 group-hover:text-white transition-colors ${isExpanded ? '' : 'rotate-180'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Banner;