import React from 'react';
import type { KanjiDetail } from '../types/song';
import { X, ExternalLink, BookOpen, Sparkles } from 'lucide-react';

interface KanjiModalProps {
  character: string | null;
  kanjiInfo?: KanjiDetail;
  onClose: () => void;
}

export const KanjiModal: React.FC<KanjiModalProps> = ({
  character,
  kanjiInfo,
  onClose
}) => {
  if (!character) return null;

  const naverDictUrl = `https://ja.dict.naver.com/#/search?query=${encodeURIComponent(character)}`;
  const jishoUrl = `https://jisho.org/search/${encodeURIComponent(character)}%20%23kanji`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen className="w-5 h-5 text-indigo-200" />
            <span>한자 상세 사전 (Kanji Inspector)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/90 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Main Character Header */}
          <div className="flex items-start gap-6 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            {/* Big Kanji Display */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:to-indigo-950/60 border-2 border-indigo-200 dark:border-indigo-500/40 rounded-2xl shadow-sm dark:shadow-inner">
              <span className="text-6xl sm:text-7xl font-jpSerif text-amber-600 dark:text-amber-200 select-all">
                {character}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {kanjiInfo?.jlptLevel && (
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    JLPT {kanjiInfo.jlptLevel}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  U+{character.charCodeAt(0).toString(16).toUpperCase()}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {kanjiInfo?.korean || `${character} (상세 정보 준비 중)`}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {kanjiInfo?.meaning || '이 한자에 대한 추가 정보는 네이버 사전에서 바로 확인하실 수 있습니다.'}
              </p>
            </div>
          </div>

          {/* Kun-yomi & On-yomi Readings */}
          {kanjiInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Kun-yomi */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/40">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-700 dark:text-indigo-400 block mb-1.5 font-sans">
                  🇯🇵 훈독 (訓読み - 뜻 읽기)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kanjiInfo.kun && kanjiInfo.kun.length > 0 ? (
                    kanjiInfo.kun.map((k, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 rounded-lg border border-indigo-200 dark:border-indigo-800/40 font-mono"
                      >
                        {k}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              </div>

              {/* On-yomi */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/40">
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-700 dark:text-purple-400 block mb-1.5 font-sans">
                  🇯🇵 음독 (音読み - 소리 읽기)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kanjiInfo.on && kanjiInfo.on.length > 0 ? (
                    kanjiInfo.on.map((o, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-sm bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 rounded-lg border border-purple-200 dark:border-purple-800/40 font-mono"
                      >
                        {o}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vocabulary Examples */}
          {kanjiInfo?.examples && kanjiInfo.examples.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                대표 활용 단어 예시
              </h4>
              <div className="space-y-2">
                {kanjiInfo.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold font-jpSerif text-slate-900 dark:text-white tracking-wide">
                          {ex.word}
                        </span>
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-300">
                          [{ex.reading}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{ex.meaning}</p>
                    </div>

                    <a
                      href={`https://ja.dict.naver.com/#/search?query=${encodeURIComponent(ex.word)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                      title="네이버 사전에서 단어 검색"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick External Links */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>더 많은 용례 찾기:</span>
            <div className="flex items-center gap-2">
              <a
                href={naverDictUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
              >
                네이버 사전
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={jishoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/40 transition-colors"
              >
                Jisho
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
