import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function CursorTrail() {
  const lineCore = useRef<any>(null);
  const lineRed = useRef<any>(null);
  const lineCyan = useRef<any>(null);

  const pointsCount = 30; // approx 0.5s trail
  const trail = useRef<THREE.Vector3[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothedMouse = useRef(new THREE.Vector3(0, 0, 5));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    // Project raw mouse coordinates to a Z=5 plane
    const rawVec = new THREE.Vector3(mouse.current.x, mouse.current.y, 0.5);
    rawVec.unproject(state.camera);
    const dir = rawVec.sub(state.camera.position).normalize();
    const distance = (5 - state.camera.position.z) / dir.z;
    const targetPos = state.camera.position.clone().add(dir.multiplyScalar(distance));

    // Initialize buffer on first frame if empty
    if (trail.current.length === 0) {
      smoothedMouse.current.copy(targetPos);
      for (let i = 0; i < pointsCount; i++) {
        trail.current.push(targetPos.clone());
      }
    }

    // 1. Smooth the raw mouse input using lerp/damping
    smoothedMouse.current.lerp(targetPos, 0.2);

    // 2. Push smoothed position into rolling buffer
    trail.current.unshift(smoothedMouse.current.clone());
    if (trail.current.length > pointsCount) {
      trail.current.pop();
    }

    // 3. Convert buffer to a smooth curve and sample it to remove jagged angular joints
    if (trail.current.length > 1) {
      const curve = new THREE.CatmullRomCurve3(trail.current, false, 'chordal');
      // Sample the curve into 60 smooth segments
      const sampledPoints = curve.getPoints(60);

      const positions = [];
      const redPositions = [];
      const cyanPositions = [];
      
      for (let i = 0; i < sampledPoints.length; i++) {
        const p = sampledPoints[i];
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
