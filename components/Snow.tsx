
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const snowVertexShader = `
  uniform float uTime;
  uniform float uHeight; // Range of Y to loop
  attribute float aRandom;
  attribute float aSpeed;
  
  void main() {
    vec3 pos = position;
    
    // Fall down based on time and speed
    float fallOffset = uTime * aSpeed;
    
    // Modulo arithmetic for looping:
    // We want y to go from +uHeight/2 to -uHeight/2 endlessly
    // position.y - fallOffset creates a descending value
    // mod wrapper keeps it within bounds
    
    float loopRange = 30.0; // Total height of the snow volume
    float y = pos.y - fallOffset;
    
    // Use GLSL mod logic to wrap y
    // Adding loopRange*10.0 ensures we are operating on positive numbers before modding if needed,
    // but simpler approach:
    pos.y = mod(y + 15.0, 30.0) - 15.0; // Keep roughly between -15 and 15
    
    // Add some wiggle
    pos.x += sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
    pos.z += cos(uTime * 1.5 + aRandom * 20.0) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (50.0 * (0.5 + aRandom * 0.5)) / -mvPosition.z;
  }
`;

const snowFragmentShader = `
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    float alpha = 1.0 - (r * 2.0);
    alpha = pow(alpha, 2.0);
    
    // Increased alpha to 1.0 (was 0.8) to help with visual density perception
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 1.0);
  }
`;

interface SnowProps {
  count?: number;
}

export const Snow: React.FC<SnowProps> = ({ count = 1000 }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: 20.0 },
    }),
    []
  );

  const { positions, randoms, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread snow widely
      pos[i * 3] = (Math.random() - 0.5) * 40;     // x: -20 to 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y: -15 to 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // z: -15 to 15
      
      rnd[i] = Math.random();
      spd[i] = 1.0 + Math.random() * 2.0; // Speed 1.0 to 3.0
    }
    return { positions: pos, randoms: rnd, speeds: spd };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      // Cast to ShaderMaterial to access uniforms
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          count={speeds.length}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={snowVertexShader}
        fragmentShader={snowFragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
