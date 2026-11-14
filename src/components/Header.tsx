import React from 'react';
import { Eye, EyeOff, Languages, ListMusic, Plus, ScrollText, Sun, Moon, Type } from 'lucide-react';
import type { Song } from '../types/song';

interface HeaderProps {
  currentSong: Song;
  showFurigana: boolean;
  onToggleFurigana: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  fontStyle: 'serif' | 'sans';
  onToggleFontStyle: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onTogglePlaylist: () => void;
  onOpenAddModal: () => void;
  songCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSong,
  showFurigana,
  onToggleFurigana,
  showTranslation,
  onToggleTranslation,
  autoScroll,
  onToggleAutoScroll,
  fontStyle,
  onToggleFontStyle,
  theme,
  onToggleTheme,
  onTogglePlaylist,
  onOpenAddModal,
  songCount
}) => {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-3 transition-colors">
      {/* Brand & Current Song */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
            <span className="text-lg font-bold text-white font-jpSerif">歌</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white hidden sm:block font-sans">
                UtaStudy
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 font-mono hidden md:inline-block">
                J-POP Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs font-sans">
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentSong.title}</span> • {currentSong.artist}
            </p>
          </div>
        </div>
      </div>

      {/* Control Buttons (Toggles & Actions) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Font Style Toggle (Serif / Sans) */}
        <button
          type="button"
          onClick={onToggleFontStyle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            fontStyle === 'serif'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-600/50 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="일본어 가사 서체 변경 (명조체 ↔ 고딕체)"
        >
          <Type className="w-3.5 h-3.5" />
          <span>{fontStyle === 'serif' ? '명조(세리프)' : '고딕(산스)'}</span>
        </button>

        {/* Furigana Toggle */}
        <button
          type="button"
          onClick={onToggleFurigana}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showFurigana
              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-200'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
          }`}
          title="후리가나(발음) 표시 / 숨김 (한자 암기 모드)"
        >
          {showFurigana ? <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">후리가나</span> {showFurigana ? 'ON' : 'OFF'}
        </button>

        {/* Translation Toggle */}
        <button
          type="button"
          onClick={onToggleTranslation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            showTranslation
              ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-200'
              : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
          }`}
          title="한국어 번역 표시 / 숨김 (직독직해 모드)"
        >
          <Languages className={`w-3.5 h-3.5 ${showTranslation ? 'text-purple-600 dark:text-purple-400' : ''}`} />
          <span className="hidden sm:inline">번역</span> {showTranslation ? 'ON' : 'OFF'}
        </button>

        {/* Auto Scroll Toggle */}
        <button
          type="button"
          onClick={onToggleAutoScroll}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            autoScroll
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              : 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
          }`}
          title="현재 재생 위치로 가사 자동 스크롤"
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>자동스크롤</span>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 transition-colors"
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

        {/* Add Song Quick Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          title="새 노래 JSON 추가"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>곡 추가</span>
        </button>

        {/* Playlist Toggle */}
        <button
          type="button"
          onClick={onTogglePlaylist}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
          title="보관함 열기"
        >
          <ListMusic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">보관함</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-mono">
            {songCount}
          </span>
        </button>
      </div>
    </header>
  );
};
