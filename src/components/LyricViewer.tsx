import React, { useEffect, useRef } from 'react';
import type { LyricLine } from '../types/song';
import { parseRubyText, isKanji } from '../utils/lyricParser';
import { Play, Sparkles } from 'lucide-react';

interface LyricViewerProps {
  lyrics: LyricLine[];
  currentTime: number;
  showFurigana: boolean;
  showTranslation: boolean;
  autoScroll: boolean;
  fontStyle: 'serif' | 'sans';
  onSeek: (time: number) => void;
  onSelectKanji: (char: string) => void;
}

export const LyricViewer: React.FC<LyricViewerProps> = ({
  lyrics,
  currentTime,
  showFurigana,
  showTranslation,
  autoScroll,
  fontStyle,
  onSeek,
  onSelectKanji
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Find active line index
  const activeIndex = lyrics.findIndex(
    (line, idx) => {
      const nextLine = lyrics[idx + 1];
      const endLimit = nextLine ? Math.min(line.end + 0.5, nextLine.start) : line.end + 1.0;
      return currentTime >= line.start && currentTime < endLimit;
    }
  );

  // Auto scroll to active line
  useEffect(() => {
    if (autoScroll && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, autoScroll]);

  // Render clickable text without creating unwanted whitespace
  const renderClickableText = (text: string, keyPrefix: string) => {
    const chars = Array.from(text);
    return chars.map((char, i) => {
      if (isKanji(char)) {
        return (
          <span
            key={`${keyPrefix}-k-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectKanji(char);
            }}
            className="cursor-pointer text-indigo-500 dark:text-indigo-300 hover:text-amber-500 dark:hover:text-amber-300 hover:underline decoration-amber-400 decoration-2 underline-offset-4 transition-colors font-semibold"
            title={`한자 '${char}' 상세 보기`}
          >
            {char}
          </span>
        );
      }
      return <React.Fragment key={`${keyPrefix}-c-${i}`}>{char}</React.Fragment>;
    });
  };

  // Render tokens with grid-aligned ruby
  const renderRubyLine = (rubyText: string) => {
    const tokens = parseRubyText(rubyText);

    return tokens.map((token, tIdx) => {
      if (token.type === 'ruby') {
        return (
          <ruby key={`rb-${tIdx}`}>
            <rt>{token.ruby}</rt>
            <span className="ruby-base">
              {renderClickableText(token.text, `rb-${tIdx}`)}
            </span>
          </ruby>
        );
      }

      return (
        <React.Fragment key={`txt-${tIdx}`}>
          {renderClickableText(token.text, `txt-${tIdx}`)}
        </React.Fragment>
      );
    });
  };

  const fontClass = fontStyle === 'serif' ? 'font-jpSerif' : 'font-jpSans';

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto px-4 py-6 space-y-3.5 select-text ${!showFurigana ? 'hide-furigana' : ''}`}
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = currentTime > line.end;

        return (
          <div
            key={line.id}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.start)}
            className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer border ${
              isActive
                ? 'bg-indigo-50/90 dark:bg-gradient-to-r dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-purple-950/80 border-indigo-300 dark:border-indigo-500/60 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/50 scale-[1.01]'
                : isPast
                ? 'bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-80'
                : 'bg-white/30 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-70'
            }`}
          >
            {/* Timestamp & Play Indicator */}
            <div className="flex items-center justify-between text-xs mb-1 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                {isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
                {formatTime(line.start)}
              </span>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full transition-opacity font-medium"
              >
                <Play className="w-3 h-3 fill-current" />
                이 소절 재생
              </button>
            </div>

            {/* Japanese Lyrics with Precision Ruby */}
            <div className={`text-xl sm:text-2xl pt-2 pb-1 tracking-normal ${fontClass} ${
              isActive
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-700 dark:text-slate-200'
            }`}>
              {renderRubyLine(line.rubyText)}
            </div>

            {/* Korean Translation */}
            {showTranslation && (
              <div className={`mt-2 text-sm sm:text-base font-sans leading-relaxed ${
                isActive
                  ? 'text-indigo-900 dark:text-amber-200/90 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {line.translation}
              </div>
            )}

            {/* Left Accent Bar on Active */}
            {isActive && (
              <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
            )}
          </div>
        );
      })}

      {lyrics.length === 0 && (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>등록된 가사가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
