import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function CursorTrail() {
  const lineCore = useRef<any>(null);
  const lineRed = useRef<any>(null);
  const lineCyan = useRef<any>(null);

  const pointsCount = 30; // approx 0.5s trail
  const trail = useRef<THREE.Vector3[]>([]);

  useFrame((state) => {
    // Project mouse coordinates to a Z=5 plane
    const vec = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5);
    vec.unproject(state.camera);
    const dir = vec.sub(state.camera.position).normalize();
    const distance = (5 - state.camera.position.z) / dir.z;
    const currentPos = state.camera.position.clone().add(dir.multiplyScalar(distance));

    trail.current.unshift(currentPos);
    if (trail.current.length > pointsCount) {
      trail.current.pop();
    }

    if (trail.current.length > 1) {
      const positions = [];
      const redPositions = [];
      const cyanPositions = [];
      
      for (let i = 0; i < trail.current.length; i++) {
        const p = trail.current[i];
        positions.push(p.x, p.y, p.z);
        // Subtle offset for chromatic aberration
        redPositions.push(p.x - 0.04, p.y, p.z);
        cyanPositions.push(p.x + 0.04, p.y, p.z);
      }
      
      if (lineCore.current?.geometry) lineCore.current.geometry.setPositions(positions);
      if (lineRed.current?.geometry) lineRed.current.geometry.setPositions(redPositions);
      if (lineCyan.current?.geometry) lineCyan.current.geometry.setPositions(cyanPositions);
    }
  });

  // Initial dummy points to prevent mount errors
  const dummy = [new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, 5)];

  return (
    <group>
      <Line 
        ref={lineCyan} 
        points={dummy} 
        color="#00ffff" 
        lineWidth={3} 
        transparent 
        opacity={0.3} 
        depthWrite={false}
      />
      <Line 
        ref={lineRed} 
        points={dummy} 
        color="#ff0044" 
        lineWidth={3} 
        transparent 
        opacity={0.3} 
        depthWrite={false}
      />
      <Line 
        ref={lineCore} 
        points={dummy} 
        color="#ffffff" 
        lineWidth={2} 
        transparent 
        opacity={0.6} 
        depthWrite={false}
      />
    </group>
  );
}
