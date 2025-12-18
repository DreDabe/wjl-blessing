
import React, { useState, useEffect } from 'react';

interface ImageViewerProps {
  data: {
    url: string;
    meta: any;
  } | null;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ data, onClose }) => {
  const [error, setError] = useState(false);
  
  // 上岸祝福语列表
  const blessings = [
    "当你感到紧张、心跳加速时，其实是身体给自己加油的掌声！",
    "人就是这样的，想来想去，犹豫来犹豫去，觉得自己还没准备好，勇气没有攒够，其实只要迈出去第一步，你就会发现一切早就已经准备好了！",
    "真正的勇气是怀揣着恐惧，依旧勇往直前！",
    "愿你成为自己的太阳，无需借谁的光！",
    "注定要去的地方，多晚都有光！",
    "放弃不难，但坚持肯定不简单，贵在坚持，难在坚持，成在坚持！",
    "你一定要走，走到灯火通明！",
    "在你坚持不懈的努力下，会有始料不及的运气和突如其来的惊喜！"
  ];
  
  useEffect(() => {
    setError(false);
  }, [data]);

  if (!data) return null;
  
  // 根据图片ID选择对应的祝福语
  const blessingIndex = (data.meta.id - 1) % blessings.length;
  const currentBlessing = blessings[blessingIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-in fade-in duration-300 ui-element"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[95vw] md:max-w-xl w-full bg-white rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.15)] animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-full transition-colors text-black"
          onClick={onClose}
        >
          <span className="text-xl">✕</span>
        </button>
        
        <div className="bg-[#f5f5f5] p-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-inner bg-gray-200">
            {!error ? (
              <img 
                src={data.url} 
                alt={data.meta.title} 
                className="w-full h-full object-cover transition-opacity duration-700"
                onError={() => setError(true)}
                onDragStart={(e) => e.preventDefault()}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <span className="text-4xl mb-2">⚠️</span>
                <p className="text-sm font-medium">照片路径未找到</p>
                <p className="text-xs mt-2 opacity-50 font-mono">path: {data.url}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 text-center bg-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{data.meta.symbol}</span>
            <h2 className="font-serif text-3xl text-gray-900 tracking-tight">{data.meta.title}</h2>
          </div>
          <p className="text-xs text-gray-400 font-medium tracking-[0.2em] uppercase mb-6">
            {data.meta.subtitle}
          </p>
          <div className="h-[1px] w-16 bg-gray-100 mx-auto mb-6" />
          <p className="text-gray-400 italic text-sm font-light">
            “ {currentBlessing} ”
          </p>
        </div>
      </div>
    </div>
  );
};
