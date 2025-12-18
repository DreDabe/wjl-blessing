
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ChristmasTree } from './components/ChristmasTree';
import { Snow } from './components/Snow';
import { Overlay } from './components/Overlay';
import { Fireflies } from './components/Fireflies';
import { Ground } from './components/Ground';
import { ImageGallery } from './components/ImageGallery';
import { ImageViewer } from './components/ImageViewer';

const CameraAdjuster: React.FC = () => {
  const { camera, size } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const aspect = size.width / size.height;
    const isPortrait = aspect < 1;
    const targetZ = isPortrait ? 20 : 15;
    camera.position.set(0, 2, targetZ);
    camera.updateProjectionMatrix();
    initialized.current = true;
  }, [size, camera]);

  return null;
};

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);
  // Fix: Removed THREE.CanvasTexture from state type to match ImageViewer's expectations and resolve the type mismatch error.
  const [activeImageData, setActiveImageData] = useState<{ url: string, meta: any } | null>(null);

  // 双击或双击手势切换爆炸状态
  useEffect(() => {
    let lastTap = 0;
    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('.ui-element')) return;
      const now = Date.now();
      const delay = now - lastTap;
      if (delay < 300 && delay > 0) {
        if (e.cancelable) e.preventDefault();
        setIsExploded(prev => !prev);
      }
      lastTap = now;
    };
    window.addEventListener('pointerdown', handlePointerDown, { passive: false });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#020408]">
      <Canvas
        camera={{ position: [0, 2, 15], fov: 45 }}
        dpr={[1, 2]} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#010306']} />
        <CameraAdjuster />
        <Suspense fallback={null}>
          <ChristmasTree isExploded={isExploded} onToggleExplode={() => {}} />
          <Snow count={8000} />
          <Fireflies />
          <Ground />
        </Suspense>
        
        {/* ImageGallery will load after main scene components */}
        <Suspense fallback={null}>
          <ImageGallery isExploded={isExploded} onSelectImage={setActiveImageData} />
        </Suspense>
        
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.7}
          minDistance={8}
          maxDistance={35} 
          autoRotate={!isExploded && !activeImageData} 
          autoRotateSpeed={0.3}
        />
      </Canvas>
      
      <Overlay />
      <ImageViewer 
        data={activeImageData} 
        onClose={() => setActiveImageData(null)} 
      />
    </div>
  );
};

export default App;
