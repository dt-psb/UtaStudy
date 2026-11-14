import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate: (currentTime: number) => void;
  onEnded?: () => void;
  onPlayerReady?: (player: any) => void;
  playerRefCallback?: (player: any) => void;
  autoPlay?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onTimeUpdate,
  onEnded,
  onPlayerReady,
  playerRefCallback,
  autoPlay = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize or update player
  useEffect(() => {
    let isCancelled = false;

    const createPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      // If player already exists, load the new videoId
      if (playerRef.current) {
        try {
          if (autoPlay) {
            playerRef.current.loadVideoById(videoId);
          } else {
            playerRef.current.cueVideoById(videoId);
          }
          return;
        } catch {
          // If load failed, destroy and recreate
          try { playerRef.current.destroy(); } catch {}
          playerRef.current = null;
        }
      }

      setHasError(false);
      setIsReady(false);

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            if (isCancelled) return;
            setIsReady(true);
            onPlayerReady?.(event.target);
            playerRefCallback?.(event.target);
            if (autoPlay) {
              try { event.target.playVideo(); } catch {}
            }
          },
          onStateChange: (event) => {
            // Start polling when playing, pause when paused/ended
            if (event.data === window.YT?.PlayerState.PLAYING) {
              startTracking();
            } else if (event.data === window.YT?.PlayerState.ENDED) {
              stopTracking();
              if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                onTimeUpdate(playerRef.current.getCurrentTime());
              }
              onEnded?.();
            } else {
              stopTracking();
              // Update one last time
              if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                onTimeUpdate(playerRef.current.getCurrentTime());
              }
            }
          },
          onError: () => {
            setHasError(true);
          }
        }
      });
    };

    const startTracking = () => {
      stopTracking();
      timerRef.current = window.setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          onTimeUpdate(time);
        }
      }, 100); // 100ms interval for smooth sync
    };

    const stopTracking = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        if (!isCancelled) createPlayer();
      };
    }

    return () => {
      isCancelled = true;
      stopTracking();
    };
  }, [videoId]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800/80">
      <div ref={containerRef} className="w-full h-full" />
      
      {!isReady && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10 text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">유튜브 플레이어 준비 중...</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10 p-6 text-center text-rose-300">
          <p className="font-semibold text-lg mb-2">영상을 재생할 수 없습니다</p>
          <p className="text-xs text-slate-400 max-w-sm">
            동영상이 외부 임베드를 허용하지 않거나 비공개 상태일 수 있습니다. 다른 유튜브 ID를 확인해 주세요.
          </p>
        </div>
      )}
    </div>
  );
};
