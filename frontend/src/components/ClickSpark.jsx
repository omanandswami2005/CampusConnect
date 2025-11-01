import { useEffect, useRef } from "react";

const ClickSpark = ({
  colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
  particleCount = 15,
  particleSize = 4,
  speed = 3,
  gravity = 0.5,
  fadeSpeed = 0.96,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createSpark = (x, y) => {
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * speed * 2,
          vy: (Math.random() - 0.5) * speed * 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * particleSize + 1,
        });
      }
    };

    const handleClick = (e) => {
      // Use global coordinates since canvas is fixed positioned
      createSpark(e.clientX, e.clientY);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update physics
        particle.vy += gravity * 0.1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life *= fadeSpeed;

        // Draw particle
        if (particle.life > 0.01) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();

          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = particle.color;
          ctx.fill();
          ctx.restore();

          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Listen to document clicks instead of canvas clicks to avoid blocking
    document.addEventListener("click", handleClick);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("click", handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, particleCount, particleSize, speed, gravity, fadeSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default ClickSpark;
