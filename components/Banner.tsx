import React, { useState } from 'react';

const Banner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div 
        className={`relative mx-auto max-w-2xl transition-all duration-500 ease-in-out transform ${isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
      >
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-b-xl shadow-lg p-4 text-white pointer-events-auto cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">上岸！</h1>
                <p className="text-sm text-gray-300">追风赶月莫停留，平芜尽处是春山！</p>
              </div>
            </div>
            <button 
              className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;