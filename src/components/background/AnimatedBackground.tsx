
import React, { useRef, useEffect } from 'react';

// Particle animation using Canvas API - more reliable than Three.js for simple backgrounds
export const AnimatedBackground: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize handler for responsive canvas
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Particle system
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }[] = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      const radius = Math.random() * 2 + 0.5;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: getRandomColor(0.5),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    // Random color generator with alpha
    function getRandomColor(alpha: number): string {
      const r = Math.floor(Math.random() * 100 + 155); // Brighter colors (155-255)
      const g = Math.floor(Math.random() * 100 + 155);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // Draw glowing sphere in center
    function drawGlowingSphere() {
      if (!ctx || !canvas) return;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.1,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
      gradient.addColorStop(0.4, 'rgba(99, 102, 241, 0.4)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 120, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#05071b');
      bgGradient.addColorStop(1, '#070b25');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing sphere
      drawGlowingSphere();

      // Draw and update particles
      particles.forEach((particle, index) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, particle.radius,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, particle.color.replace(')', ', 0.3)'));
        gradient.addColorStop(1, particle.color.replace(')', ', 0)'));
        ctx.fillStyle = gradient;
        ctx.fill();

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary checking
        if (particle.x < 0 || particle.x > canvas.width) particle.vx = -particle.vx;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy = -particle.vy;
        
        // Connect particles with lines if they're close enough
        for (let j = index + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className || ''}`}
    />
  );
};
