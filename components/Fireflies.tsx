
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  attribute float aScale;
  attribute vec3 aOffset; // Start position
  
  void main() {
    vec3 pos = aOffset;
    
    // Complex organic movement
    // Use sin/cos with different frequencies based on position
    pos.x += sin(uTime * 0.5 + aOffset.y) * 1.5;
    pos.y += cos(uTime * 0.3 + aOffset.x) * 1.0; 
    pos.z += sin(uTime * 0.4 + aOffset.z) * 1.5;
    
    // Gentle rise
    pos.y += uTime * 0.2;
    
    // Loop height (similar to snow but slower and different range)
    float heightRange = 20.0;
    pos.y = mod(pos.y + 10.0, heightRange) - 10.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (40.0 * aScale) / -mvPosition.z;
  }
`;

const fragmentShader = `
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Glow center
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);
    
    // Golden color
    gl_FragColor = vec4(1.0, 0.9, 0.4, glow);
  }
`;

export const Fireflies: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const count = 150;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const { offsets, scales } = useMemo(() => {
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Wider distribution than tree
      offsets[i * 3] = (Math.random() - 0.5) * 25; 
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 15;
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      scales[i] = Math.random();
    }
    return { offsets, scales };
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
          attach="attributes-aOffset"
          count={offsets.length / 3}
          array={offsets}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </points>
  );
};
