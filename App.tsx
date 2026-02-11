
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// --- Inline SVG Components ---
const HeartIcon = ({ className = "w-6 h-6", fill = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill={fill} className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const SparkleIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

// --- Sub-components ---

const FallingHearts: React.FC = () => {
  const hearts = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: 15 + Math.random() * 20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute top-[-10%] opacity-20 text-white"
          style={{
            left: h.left,
            animation: `fall ${h.duration} linear ${h.delay} infinite`,
            width: `${h.size}px`,
            height: `${h.size}px`,
          }}
        >
          <HeartIcon fill="white" className="w-full h-full" />
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.2; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const EscapingButton: React.FC<{ label: string }> = ({ label }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const moveButton = useCallback(() => {
    if (!buttonRef.current) return;

    // Get current position and dimensions
    const rect = buttonRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate current coordinates relative to viewport
    // rect.left/top includes the current translate offset. 
    // We want to calculate the new translation relative to the ORIGINAL center,
    // but it's easier to just calculate "where in the screen can I go?"
    
    // Limits: The button must stay within 0 and window.innerWidth/Height
    // To stay inside, the translation X must be between:
    // minX = - (original_left_of_button)
    // maxX = window.innerWidth - (original_left_of_button) - width
    
    // Instead of tracking 'original' position, we can calculate a random point 
    // on the screen and translate the button to that specific coordinate.
    // However, since we are in a Flex layout, we calculate the bounds of movement.
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // The current actual position (including transform)
    const currentLeft = rect.left;
    const currentTop = rect.top;

    // We calculate a new random position in the screen
    const targetLeft = Math.random() * (viewportWidth - width);
    const targetTop = Math.random() * (viewportHeight - height);

    // The change needed to get to that target from the CURRENT position
    const deltaX = targetLeft - currentLeft;
    const deltaY = targetTop - currentTop;

    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  // Update position if screen is resized to ensure it doesn't get stuck outside
  useEffect(() => {
    const handleResize = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth || rect.bottom > window.innerHeight || rect.left < 0 || rect.top < 0) {
        moveButton();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [moveButton]);

  return (
    <button
      ref={buttonRef}
      onMouseEnter={moveButton}
      onTouchStart={(e) => {
        e.preventDefault();
        moveButton();
      }}
      className="px-8 py-3 bg-white/20 border border-white/30 text-white font-medium rounded-full shadow-lg backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50 hover:scale-105 active:scale-90 select-none whitespace-nowrap"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        cursor: 'default'
      }}
    >
      {label}
    </button>
  );
};

const CelebrationEffect: React.FC = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: 10 + Math.random() * 30,
      color: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#fff0f3'][Math.floor(Math.random() * 5)],
      angle: Math.random() * 360,
      speed: 5 + Math.random() * 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            color: p.color,
            animation: `explode-${p.id} 2.5s forwards cubic-bezier(0.12, 0, 0.39, 0)`,
          }}
        >
          <HeartIcon className="w-full h-full" fill="currentColor" />
          <style>{`
            @keyframes explode-${p.id} {
              0% { 
                transform: translate(-50%, -50%) scale(0) rotate(0deg); 
                opacity: 1; 
              }
              20% {
                transform: translate(-50%, -50%) scale(1.5) rotate(${p.angle}deg);
                opacity: 1;
              }
              100% { 
                transform: translate(
                  calc(-50% + ${Math.cos(p.angle * (Math.PI / 180)) * 700}px), 
                  calc(-50% + ${Math.sin(p.angle * (Math.PI / 180)) * 700}px)
                ) scale(0) rotate(${p.angle * 8}deg); 
                opacity: 0; 
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [accepted, setAccepted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleYes = () => {
    setAccepted(true);
    setShowCelebration(true);
  };
const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;          // loop indefinitely
    audio.autoplay = true;      // attempt to autoplay
    audio.volume = 0.5;         // optional volume

    // Try to play (some browsers block autoplay with sound)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay prevented by browser:", err);
      });
    }
  }, []);

  return (
    <div>
      <h1>Welcome to My App</h1>
      <p>Background music is playing!</p>

      {/* Hidden background audio */}
      <audio
        ref={audioRef}
        src="/audio/audio.mp3" // replace with your file path
        style={{ display: "none" }}
      />
    </div>
  );
};
  return (
    <main className="relative w-full h-screen bg-gradient-to-br from-pink-500 via-purple-400 to-rose-400 overflow-hidden flex flex-col items-center justify-center p-6">
      <FallingHearts />

      {/* Glassmorphism Card */}
      <div 
        className={`z-20 bg-white/20 backdrop-blur-xl border border-white/30 p-10 md:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-700 transform max-w-xl w-full text-center ${accepted ? 'scale-110' : 'scale-100'}`}
      >
        {!accepted ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="mb-8 flex justify-center space-x-3">
              <div className="animate-bounce" style={{ animationDelay: '0s' }}>
                <HeartIcon className="w-10 h-10 text-rose-600 drop-shadow-md" fill="currentColor" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                <HeartIcon className="w-12 h-12 text-white drop-shadow-md" fill="currentColor" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                <HeartIcon className="w-10 h-10 text-rose-600 drop-shadow-md" fill="currentColor" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-poetic text-white drop-shadow-2xl mb-6 leading-tight select-none">
              Will you be <br />
              <span className="text-rose-800 drop-shadow-none">my Valentine?</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/90 font-cursive italic mb-12 drop-shadow-sm select-none">
              The world is vast, but my heart <br className="hidden sm:block" /> only has room for you...
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-4">
              <button
                onClick={handleYes}
                className="group relative px-12 py-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.4)] transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative">Yes!</span>
                <HeartIcon className="relative w-6 h-6 group-hover:animate-pulse" fill="white" />
              </button>

              <EscapingButton label="No..." />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="mb-8 flex justify-center animate-pulse">
               <HeartIcon className="w-24 h-24 text-rose-600" fill="currentColor" />
            </div>
            <h1 className="text-6xl md:text-8xl font-poetic text-white drop-shadow-xl mb-6">
              I Knew It!
            </h1>
            <p className="text-3xl font-cursive text-rose-900 animate-bounce mt-4">
              You've made me so happy ❤️
            </p>
            <div className="flex justify-center items-center space-x-6 mt-10">
               <SparkleIcon className="text-yellow-200 w-8 h-8 animate-spin-slow" />
               <SparkleIcon className="text-white w-12 h-12 animate-pulse" />
               <SparkleIcon className="text-yellow-200 w-8 h-8 animate-spin-slow" />
            </div>
          </div>
        )}
      </div>

      {showCelebration && <CelebrationEffect />}

      <footer className="absolute bottom-6 text-white/40 font-cursive text-sm md:text-base pointer-events-none select-none tracking-widest uppercase">
        Forever & Always
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default App;
