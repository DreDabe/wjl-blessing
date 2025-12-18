import React, { useState } from 'react';

const Banner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div 
      className={`fixed top-0 left-0 w-full z-[100] transition-transform duration-500 ease-in-out ${isExpanded ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Main Banner Content */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 w-full flex flex-col items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.6)] text-white pb-4 pt-3">
        {/* Content is centered */}
        <div className="flex flex-col items-center justify-center text-center max-w-2xl px-4">
          <h1 className="text-xl font-semibold">上岸！</h1>
          <p className="text-sm text-gray-300">追风赶月莫停留，平芜尽处是春山！</p>
        </div>
      </div>
      
      {/* Toggle Handle Button */}
      <div className="absolute top-full left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center justify-center bg-black/60 backdrop-blur-md border-b border-x border-white/10 rounded-b-xl px-12 py-1.5 cursor-pointer hover:bg-black/80 transition-all shadow-lg"
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