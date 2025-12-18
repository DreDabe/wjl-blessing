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
import Banner from './components/Banner';

/**
 * Component to handle initial camera positioning based on screen size.
 * Runs only once to avoid resetting the user's adjusted view.
 */
const CameraAdjuster: React.FC = () => {
  const { camera, size } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const aspect = size.width / size.height;
    const isPortrait = aspect < 1;
    
    // Set initial position based on device orientation
    const targetZ = isPortrait ? 18 : 12;
    const targetY = 2;

    camera.position.set(0, targetY, targetZ);
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
    <div className="relative w-full h-full bg-black">
      {/* Banner component at the top */}
      <Banner />
      
      <Canvas
        // Default position, will be overridden by CameraAdjuster once
        camera={{ position: [0, 2, 12], fov: 45 }}
        dpr={[1, 2]} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#050b14']} />
        
        <CameraAdjuster />

        <Suspense fallback={null}>
          <ChristmasTree isExploded={isExploded} onToggleExplode={() => setIsExploded(prev => !prev)} />
          <Snow count={7500} />
          <Fireflies />
          <Ground />
        </Suspense>
        
        {/* ImageGallery will load after main scene components */}
        <Suspense fallback={null}>
          <ImageGallery isExploded={isExploded} onSelectImage={setActiveImageData} isImageViewerOpen={!!activeImageData} />
        </Suspense>

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={5}
          maxDistance={40} // Allow zooming out further to see the huge tree
          autoRotate={!isExploded} // Only stop rotating when exploded
          autoRotateSpeed={0.5}
          enabled={true} // Always allow the user to move the camera if they want
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