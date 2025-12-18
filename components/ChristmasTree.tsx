
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader: Handles particle position, size attenuation, and explosion logic
const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uHover;
  uniform float uExpansion; // 0.0 = Small Tree, 1.0 = Big Tree
  
  attribute float aRandom;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aBrightness; 
  attribute vec3 aExplodedPos; // The target position (Big Tree)
  
  varying vec3 vColor;
  varying float vAlpha;
  varying float vBrightness;

  void main() {
    vColor = aColor;
    vBrightness = aBrightness;
    
    // 1. Interpolate between Small Tree and Big Tree
    // Smoothstep creates a nice ease-in-out curve
    float t = smoothstep(0.0, 1.0, uExpansion);
    vec3 pos = mix(position, aExplodedPos, t);

    // 2. Rotation Logic
    // Apply rotation to the interpolated position
    float angle = uTime * 0.1 + pos.y * 0.1;
    
    // When expanded, stop the internal swirl rotation almost completely 
    // to emphasize the static, massive scale of the structure
    if (uExpansion > 0.8) {
       angle = 0.0; // Lock rotation when fully exploded for impact
    } else {
       // Blend rotation out
       angle *= (1.0 - t); 
    }
    
    float c = cos(angle);
    float s = sin(angle);
    float x = pos.x * c - pos.z * s;
    float z = pos.x * s + pos.z * c;
    pos.x = x;
    pos.z = z;
    
    // 3. Organic movement (Sway)
    float movementIntensity = (aBrightness > 8.0) ? 0.005 : 0.02; 
    
    // Subtle float when exploded
    pos.x += sin(uTime + pos.y) * movementIntensity;
    pos.z += cos(uTime + position.y) * movementIntensity;

    // 4. Interaction Logic: Repel from mouse
    float dist = distance(pos, uMouse);
    float repelRadius = 2.0 + (uExpansion * 5.0); // Massive interact radius when expanded
    float force = smoothstep(repelRadius, 0.0, dist);
    
    vec3 dir = normalize(pos - uMouse);
    pos += dir * force * 0.1 * uHover; 

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    float size = aSize * (1.0 + force * 1.0); 
    gl_PointSize = size * (300.0 / -mvPosition.z);
    
    // Twinkle alpha
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

    vec3 finalColor = vColor * vBrightness;
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface ChristmasTreeProps {
  isExploded: boolean;
  onToggleExplode: () => void;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ isExploded, onToggleExplode }) => {
  const mesh = useRef<THREE.Points>(null);
  const { camera } = useThree();
  
  // Double click handler
  useEffect(() => {
    const handleDoubleClick = () => {
      onToggleExplode();
    };
    
    window.addEventListener('dblclick', handleDoubleClick);
    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [onToggleExplode]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uHover: { value: 1.0 },
      uExpansion: { value: 0.0 }, 
    }),
    []
  );

  const { positions, colors, sizes, randoms, brightness, explodedPositions } = useMemo(() => {
    // Counts
    const treeCount = 45000; 
    const ribbonCount = 5000; 
    const garlandCount = 30000; 
    const starCount = 800; 
    
    const totalCount = treeCount + ribbonCount + garlandCount + starCount;

    const positions = new Float32Array(totalCount * 3);
    const explodedPositions = new Float32Array(totalCount * 3); 
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
    const colorGoldLight = new THREE.Color('#ffcc66');
    const colorWhite = new THREE.Color('#ffffff');

    let idx = 0;

    // --- Configuration for the "In Your Face" Big Tree ---
    // Huge scale to engulf the camera
    const bigTreeBaseY = -25.0;
    const bigTreeHeight = 60.0; 
    const bigTreeRadius = 30.0; 
    
    // Helper to get a random point inside the "Big Tree" cone volume
    const getBigTreePos = (targetArray: Float32Array, index: number, isStar: boolean = false) => {
      if (isStar) {
        // Star clusters at the very top
        const r = Math.pow(Math.random(), 3) * 2.0; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        targetArray[index * 3] = r * Math.sin(phi) * Math.cos(theta);
        targetArray[index * 3 + 1] = (bigTreeBaseY + bigTreeHeight) + (r * Math.cos(phi));
        targetArray[index * 3 + 2] = (r * Math.sin(phi) * Math.sin(theta));
      } else {
        // Random volume inside cone
        const yRel = Math.random(); 
        const y = bigTreeBaseY + yRel * bigTreeHeight;
        
        // Cone radius at this height
        const rMaxAtY = bigTreeRadius * (1.0 - yRel); 
        
        const r = Math.sqrt(Math.random()) * rMaxAtY;
        const theta = Math.random() * Math.PI * 2;
        
        targetArray[index * 3] = r * Math.cos(theta);
        targetArray[index * 3 + 1] = y;
        targetArray[index * 3 + 2] = r * Math.sin(theta);
      }
    };

    // 1. Generate Regular Conical Tree Body
    for (let i = 0; i < treeCount; i++) {
      const normalizedIndex = i / treeCount;
      const yProgress = Math.pow(normalizedIndex, 3.0); 
      const y = -3 + yProgress * 8; 
      
      const maxRadius = 3.5 * (1 - yProgress);
      const r = Math.sqrt(Math.random()) * maxRadius;
      const theta = Math.random() * Math.PI * 2;

      positions[idx * 3] = r * Math.cos(theta);
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = r * Math.sin(theta);

      // Target: Scatter into Big Tree Volume
      getBigTreePos(explodedPositions, idx);

      // Colors & Brightness Logic
      const rand = Math.random();
      let c;
      let size;
      let b;

      if (rand > 0.30) { 
        c = Math.random() > 0.5 ? colorYellow : colorGreen; 
        size = 0.25; 
        b = 4.0;
      } 
      else { 
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

    // 2. Pink Ambient Cloud
    for (let i = 0; i < ribbonCount; i++) {
      const y = -4.0 + Math.random() * 12.0;
      const maxR = 12.0; 
      const r = Math.sqrt(Math.random()) * maxR;
      const theta = Math.random() * Math.PI * 2;
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;
      
      // STATIC: Keep them as a large ambient cloud.
      explodedPositions[idx * 3] = x;
      explodedPositions[idx * 3 + 1] = y;
      explodedPositions[idx * 3 + 2] = z;

      colors[idx * 3] = colorPink.r;
      colors[idx * 3 + 1] = colorPink.g;
      colors[idx * 3 + 2] = colorPink.b;

      sizes[idx] = 0.2 + Math.random() * 0.3;
      brightnessArr[idx] = 3.0; 
      randoms[idx] = Math.random();
      idx++;
    }

    // 3. Golden Garland
    const spiralTurns = 6.5;
    for (let i = 0; i < garlandCount; i++) {
      const p = i / garlandCount; 
      
      const yCenter = 5.0 - p * 8.0; 
      const baseRadius = 3.5 * (p); 
      const theta = p * Math.PI * 2 * spiralTurns;
      
      const xCenter = baseRadius * Math.cos(theta);
      const zCenter = baseRadius * Math.sin(theta);

      const spread = 0.5 + Math.random() * 0.2; 
      
      const u = Math.random();
      const v = Math.random();
      const thetaOff = 2 * Math.PI * u;
      const phiOff = Math.acos(2 * v - 1);
      const rOff = Math.cbrt(Math.random()) * spread;

      const xOffset = rOff * Math.sin(phiOff) * Math.cos(thetaOff);
      const yOffset = rOff * Math.sin(phiOff) * Math.sin(thetaOff);
      const zOffset = rOff * Math.cos(phiOff);

      positions[idx * 3] = xCenter + xOffset;
      positions[idx * 3 + 1] = yCenter + yOffset;
      positions[idx * 3 + 2] = zCenter + zOffset;

      // Garland scatters into the Big Tree volume
      getBigTreePos(explodedPositions, idx);

      const c = Math.random() > 0.4 ? colorGold : colorGoldLight;
      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;

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
      
      // Star moves to the top of the Big Tree
      getBigTreePos(explodedPositions, idx, true);

      const c = Math.random() > 0.3 ? colorWhite : colorGold;
      
      colors[idx * 3] = c.r;
      colors[idx * 3 + 1] = c.g;
      colors[idx * 3 + 2] = c.b;

      sizes[idx] = 0.3 + Math.random() * 0.4;
      brightnessArr[idx] = 8.0 + Math.random() * 4.0; 
      randoms[idx] = Math.random();
      idx++;
    }

    return { positions, colors, sizes, randoms, brightness: brightnessArr, explodedPositions };
  }, []);

  // Animate
  useFrame((state) => {
    if (mesh.current) {
      const { clock, pointer } = state;
      const uTime = clock.getElapsedTime();
      // Cast to ShaderMaterial to access uniforms
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = uTime;

      // Mouse interaction
      const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z; 
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));
      
      material.uniforms.uMouse.value.copy(pos);

      const distFromCenter = pointer.length();
      const active = 1.0 - THREE.MathUtils.smoothstep(distFromCenter, 0.6, 0.95);
      material.uniforms.uHover.value = active;
      
      // Explosion Animation Logic (Lerp)
      const targetExpansion = isExploded ? 1.0 : 0.0;
      const currentExpansion = material.uniforms.uExpansion.value;
      
      // Faster lerp (0.05) for a snappier, more energetic explosion
      material.uniforms.uExpansion.value = THREE.MathUtils.lerp(
        currentExpansion,
        targetExpansion,
        0.05
      );
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
          attach="attributes-aExplodedPos"
          count={explodedPositions.length / 3}
          array={explodedPositions}
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
