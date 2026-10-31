'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film } from 'lucide-react';

interface PromotionalVideoPlayerProps {
  className?: string;
}

export const PromotionalVideoPlayer: React.FC<PromotionalVideoPlayerProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Check system preference for reduced motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    // Lazy autoplay when in viewport if motion is allowed
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          video.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Autoplay was prevented by browser policy
            setIsPlaying(false);
          });
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasInteracted(true);

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.warn('Play interrupted', e));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    setHasInteracted(true);
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      container.requestFullscreen().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (!duration && video.duration) {
      setDuration(video.duration);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative rounded-2xl overflow-hidden bg-[#0A1128] border border-[#DFDBD2]/60 shadow-2xl group transition-all ${className}`}
    >
      {/* Editorial Cinema Header Ribbon */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs font-mono text-white pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-wider text-[11px] uppercase text-amber-300">
            ZeroReject Product Film
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80 hidden sm:inline text-[11px]">
            &quot;The Cost of Avoidable Citizen Rejection&quot;
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-white/70">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span>720p HD • 16:9 Cinema</span>
        </div>
      </div>

      {/* Responsive 16:9 Video Player */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src="/videoo.mp4"
          poster="/videoo-poster.jpg"
          preload="metadata"
          muted={isMuted}
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          aria-label="ZeroReject promotional video explaining citizen document discrepancy resolution"
        />

        {/* Center Floating Play/Pause Button on Pause or Hover */}
        {(!isPlaying || isHovering) && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause film' : 'Play film'}
            className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl transition-transform transform hover:scale-110 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-1" />
            )}
          </button>
        )}

        {/* Reduced Motion Static Warning fallback */}
        {prefersReducedMotion && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-6 text-center">
            <Film className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="font-serif text-lg font-bold">Prefers Reduced Motion Active</h4>
            <p className="text-xs text-white/80 max-w-md mt-1 mb-4">
              Autoplay is paused in accordance with your accessibility preferences. Click below to play the product film.
            </p>
            <button
              onClick={togglePlay}
              className="bg-white text-[#111625] font-mono text-xs font-bold px-4 py-2 rounded-lg"
            >
              Play Video
            </button>
          </div>
        )}
      </div>

      {/* Cinema Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 space-y-2">
        {/* Scrubber / Progress Bar */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (videoRef.current && duration) {
              videoRef.current.currentTime = clickPos * duration;
            }
          }}
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer relative overflow-hidden group/bar"
        >
          <div
            className="h-full bg-amber-400 transition-all rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-xs font-mono text-white">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-1 hover:text-amber-300 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className="flex items-center space-x-1.5 p-1 hover:text-amber-300 transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">Unmute Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300 font-bold hidden sm:inline">Sound Active</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-white/60 hidden md:inline">
              Story: Discrepancy Detection &rarr; Auto-Cure &rarr; Pre-Flight Clearance
            </span>
            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Toggle Fullscreen"
              className="p-1 hover:text-amber-300 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

