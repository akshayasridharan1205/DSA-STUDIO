import { useEffect, useRef } from 'react';

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2 };
    const smoothedMouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const pointsCount = 50; // Increased to compensate for lack of motion blur accumulation
    
    // Store positions and a randomized color per point
    const trail: { x: number; y: number; r: number; g: number; b: number }[] = [];
    const sparks: { x: number; y: number; vx: number; vy: number; age: number; maxAge: number }[] = [];

    
    let colorTimer = 0;
    let animationFrameId: number;

    const render = () => {
      // Clear canvas fully to preserve exact transparency underneath
      ctx.clearRect(0, 0, width, height);

      // Lerp smoothed mouse
      smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.2;
      smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.2;

      // Slowly shift color: Violet -> Blue -> Teal
      colorTimer += 0.02;
      const r = Math.floor(Math.sin(colorTimer) * 40 + 80);        // 40 - 120 (keeps red low for purple/blue)
      const g = Math.floor(Math.sin(colorTimer * 0.8) * 60 + 120); // 60 - 180 (adds teal/green)
      const b = Math.floor(Math.sin(colorTimer * 1.2) * 40 + 210); // 170 - 250 (keeps blue dominant)

      // Add slight jitter
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 4;

      // Calculate speed proxy using distance between raw mouse and smoothed mouse
      const speed = Math.hypot(mouse.x - smoothedMouse.x, mouse.y - smoothedMouse.y);
      
      // Spawn sparks based on speed
      if (speed > 5) {
        const spawnCount = Math.floor(Math.random() * (speed / 15));
        for (let i = 0; i < spawnCount; i++) {
          sparks.push({
            x: smoothedMouse.x + (Math.random() - 0.5) * 10,
            y: smoothedMouse.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 0.5, // slight upward initial velocity bias
            age: 0,
            maxAge: 20 + Math.random() * 20
          });
        }
      }

      trail.unshift({
        x: smoothedMouse.x + jitterX,
        y: smoothedMouse.y + jitterY,
        r, g, b
      });

      if (trail.length > pointsCount) {
        trail.pop();
      }

      ctx.globalCompositeOperation = 'screen';

      // 1. Draw glowing blobs (oldest to newest)
      for (let i = trail.length - 1; i >= 0; i--) {
        const point = trail[i];
        const ageRatio = i / pointsCount; // 0 is newest (head), 1 is oldest (tail)
        
        // Older points have larger radius and lower opacity
        const baseRadius = 15;
        const radius = baseRadius + (ageRatio * 40) + (Math.random() * 5); 
        const opacity = Math.max(0, 1 - ageRatio);

        const grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        
        // Center is more opaque, edge fades to 0
        grad.addColorStop(0, `rgba(${point.r}, ${point.g}, ${point.b}, ${opacity * 0.6})`);
        grad.addColorStop(1, `rgba(${point.r}, ${point.g}, ${point.b}, 0)`);

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      
      // Draw sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.05; // subtle gravity
        spark.age++;

        if (spark.age >= spark.maxAge) {
          sparks.splice(i, 1);
          continue;
        }

        const sparkOpacity = 1 - (spark.age / spark.maxAge);
        // Bright pale blue-white
        ctx.fillStyle = `rgba(220, 240, 255, ${sparkOpacity})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }} // Above R3F canvas, below UI (z-50)
    />
  );
}
