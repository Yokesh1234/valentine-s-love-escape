
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
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: 15 + Math.random() * 25,
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
          10% { opacity: 0.5; }
          90% { opacity: 0.3; }
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

    const rect = buttonRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const currentLeft = rect.left;
    const currentTop = rect.top;

    const padding = 50;
    const targetLeft = padding + Math.random() * (viewportWidth - width - padding * 2);
    const targetTop = padding + Math.random() * (viewportHeight - height - padding * 2);

    const deltaX = targetLeft - currentLeft;
    const deltaY = targetTop - currentTop;

    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

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
      className="px-8 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-full shadow-lg backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50 hover:scale-105 active:scale-95 select-none whitespace-nowrap"
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
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: 10 + Math.random() * 35,
      color: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'][Math.floor(Math.random() * 6)],
      angle: Math.random() * 360,
      speed: 6 + Math.random() * 18,
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
            animation: `explode-${p.id} 3s forwards cubic-bezier(0.12, 0, 0.39, 0)`,
          }}
        >
          <HeartIcon className="w-full h-full" fill="currentColor" />
          <style>{`
            @keyframes explode-${p.id} {
              0% { 
                transform: translate(-50%, -50%) scale(0) rotate(0deg); 
                opacity: 1; 
              }
              15% {
                transform: translate(-50%, -50%) scale(1.6) rotate(${p.angle}deg);
                opacity: 1;
              }
              100% { 
                transform: translate(
                  calc(-50% + ${Math.cos(p.angle * (Math.PI / 180)) * 800}px), 
                  calc(-50% + ${Math.sin(p.angle * (Math.PI / 180)) * 800}px)
                ) scale(0) rotate(${p.angle * 10}deg); 
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
  const [audioInteracted, setAudioInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activateAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(err => console.warn("Audio play failed:", err));
      setAudioInteracted(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      // Start muted autoplay (Browsers allow this)
      audioRef.current.muted = true;
      audioRef.current.play().catch(() => {
        console.log("Muted autoplay blocked, waiting for interaction...");
      });

      // Global listener for the first interaction to unmute
      const handleFirstInteraction = () => {
        activateAudio();
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);

      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [activateAudio]);

  const handleYes = () => {
    setAccepted(true);
    setShowCelebration(true);
    activateAudio(); // Backup unmute/play
  };

  return (
    <main 
      className="relative w-full h-screen bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400 overflow-hidden flex flex-col items-center justify-center p-6"
    >
      <FallingHearts />

      {/* Background Audio - Local file audio.mp3 */}
      {/* muted + autoPlay ensures it starts on most browsers instantly. programmatically unmuted on interaction. */}
      <audio
        ref={audioRef}
        src="/audio.mp3"
        autoPlay
        muted
        loop
        preload="auto"
        className="hidden"
      />

      {/* Subtle interaction prompt if audio hasn't been unmuted yet */}
      {!audioInteracted && !accepted && (
        <div className="absolute top-10 text-white/40 font-cursive text-lg animate-pulse pointer-events-none select-none z-10">
          Tap anywhere for a melody...
        </div>
      )}

      {/* Glassmorphism Card */}
      <div 
        className={`z-20 bg-white/10 backdrop-blur-2xl border border-white/30 p-10 md:p-16 rounded-[3rem] shadow-[0_25px_80px_rgba(0,0,0,0.3)] transition-all duration-1000 transform max-w-xl w-full text-center ${accepted ? 'scale-110' : 'scale-100'}`}
      >
        {!accepted ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <div className="mb-8 flex justify-center space-x-4">
              <div className="animate-bounce" style={{ animationDelay: '0s' }}>
                <HeartIcon className="w-10 h-10 text-rose-600" fill="currentColor" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                <HeartIcon className="w-14 h-14 text-white drop-shadow-xl" fill="currentColor" />
              </div>
              <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                <HeartIcon className="w-10 h-10 text-rose-600" fill="currentColor" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-poetic text-white drop-shadow-2xl mb-8 leading-tight select-none">
              Will you be <br />
              <span className="text-rose-900/80 drop-shadow-none">my Valentine?</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 font-cursive italic mb-12 drop-shadow-sm select-none">
              Every heartbeat whispers your name... <br className="hidden sm:block" /> and every dream starts with you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleYes();
                }}
                className="group relative px-14 py-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-2xl rounded-full shadow-[0_15px_40px_rgba(225,29,72,0.5)] transition-all duration-300 transform hover:scale-115 active:scale-95 flex items-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <span className="relative">YES!</span>
                <HeartIcon className="relative w-8 h-8 group-hover:animate-pulse" fill="white" />
              </button>

              <EscapingButton label="No..." />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-20 duration-1000">
            <div className="mb-10 flex justify-center animate-pulse">
               <HeartIcon className="w-32 h-32 text-rose-600 drop-shadow-2xl" fill="currentColor" />
            </div>
            <h1 className="text-7xl md:text-9xl font-poetic text-white drop-shadow-xl mb-6">
              I Knew It!
            </h1>
            <p className="text-4xl font-cursive text-rose-900 animate-bounce mt-6">
              You've made my heart complete ❤️
            </p>
            <div className="flex justify-center items-center space-x-8 mt-14">
               <SparkleIcon className="text-yellow-200 w-10 h-10 animate-spin-slow" />
               <SparkleIcon className="text-white w-16 h-16 animate-pulse" />
               <SparkleIcon className="text-yellow-200 w-10 h-10 animate-spin-slow" />
            </div>
          </div>
        )}
      </div>

      {showCelebration && <CelebrationEffect />}

      <footer className="absolute bottom-8 text-white/50 font-cursive text-lg pointer-events-none select-none tracking-[0.2em] uppercase">
        Forever Starts Today
      </footer>

      <style>{`
        .animate-spin-slow {
          animation: spin 12s linear infinite;
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
