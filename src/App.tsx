import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { RetroUIShuffler } from './components/RetroUIShuffler';
import deviceMockup from 'figma:asset/264f0a1045ebace3cf09bbede108143ea7f92c93.png';
import backgroundImage from 'figma:asset/1d58274921f4f0059608c9b9cce79d06b95dbd7f.png';

export default function App() {
  const deviceRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (deviceRef.current) {
        const deviceWidth = deviceRef.current.offsetWidth;
        // Base scale on the device's actual width relative to the intended 1000px
        const newScale = deviceWidth / 1000;
        setScale(newScale);
      }
    };

    // Calculate initial scale
    calculateScale();

    // Recalculate on window resize
    window.addEventListener('resize', calculateScale);
    
    // Also listen for image load to ensure proper calculation
    const img = deviceRef.current;
    if (img) {
      img.addEventListener('load', calculateScale);
    }

    return () => {
      window.removeEventListener('resize', calculateScale);
      if (img) {
        img.removeEventListener('load', calculateScale);
      }
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, #2a2a2a, #1a1a1a, #0a0a0a)'
      }}
    >
      {/* Device Container */}
      <div className="relative">
        {/* Background Image - Behind Device */}
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="absolute w-[1000px] h-auto max-w-[90vw]"
          style={{ 
            maxHeight: '90vh', 
            width: 'auto',
            opacity: 0.8,
            zIndex: 0
          }}
        />
        
        {/* Device Mockup Image - Large */}
        <img 
          ref={deviceRef}
          src={deviceMockup} 
          alt="Retro Gaming Device" 
          className="relative w-[1000px] h-auto max-w-[90vw]"
          style={{ 
            maxHeight: '90vh', 
            width: 'auto',
            filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3))',
            zIndex: 1
          }}
        />
        
        {/* Retro UI positioned within the device screen - Scales with device */}
        <div 
          className="absolute top-[33.5%] left-1/2 w-[500px] h-[465px] overflow-hidden z-10"
          style={{
            borderRadius: `${28 * scale}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center'
          }}
        >
          <RetroUIShuffler />
        </div>
        
        {/* Screen glow effect - Scales with device */}
        <motion.div 
          className="absolute top-[33.5%] left-1/2 w-[500px] h-[465px] pointer-events-none"
          style={{
            borderRadius: `${28 * scale}px`,
            background: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.1) 0%, transparent 70%)',
            filter: 'blur(2px)',
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center'
          }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Sticky Footer */}
      <div 
        className="fixed bottom-0 left-0 right-0 border-t px-4 z-50"
        style={{ 
          backgroundColor: 'rgba(75, 85, 99, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTopColor: 'rgba(107, 114, 128, 0.2)',
          paddingTop: `${25.7088 * scale}px`,
          paddingBottom: `${25.7088 * scale}px`
        }}
      >
        <p 
          className="text-xs text-gray-400 text-center"
          style={{ fontFamily: 'Departure Mono, monospace' }}
        >
          Created in Figma Make by{' '}
          <a 
            href="https://x.com/hckmstrrahul" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
          >
            @hckmstrrahul
          </a>
          {' '}• Sep 2025
        </p>
      </div>
    </div>
  );
}
