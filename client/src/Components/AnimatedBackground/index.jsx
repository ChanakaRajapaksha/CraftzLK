import { useEffect, useRef } from 'react';
import './animatedBackground.css';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create dark blue gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f1419');
      gradient.addColorStop(0.3, '#1a1f3a');
      gradient.addColorStop(0.7, '#2d3560');
      gradient.addColorStop(1, '#1a1f3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing sand dunes with sharp edges
      const duneCount = 4;
      for (let i = 0; i < duneCount; i++) {
        ctx.save();
        
        const yBase = canvas.height * (0.55 + i * 0.12);
        const waveSpeed = 0.003 + i * 0.001;
        const amplitude = 25 + i * 8;
        const frequency = 0.008 + i * 0.002;
        
        // Create path for dune
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        for (let x = 0; x <= canvas.width; x += 1) {
          const wave1 = Math.sin((x * frequency) + (time * 50 * waveSpeed)) * amplitude;
          const wave2 = Math.sin((x * frequency * 1.5) + (time * 30 * waveSpeed)) * (amplitude * 0.5);
          const y = yBase + wave1 + wave2;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Create glowing gradient for dune
        const duneGradient = ctx.createLinearGradient(0, yBase - amplitude * 2, 0, yBase + amplitude);
        const glowIntensity = 0.4 + (i * 0.15);
        duneGradient.addColorStop(0, `rgba(100, 150, 255, ${glowIntensity * 0.3})`);
        duneGradient.addColorStop(0.3, `rgba(150, 200, 255, ${glowIntensity * 0.6})`);
        duneGradient.addColorStop(0.5, `rgba(100, 180, 255, ${glowIntensity})`);
        duneGradient.addColorStop(0.7, `rgba(150, 200, 255, ${glowIntensity * 0.7})`);
        duneGradient.addColorStop(1, `rgba(100, 150, 255, ${glowIntensity * 0.2})`);
        
        ctx.fillStyle = duneGradient;
        ctx.fill();

        // Draw sharp glowing edges
        ctx.strokeStyle = `rgba(150, 200, 255, ${0.9 + i * 0.1})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 25 + i * 5;
        ctx.shadowColor = `rgba(100, 180, 255, ${0.8 + i * 0.1})`;
        ctx.stroke();
        
        ctx.restore();
      }

      // Draw subtle stars in upper portion
      for (let i = 0; i < 25; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 237.5) % (canvas.height * 0.4);
        const brightness = Math.sin(time * 2 + i) * 0.3 + 0.4;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="animated-background-container">
      <canvas ref={canvasRef} className="animated-background-canvas" />
      <div className="animated-background-overlay">
        <div className="promo-content">
          <h2 className="promo-title-large">Heading 1</h2>
          <h1 className="promo-title-main">Subheading 2</h1>
          <p className="promo-subtitle">Subheading 3</p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
