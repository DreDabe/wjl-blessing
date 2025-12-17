import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader: Handles particle position, size attenuation, and mouse interaction
const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uHover;
  
  attribute float aRandom;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aBrightness; 
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBrightness;

  void main() {
    vColor = aColor;
    vBrightness = aBrightness;
    vec3 pos = position;

    // Gentle rotation logic
    float angle = uTime * 0.1 + position.y * 0.1;
    
    // Manual rotation matrix around Y axis
    float c = cos(angle);
    float s = sin(angle);
    float x = pos.x * c - pos.z * s;
    float z = pos.x * s + pos.z * c;
    pos.x = x;
    pos.z = z;
    
    // Organic movement
    // Reduced movement for structural elements (garlands) to keep shape
    float movementIntensity = (aBrightness > 8.0) ? 0.005 : 0.02; 
    pos.x += sin(uTime + position.y) * movementIntensity;
    pos.z += cos(uTime + position.y) * movementIntensity;

    // Interaction Logic: Repel from mouse
    float dist = distance(pos, uMouse);
    float repelRadius = 1.5; 
    float force = smoothstep(repelRadius, 0.0, dist);
    
    // Push particles away from the "mouse" point in 3D space
    vec3 dir = normalize(pos - uMouse);
    pos += dir * force * 0.05 * uHover; 

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    float size = aSize * (1.0 + force * 1.0); 
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    // Twinkle alpha
    // Make brighter particles (garland/star) twinkle faster
    float twinkleSpeed = (aBrightness > 5.0) ? 5.0 : 3.0;
    vAlpha = 0.6 + 0.4 * sin(uTime * twinkleSpeed + aRandom * 10.0);
  }
