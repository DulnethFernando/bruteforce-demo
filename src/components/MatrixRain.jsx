import { useEffect, useRef } from 'react';

const MatrixRain = ({ currentAttempt = '', isRunning = false }) => {
  const canvasRef = useRef(null);
  const charsRef = useRef('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()');
  const dropsRef = useRef([]);
  const highlightDropRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / 14);
      dropsRef.current = Array(columns).fill(1);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 14;
    let frame = 0;

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the matrix rain
      for (let i = 0; i < dropsRef.current.length; i++) {
        // Highlight effect for current attempt
        if (isRunning && i === highlightDropRef.current && currentAttempt) {
          ctx.fillStyle = '#FFF';
          ctx.font = `bold ${fontSize}px monospace`;
          
          // Display current attempt characters vertically
          for (let j = 0; j < currentAttempt.length; j++) {
            ctx.fillText(
              currentAttempt[j],
              i * fontSize,
              (dropsRef.current[i] - currentAttempt.length + j) * fontSize
            );
          }
        } else {
          // Normal matrix rain
          ctx.fillStyle = '#0F0';
          ctx.font = `${fontSize}px monospace`;
          const char = charsRef.current[Math.floor(Math.random() * charsRef.current.length)];
          ctx.fillText(char, i * fontSize, dropsRef.current[i] * fontSize);
        }

        // Reset or move drops
        if (dropsRef.current[i] * fontSize > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }
        dropsRef.current[i]++;
      }

      // Update highlight position periodically
      if (isRunning && frame % 30 === 0) {
        highlightDropRef.current = Math.floor(Math.random() * dropsRef.current.length);
      }
      frame++;
    };

    let animationFrame;
    const animate = () => {
      draw();
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [currentAttempt, isRunning]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.7,
        background: 'black',
        pointerEvents: 'none'
      }}
    />
  );
};

export default MatrixRain;
