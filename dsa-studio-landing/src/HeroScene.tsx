import { useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = [
  '#3a1324', // Deep Burgundy
  '#3d2e4d', // Dusty Purple
  '#09132b', // Midnight Blue
  '#2a1040', // Dark Violet
  '#13243a', // Muted Navy
];

function CurveNodes() {
  const { boxesData } = useMemo(() => {
    // Gentle S-curve across the screen
    const points = [
      new THREE.Vector3(-14, -6, -5),
      new THREE.Vector3(-9, 3, -2),
      new THREE.Vector3(-4, 5, 1),
      new THREE.Vector3(1, 0, 3),
      new THREE.Vector3(5, -4, 1),
      new THREE.Vector3(10, -2, -3),
      new THREE.Vector3(15, 4, -5),
    ];
    const c = new THREE.CatmullRomCurve3(points);
    
    const count = 40;
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const pos = c.getPointAt(t);
      const tangent = c.getTangentAt(t);
      
      const target = pos.clone().add(tangent);
      const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
      const rotation = new THREE.Euler().setFromRotationMatrix(m);
      
      // Random but stable color selection per block
      const randomSeed = Math.sin(i * 12345.67) * 10000;
      const colorIndex = Math.floor(Math.abs(randomSeed - Math.floor(randomSeed)) * COLORS.length);
      const color = COLORS[colorIndex];
      
      data.push({ pos, rotation, color });
    }
    
    return { boxesData: data };
  }, []);

  return (
    <>
      {boxesData.map((data, i) => (
        <RoundedBox 
          key={i} 
          position={data.pos} 
          rotation={data.rotation} 
          args={[0.4, 0.4, 1.2]} 
          radius={0.08} 
          smoothness={4}
        >
          <meshStandardMaterial 
            color={data.color} 
            roughness={0.35} 
            metalness={0.25} 
          />
        </RoundedBox>
      ))}
    </>
  );
}

function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from -1 to 1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    // Target position for parallax (subtle shift of ±1.5 units)
    const targetX = mouse.current.x * 1.5;
    const targetY = mouse.current.y * 1.5;
    
    // Smoothly lerp camera position
    state.camera.position.x += (targetX - state.camera.position.x) * 0.03;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.03;
    
    // Adjust lookAt slightly to enhance parallax depth
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Very low ambient light to allow deep shadows */}
        <ambientLight intensity={0.1} />
        
        {/* Soft key light from upper-left */}
        <directionalLight position={[-10, 10, 5]} intensity={1.2} color="#ffffff" />
        
        {/* Cool subtle rim light from the right */}
        <directionalLight position={[10, -2, -5]} intensity={1.5} color="#88aaff" />
        
        <CurveNodes />
        <CameraRig />
      </Canvas>
    </div>
  );
}
