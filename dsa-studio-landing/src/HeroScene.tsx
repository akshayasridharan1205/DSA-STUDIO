import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = [
  '#0f172a', // Navy (slate-900)
  '#1e1b4b', // Deep Indigo (indigo-950)
  '#311025', // Dark Plum
  '#3f1118', // Muted Burgundy
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
      
      data.push({ pos, rotation });
    }
    
    return { curve: c, boxesData: data };
  }, []);

  return (
    <>
      {boxesData.map((data, i) => (
        <RoundedBox 
          key={i} 
          position={data.pos} 
          rotation={data.rotation} 
          args={[0.4, 0.4, 1.2]} 
          radius={0.05} 
          smoothness={4}
        >
          <meshStandardMaterial 
            color={COLORS[i % COLORS.length]} 
            roughness={0.7} 
            metalness={0.2} 
          />
        </RoundedBox>
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Transparent background by default in Canvas */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#ffffff" />
        <CurveNodes />
      </Canvas>
    </div>
  );
}
