
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

// 静态导入图片，让Vite处理路径
import Image1 from '../Image/1.jpg';
import Image2 from '../Image/2.jpg';
import Image3 from '../Image/3.jpg';
import Image4 from '../Image/4.jpg';
import Image5 from '../Image/5.jpg';
import Image6 from '../Image/6.jpg';
import Image7 from '../Image/7.jpg';
import Image8 from '../Image/8.jpg';

// 图片URL映射
const IMAGE_URLS = {
  1: Image1,
  2: Image2,
  3: Image3,
  4: Image4,
  5: Image5,
  6: Image6,
  7: Image7,
  8: Image8
};

// 详细元数据配置
const IMAGE_DETAILS: Record<number, { title: string; subtitle: string; symbol: string }> = {
  1: { title: "操场晚霞", subtitle: "Sunset over the Field", symbol: "🌇" },
  2: { title: "城市落日", subtitle: "City Golden Hour", symbol: "🏙️" },
  3: { title: "月下剪影", subtitle: "Moonlight Silhouette", symbol: "🌙" },
  4: { title: "望月", subtitle: "Lunar Beauty", symbol: "🌕" },
  5: { title: "璀璨烟花", subtitle: "Grand Fireworks I", symbol: "🎆" },
  6: { title: "优秀的定义", subtitle: "Definition of Excellence", symbol: "⭕" },
  7: { title: "成功的条件", subtitle: "Dimensions of Success", symbol: "📊" },
  8: { title: "星空烟火", subtitle: "Grand Fireworks II", symbol: "🎇" }
};

/**
 * 核心 Hook：自动探测 Image 文件夹中的照片
 * 不再阻塞渲染，而是逐步发现图片
 */
const useImageDiscovery = (maxSearch: number = 20) => {
  // 直接返回实际存在的图片ID，使用静态导入的图片
  return [1, 2, 3, 4, 5, 6, 7, 8];
};

const SafeImage: React.FC<{ url: string; scale: [number, number] }> = ({ url, scale }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [failed, setFailed] = useState(false);
  const [loadStarted, setLoadStarted] = useState(false);

  // Delay image loading to ensure it happens after main scene components
  useEffect(() => {
    // Start loading after a 1000ms delay
    const timer = setTimeout(() => {
      setLoadStarted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loadStarted) return;

    const loader = new THREE.TextureLoader();
    console.log(`Loading image: ${url}`);
    loader.load(
      url,
      (tex) => {
        console.log(`Successfully loaded: ${url}`);
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
        setFailed(false);
      },
      undefined,
      (error) => {
        console.error(`Failed to load: ${url}`, error);
        setFailed(true);
      }
    );
    return () => texture?.dispose();
  }, [url, loadStarted]);

  if (failed) {
    return (
      <mesh scale={[scale[0], scale[1], 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#eeeeee" transparent opacity={0.5} />
      </mesh>
    );
  }

  // Always render a placeholder to ensure the slot is visible even when loading
  return (
    <>
      {!texture && (
        <mesh scale={[scale[0], scale[1], 1]}>
          <planeGeometry />
          <meshBasicMaterial color="#333333" transparent opacity={0.3} />
        </mesh>
      )}
      {texture && (
        <mesh scale={[scale[0], scale[1], 1]}>
          <planeGeometry />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
};

const GalleryItem: React.FC<{ 
  localUrl: string; 
  position: [number, number, number]; 
  isExploded: boolean; 
  isImageViewerOpen: boolean;
  meta: any;
  onSelect: (url: string, meta: any) => void 
}> = ({ localUrl, position, isExploded, isImageViewerOpen, meta, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const fruitScale = 0.16; 

  const explodedPos = useMemo(() => {
    const dir = new THREE.Vector3(...position).normalize();
    return new THREE.Vector3(...position).add(dir.multiplyScalar(4.0 + Math.random() * 2.5));
  }, [position]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // For exploded state, we want to freeze the position once they're in place
    // This ensures photos stay in fixed positions after exploding
    if (isExploded) {
      // Only update scale on hover, not position
      const s = hovered ? 3.5 : 1.0; 
      groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), delta * 8);
      return;
    }
    
    // For non-exploded state, continue normal animation
    const target = new THREE.Vector3(...position);
    groupRef.current.position.lerp(target, delta * 3);
    groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
  });

  return (
    <group 
      ref={groupRef} 
      onClick={(e) => { 
        e.stopPropagation(); 
        if (isExploded) onSelect(localUrl, meta); 
      }}
      onPointerOver={() => isExploded && setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <Billboard>
        {/* 底片/相框 - 始终显示 */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.3 * fruitScale, 1.6 * fruitScale]} />
          <meshBasicMaterial color="white" transparent opacity={isExploded ? 1.0 : 0.6} />
        </mesh>

        {/* 图片内容 */}
        <group position={[0, 0.02 * fruitScale, 0]}>
          <SafeImage url={localUrl} scale={[1.15 * fruitScale, 1.35 * fruitScale]} />
        </group>

        {/* 爆炸态的光晕效果 */}
        {isExploded && (
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[1.6 * fruitScale, 16]} />
            <meshBasicMaterial color={hovered ? "#fffbaa" : "#ffdd44"} transparent opacity={hovered ? 0.4 : 0.1} />
          </mesh>
        )}
      </Billboard>
    </group>
  );
};

export const ImageGallery: React.FC<{ 
  isExploded: boolean; 
  onSelectImage: (data: { url: string, meta: any }) => void;
  isImageViewerOpen: boolean;
}> = ({ isExploded, onSelectImage, isImageViewerOpen }) => {
  const ids = useImageDiscovery(20);
  
  const items = useMemo(() => {
    // Only generate slots for actual found images
    if (ids.length === 0) return [];
    
    return Array.from({ length: ids.length }).map((_, i) => {
      const id = ids[i];
      const meta = IMAGE_DETAILS[id] || { 
        title: `回忆片段 ${id}`, 
        subtitle: `Memory Fragment ${id}`, 
        symbol: "✨" 
      };
      
      const y = -2.3 + Math.random() * 4.2; 
      const yProgress = (y + 3) / 8.5;
      const treeRadiusAtY = 3.8 * (1.1 - yProgress);
      const r = treeRadiusAtY * (0.5 + Math.random() * 0.45); 
      const angle = Math.random() * Math.PI * 2;
      // 使用相对路径 Image/
      const localUrl = IMAGE_URLS[id as keyof typeof IMAGE_URLS];
      
      return { 
        id: `img-${i}`,
        localUrl,
        meta: { ...meta, id },
        position: [r * Math.cos(angle), y, r * Math.sin(angle)] as [number, number, number]
      };
    });
  }, [ids]);

  return (
    <group>
      {items.map((item) => (
        <GalleryItem 
          key={item.id} 
          {...item} 
          isExploded={isExploded} 
          isImageViewerOpen={isImageViewerOpen}
          onSelect={(url, meta) => onSelectImage({ url, meta })} 
        />
      ))}
    </group>
  );
};
