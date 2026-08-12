import { useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Stars } from '@react-three/drei';
import * as THREE from 'three';
import CursorTrail from './CursorTrail';

const COLORS = [
  '#3a1324', // Deep Burgundy
  '#3d2e4d', // Dusty Purple
  '#09132b', // Midnight Blue
  '#2a1040', // Dark Violet
  '#13243a', // Muted Navy
];

function CurveNodes() {
  const count = 55;
  const boxRefs = useRef<(THREE.Object3D | null)[]>([]);
  const phaseOffset = useRef(0);

  const curve = useMemo(() => {
    // Essentially flat, wide figure-eight with only subtle z-depth at crossing
    const points = [
      new THREE.Vector3(0, 0, 1),        // Center (front)
      new THREE.Vector3(7, 3, 0),        // Top Right
      new THREE.Vector3(14, 0, 0),       // Right Outer
      new THREE.Vector3(7, -3, 0),       // Bottom Right
      new THREE.Vector3(0, 0, -1),       // Center (back)
      new THREE.Vector3(-7, 3, 0),       // Top Left
      new THREE.Vector3(-14, 0, 0),      // Left Outer
      new THREE.Vector3(-7, -3, 0),      // Bottom Left
    ];
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  const colors = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const randomSeed = Math.sin(i * 12345.67) * 10000;
      const colorIndex = Math.floor(Math.abs(randomSeed - Math.floor(randomSeed)) * COLORS.length);
      arr.push(COLORS[colorIndex]);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    // Continuous flow along the curve (1 full loop in ~20 seconds)
    phaseOffset.current += delta * 0.05;

    for (let i = 0; i < count; i++) {
      const mesh = boxRefs.current[i];
      if (!mesh) continue;

      const baseT = i / count;
      const t = (baseT + phaseOffset.current) % 1.0;

      const pos = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      
      const target = pos.clone().add(tangent);
      const m = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
      const rotation = new THREE.Euler().setFromRotationMatrix(m);
      
      mesh.position.copy(pos);
      mesh.rotation.copy(rotation);
    }
  });

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <RoundedBox 
          key={i} 
          ref={(el) => { boxRefs.current[i] = el; }}
          args={[0.4, 0.4, 1.2]} 
          radius={0.08} 
          smoothness={4}
        >
          <meshStandardMaterial 
            color={colors[i]} 
            roughness={0.35} 
            metalness={0.25} 
          />
        </RoundedBox>
      ))}
    </group>
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

function Starfield() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (ref.current) {
      // Very slow independent drift
      ref.current.rotation.x -= 0.0001;
      ref.current.rotation.y -= 0.0002;
    }
  });

  return (
    <group ref={ref}>
      <Stars radius={50} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Very low ambient light to allow deep shadows */}
        <ambientLight intensity={0.1} />
        
        {/* Stronger key light from upper-left */}
        <directionalLight position={[-10, 10, 5]} intensity={3.5} color="#ffffff" />
        
        {/* Stronger rim light from the right */}
        <directionalLight position={[10, -2, -5]} intensity={2.5} color="#88aaff" />
        
        <Starfield />
        <CurveNodes />
        <CameraRig />
        <CursorTrail />
      </Canvas>
    </div>
  );
}
