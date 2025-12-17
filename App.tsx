import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ChristmasTree } from './components/ChristmasTree';
import { Snow } from './components/Snow';
import { Overlay } from './components/Overlay';
import { Fireflies } from './components/Fireflies';
import { Ground } from './components/Ground';

/**
 * Component to handle responsive camera positioning.
 * It functions like CSS Media Queries but for the 3D Camera.
 */
const CameraAdjuster: React.FC = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    
    // Logic: If the screen is narrower than it is wide (Portrait/Mobile),
    // we need to move the camera back (increase Z) to fit the tall tree.
    // Standard desktop (landscape) uses Z=12.
    // Mobile (portrait) needs roughly Z=18 (was 22) to fit vertical content better without being too far.
    const isPortrait = aspect < 1;
    const targetZ = isPortrait ? 18 : 12;
    const targetY = 2; // Keep looking at the center-ish of the tree

    camera.position.set(0, targetY, targetZ);
    camera.updateProjectionMatrix();
    
  }, [size, camera]);

  return null;
};

const App: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black">
      <Canvas
        // Initial camera position (will be adjusted by CameraAdjuster immediately)
        camera={{ position: [0, 2, 12], fov: 45 }}
        dpr={[1, 2]} // Handle high pixel density screens (common on mobile)
        className="w-full h-full"
      >
        <color attach="background" args={['#050b14']} />
        
        <CameraAdjuster />

        <Suspense fallback={null}>
          <ChristmasTree />
          <Snow count={7500} />
          <Fireflies />
          <Ground />
        </Suspense>

        {/* Ambient light for base visibility */}
        <ambientLight intensity={0.5} />
        
        {/* Orbit controls configuration */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minDistance={5}
          maxDistance={30} // Increased max distance so mobile users can zoom out further
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <Overlay />
    </div>
  );
};

export default App;