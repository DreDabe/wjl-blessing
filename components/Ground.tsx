
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  attribute float aRandom;
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Subtle undulation (snow drifts)
    float wave = sin(pos.x * 0.5 + uTime * 0.2) * 0.1 + cos(pos.z * 0.5 + uTime * 0.1) * 0.1;
    pos.y += wave;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance attenuation for size
    gl_PointSize = (50.0 * (0.5 + aRandom * 0.5)) / -mvPosition.z;
    
    // Calculate alpha based on distance from center (fade out edges)
    float dist = length(pos.xz);
    float maxDist = 18.0;
    vAlpha = 1.0 - smoothstep(5.0, maxDist, dist);
    
    // Twinkle effect on ground
    vAlpha *= (0.5 + 0.5 * sin(uTime * 2.0 + aRandom * 20.0));
  }
`;

const fragmentShader = `
  varying float vAlpha;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft particle
    float alpha = 1.0 - (r * 2.0);
    alpha = pow(alpha, 3.0);
    
    // Icy blue-white color
    vec3 color = vec3(0.8, 0.9, 1.0);
    
    gl_FragColor = vec4(color, alpha * vAlpha * 0.6);
  }
`;

export const Ground: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const count = 3000;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Circular distribution on floor
      const r = Math.sqrt(Math.random()) * 20.0;
      const theta = Math.random() * Math.PI * 2;
      
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = -3.5; // Floor level (just below tree base)
      positions[i * 3 + 2] = r * Math.sin(theta);
      
      randoms[i] = Math.random();
    }
    return { positions, randoms };
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