`;

// Fragment Shader: Handles particle shape (soft glow) and color
const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBrightness;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft glow falloff
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Apply brightness multiplier to the color directly for "bloom" feel in AdditiveBlending
    vec3 finalColor = vColor * vBrightness;
    
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

export const ChristmasTree: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const { viewport, mouse, camera } = useThree();
  
  // Create shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uHover: { value: 1.0 },
    }),
    []
  );

  // Generate Geometry Data
  const { positions, colors, sizes, randoms, brightness } = useMemo(() => {
    // Counts
    const treeCount = 45000; 
    const ribbonCount = 5000; // Pink ambient cloud
    // Significantly increased garland count to support larger volume while maintaining density
    const garlandCount = 30000; 
    const starCount = 800; // Reduced from 2000 to prevent overexposure
    
    const totalCount = treeCount + ribbonCount + garlandCount + starCount;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const randoms = new Float32Array(totalCount);
    const brightnessArr = new Float32Array(totalCount);

    const colorGreen = new THREE.Color('#00ff88');
    const colorRed = new THREE.Color('#ff0055');
    const colorBlue = new THREE.Color('#00ccff');
    const colorYellow = new THREE.Color('#ffff00'); 
    const colorPink = new THREE.Color('#ff4090');
    const colorGold = new THREE.Color('#ffaa00');
    const colorGoldLight = new THREE.Color('#ffcc66'); // Lighter gold for fog variance
    const colorWhite = new THREE.Color('#ffffff');

    let idx = 0;

    // 1. Generate Regular Conical Tree Body
    for (let i = 0; i < treeCount; i++) {
      const normalizedIndex = i / treeCount;
      const yProgress = Math.pow(normalizedIndex, 3.0); 
      const y = -3 + yProgress * 8; // Height: -3 to 5
      
      const maxRadius = 3.5 * (1 - yProgress);
      const r = Math.sqrt(Math.random()) * maxRadius;
      const theta = Math.random() * Math.PI * 2;

      positions[idx * 3] = r * Math.cos(theta);
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = r * Math.sin(theta);

      // Colors & Brightness Logic
      const rand = Math.random();
      let c;
      let size;
      let b;

      if (rand > 0.30) { // 70% Yellow/Green Mix
        c = Math.random() > 0.5 ? colorYellow : colorGreen; 
        size = 0.25; 
        b = 4.0;
      } 
      else { // Ornaments
        c = rand > 0.15 ? colorRed : colorBlue; 
        size = 0.45; 
        b = 6.0; 
      }

      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;
      sizes[idx] = size;
      brightnessArr[idx] = b;
      randoms[idx] = Math.random();
      idx++;
    }

    // 2. Pink Ambient Cloud (Subtler now)
    for (let i = 0; i < ribbonCount; i++) {
      const y = -4.0 + Math.random() * 12.0;
      const maxR = 12.0; 
      const r = Math.sqrt(Math.random()) * maxR;
      const theta = Math.random() * Math.PI * 2;
      
      positions[idx * 3] = r * Math.cos(theta);
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = r * Math.sin(theta);

      colors[idx * 3] = colorPink.r;
      colors[idx * 3 + 1] = colorPink.g;
      colors[idx * 3 + 2] = colorPink.b;

      sizes[idx] = 0.2 + Math.random() * 0.3;
      brightnessArr[idx] = 3.0; 
      randoms[idx] = Math.random();
      idx++;
    }

    // 3. Golden Garland (Volumetric Fog Band)
    const spiralTurns = 6.5;
    for (let i = 0; i < garlandCount; i++) {
      const p = i / garlandCount; // 0 to 1
      
      // Calculate Spiral Center Line
      const yCenter = 5.0 - p * 8.0; 
      const baseRadius = 3.5 * (p); 
      const theta = p * Math.PI * 2 * spiralTurns;
      
      // Convert Spiral Center to Cartesian
      const xCenter = baseRadius * Math.cos(theta);
      const zCenter = baseRadius * Math.sin(theta);

      // Volumetric Fog Logic:
      // Instead of a thin line, we scatter points in a 3D cloud around the center line.
      // Spread is much larger now (0.5 to 0.7) to create "volume"
      const spread = 0.5 + Math.random() * 0.2; 
      
      // Random offset in a sphere
      const u = Math.random();
      const v = Math.random();
      const thetaOff = 2 * Math.PI * u;
      const phiOff = Math.acos(2 * v - 1);
      const rOff = Math.cbrt(Math.random()) * spread; // Uniform-ish distribution inside sphere

      const xOffset = rOff * Math.sin(phiOff) * Math.cos(thetaOff);
      const yOffset = rOff * Math.sin(phiOff) * Math.sin(thetaOff);
      const zOffset = rOff * Math.cos(phiOff);

      positions[idx * 3] = xCenter + xOffset;
      positions[idx * 3 + 1] = yCenter + yOffset;
      positions[idx * 3 + 2] = zCenter + zOffset;

      // Color Variance for Fog Texture
      const c = Math.random() > 0.4 ? colorGold : colorGoldLight;
      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;

      // Slightly smaller individual particles for mist effect, but high brightness
      sizes[idx] = 0.2 + Math.random() * 0.15; 
      brightnessArr[idx] = 6.5; 
      randoms[idx] = Math.random();
      idx++;
    }

    // 4. Star Topper
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      const radiusBase = Math.random() > 0.8 ? 0.6 : 0.2; 
      const r = Math.pow(Math.random(), 3) * radiusBase;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y + 5.2; 
      positions[idx * 3 + 2] = z;

      const c = Math.random() > 0.3 ? colorWhite : colorGold;
      
      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;

      sizes[idx] = 0.3 + Math.random() * 0.4;
      brightnessArr[idx] = 8.0 + Math.random() * 4.0; // Reduced max brightness
      randoms[idx] = Math.random();
      idx++;
    }

    return { positions, colors, sizes, randoms, brightness: brightnessArr };
  }, []);

  // Animate
  useFrame((state) => {
    if (mesh.current) {
      const { clock, pointer } = state;
      mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

      // Mouse interaction
      const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z; 
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      mesh.current.material.uniforms.uMouse.value.copy(pos);

      const distFromCenter = pointer.length();
      const active = 1.0 - THREE.MathUtils.smoothstep(distFromCenter, 0.6, 0.95);
      
      mesh.current.material.uniforms.uHover.value = active;
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
          attach="attributes-aColor"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aBrightness"
          count={brightness.length}
          array={brightness}
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