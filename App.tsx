import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChristmasTree } from './components/ChristmasTree';
import { Snow } from './components/Snow';
import { Overlay } from './components/Overlay';
import { Fireflies } from './components/Fireflies';
import { Ground } from './components/Ground';

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

  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        // Default position, will be overridden by CameraAdjuster once
        camera={{ position: [0, 2, 12], fov: 45 }}
        dpr={[1, 2]} 
        className="w-full h-full"
      >
        <color attach="background" args={['#050b14']} />
        
        <CameraAdjuster />

        <Suspense fallback={null}>
          <ChristmasTree isExploded={isExploded} onToggleExplode={() => setIsExploded(prev => !prev)} />
          <Snow count={7500} />
          <Fireflies />
          <Ground />
        </Suspense>

        <ambientLight intensity={0.5} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={5}
          maxDistance={40} // Allow zooming out further to see the huge tree
          autoRotate={!isExploded} // Only stop rotating, don't disable interaction
          autoRotateSpeed={0.5}
          enabled={true} // Always allow the user to move the camera if they want
        />
      </Canvas>
      
      <Overlay />
    </div>
  );
};

export default App;