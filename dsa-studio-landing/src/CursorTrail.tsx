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

    const pointsCount = 30;
    
    // Store positions and a randomized color per point
    const trail: { x: number; y: number; r: number; g: number; b: number }[] = [];
    
    let colorTimer = 0;
    let animationFrameId: number;

    const render = () => {
      // Clear with low alpha for a motion-blur fade out
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

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
      
      // 2. Draw bright core line
      if (trail.length > 1) {
        ctx.beginPath();
        // Use quadratic curves to smooth the line through the points
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length - 1; i++) {
          const xc = (trail[i].x + trail[i + 1].x) / 2;
          const yc = (trail[i].y + trail[i + 1].y) / 2;
          ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        }
        ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
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
