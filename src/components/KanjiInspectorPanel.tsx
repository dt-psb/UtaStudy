import React from 'react';
import type { KanjiDetail } from '../types/song';
import { getKanjiWithFallback } from '../services/kanjiMasterService';
import { Sparkles, BookOpen } from 'lucide-react';

interface KanjiInspectorPanelProps {
  currentLineText?: string;
  currentLineTranslation?: string;
  currentLineKanji: string[];
  allSongKanji: Record<string, KanjiDetail>;
}

export const KanjiInspectorPanel: React.FC<KanjiInspectorPanelProps> = ({
  currentLineText,
  currentLineTranslation,
  currentLineKanji,
  allSongKanji
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Current Lyric Context Banner */}
      {currentLineText && (
        <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm flex-shrink-0">
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400"></span>
            </span>
            <span>현재 재생 중인 소절</span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-jpSerif text-slate-900 dark:text-white tracking-wide leading-relaxed">
            {currentLineText.replace(/\[[^\]]+\]/g, '')}
          </p>
          {currentLineTranslation && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 font-sans font-medium">
              {currentLineTranslation}
            </p>
          )}
        </div>
      )}

      {/* Kanji Cards: Full-width responsive cards with enlarged readable UI */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {currentLineKanji.length > 0 ? (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            {currentLineKanji.map((char) => {
              const detail = getKanjiWithFallback(char, allSongKanji);

              return (
                <div
                  key={char}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-4"
                >
                  {/* Top: Large Kanji Box + Korean Meaning & Name */}
                  <div className="flex items-start gap-4">
                    {/* Enlarged Kanji Character Box */}
                    <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center bg-slate-50 dark:bg-slate-800/90 border-2 border-indigo-200/80 dark:border-indigo-500/50 rounded-2xl shadow-inner flex-shrink-0">
                      <span className="text-4xl sm:text-5xl font-black font-jpSerif text-amber-600 dark:text-amber-200 select-all leading-none">
                        {char}
                      </span>
                    </div>

                    {/* Korean Name & Meaning */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {detail?.jlptLevel && (
                          <span className="px-2 py-0.5 text-xs font-black rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                            {detail.jlptLevel}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">한자 상세</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                        {detail?.korean || `${char} (한자)`}
                      </h4>
                      {detail?.meaning && (
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium mt-1">
                          {detail.meaning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Enlarged Kun-yomi & On-yomi Chips */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Kun-yomi (훈독) */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-indigo-700 dark:text-indigo-400 w-11 flex-shrink-0">
                        훈독
                      </span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {detail?.kun && detail.kun.length > 0 ? (
                          detail.kun.map((k, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-200 font-jpSerif font-bold text-xs sm:text-sm"
                            >
                              {k}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs sm:text-sm font-medium">-</span>
                        )}
                      </div>
                    </div>

                    {/* On-yomi (음독) */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-purple-700 dark:text-purple-400 w-11 flex-shrink-0">
                        음독
                      </span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {detail?.on && detail.on.length > 0 ? (
                          detail.on.map((o, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 border border-purple-200/60 dark:border-purple-800/60 text-purple-800 dark:text-purple-200 font-jpSerif font-bold text-xs sm:text-sm"
                            >
                              {o}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs sm:text-sm font-medium">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Enlarged Examples Box */}
                  {detail?.examples && detail.examples.length > 0 && (
                    <div className="pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>활용 예시 단어</span>
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          {detail.examples.slice(0, 2).map((ex, exIdx) => (
                            <div key={exIdx} className="flex flex-wrap items-baseline gap-2 text-sm sm:text-base">
                              <span className="font-bold font-jpSerif text-slate-900 dark:text-white">
                                {ex.word}
                              </span>
                              <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-300 font-jpSerif font-semibold">
                                ({ex.reading})
                              </span>
                              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                                : {ex.meaning}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-30 text-indigo-500" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">현재 소절에는 한자가 없습니다.</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">히라가나/가타카나 구절이거나 간주 구간입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};


