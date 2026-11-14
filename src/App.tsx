import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Song } from './types/song';
import { getStoredSongs, saveCustomSong, deleteSongById, resetSongsToDefault } from './services/songStorage';
import { YouTubePlayer } from './components/YouTubePlayer';
import { LyricViewer } from './components/LyricViewer';
import { Header } from './components/Header';
import { PlaylistDrawer } from './components/PlaylistDrawer';
import { AddSongModal } from './components/AddSongModal';
import { KanjiInspectorPanel } from './components/KanjiInspectorPanel';
import { extractKanji } from './utils/lyricParser';
import { Music2, BookOpen, Video } from 'lucide-react';

export const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Toggles & Preferences
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [fontStyle, setFontStyle] = useState<'serif' | 'sans'>('serif');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Left View: false = Video visible, true = Real-time Kanji Inspector covers entire left panel (Audio never stops!)
  const [showKanjiView, setShowKanjiView] = useState<boolean>(false);

  // Playback flow: Shuffle & Auto-Next
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState<boolean>(false);

  // Modals
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Player reference for seeking
  const playerRef = useRef<any>(null);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Load initial songs from storage
  useEffect(() => {
    const loaded = getStoredSongs();
    setSongs(loaded);
    if (loaded.length > 0) {
      setCurrentSong(loaded[0]);
    }
  }, []);

  // Find active lyric line in real-time
  const activeLyric = useMemo(() => {
    if (!currentSong || currentSong.lyrics.length === 0) return null;
    
    // 1. Check exact match
    const exact = currentSong.lyrics.find(
      (line, idx) => {
        const nextLine = currentSong.lyrics[idx + 1];
        const endLimit = nextLine ? Math.min(line.end + 0.5, nextLine.start) : line.end + 1.0;
        return currentTime >= line.start && currentTime < endLimit;
      }
    );
    if (exact) return exact;

    // 2. Fallback to latest line that has already started
    let latest = currentSong.lyrics[0];
    for (let i = 0; i < currentSong.lyrics.length; i++) {
      if (currentTime >= currentSong.lyrics[i].start) {
        latest = currentSong.lyrics[i];
      } else {
        break;
      }
    }
    return latest;
  }, [currentSong, currentTime]);

  // Extract kanji list of current line in real-time
  const currentLineKanji = useMemo(() => {
    if (!activeLyric) return [];
    return extractKanji(activeLyric.rubyText);
  }, [activeLyric]);

  // Handle Seek from lyrics
  const handleSeek = (time: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(time, true);
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    }
    setCurrentTime(time);
  };

  // Switch song
  const handleSelectSong = (song: Song) => {
    setShouldAutoPlay(true);
    setCurrentSong(song);
    setCurrentTime(0);
  };

  // Play next song (Auto or manual)
  const handlePlayNextSong = () => {
    if (songs.length === 0) return;

    if (songs.length === 1) {
      handleSeek(0);
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    let nextIndex: number;

    if (isShuffle) {
      const candidates = songs
        .map((_, idx) => idx)
        .filter(idx => idx !== currentIndex);
      nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }

    const nextSong = songs[nextIndex];
    if (nextSong) {
      setShouldAutoPlay(true);
      setCurrentSong(nextSong);
      setCurrentTime(0);
    }
  };

  // Immediate Shuffle play trigger
  const handleShufflePlayNow = () => {
    if (songs.length <= 1) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    const candidates = songs
      .map((_, idx) => idx)
      .filter(idx => idx !== currentIndex);
    const nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
    const nextSong = songs[nextIndex];
    if (nextSong) {
      setShouldAutoPlay(true);
      setCurrentSong(nextSong);
      setCurrentTime(0);
    }
  };

  // Add custom song
  const handleAddSong = (newSong: Song) => {
    const updated = saveCustomSong(newSong);
    setSongs(updated);
    setShouldAutoPlay(true);
    setCurrentSong(newSong);
    setCurrentTime(0);
  };

  // Delete custom song
  const handleDeleteSong = (id: string) => {
    const updated = deleteSongById(id);
    setSongs(updated);
    if (currentSong?.id === id) {
      setCurrentSong(updated[0] || null);
      setCurrentTime(0);
    }
  };

  // Reset defaults
  const handleResetDefaults = () => {
    const defaults = resetSongsToDefault();
    setSongs(defaults);
    setCurrentSong(defaults[0]);
    setCurrentTime(0);
  };

  // When a kanji is clicked in lyrics, switch left panel to Kanji view
  const handleKanjiClick = () => {
    setShowKanjiView(true);
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Music2 className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">보관함에 노래가 없습니다</h2>
          <p className="text-sm text-slate-500">기본 곡을 불러오거나 새 노래 JSON을 추가해 보세요.</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
          >
            기본 곡(에메랄드) 불러오기
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium text-sm transition-all"
          >
            새 노래 추가
          </button>
        </div>

        {isAddModalOpen && (
          <AddSongModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddSong={handleAddSong}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors">
      {/* Top Header */}
      <Header
        currentSong={currentSong}
        showFurigana={showFurigana}
        onToggleFurigana={() => setShowFurigana(prev => !prev)}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(prev => !prev)}
        autoScroll={autoScroll}
        onToggleAutoScroll={() => setAutoScroll(prev => !prev)}
        fontStyle={fontStyle}
        onToggleFontStyle={() => setFontStyle(prev => prev === 'serif' ? 'sans' : 'serif')}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onTogglePlaylist={() => setIsPlaylistOpen(prev => !prev)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        songCount={songs.length}
      />

      {/* Main Study Arena */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left Side: Video + Real-Time Kanji Switcher Panel */}
        <section className="lg:col-span-5 xl:col-span-5 flex flex-col h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 relative overflow-hidden">
          
          {/* Top View Mode Switcher Tab Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex-shrink-0 z-30">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800">
              {/* Show Video Button */}
              <button
                type="button"
                onClick={() => setShowKanjiView(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  !showKanjiView
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-indigo-500" />
                <span>영상 화면 보기</span>
              </button>

              {/* Show Real-time Kanji Button */}
              <button
                type="button"
                onClick={() => setShowKanjiView(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  showKanjiView
                    ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>실시간 한자 보기</span>
                {currentLineKanji.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono">
                    {currentLineKanji.length}자
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Left Panel Body: Relative Container with overflow-hidden */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {/* 1. Underlying Video (ALWAYS mounted so YouTube audio keeps playing seamlessly!) */}
            <div
              className={
                showKanjiView
                  ? 'absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none'
                  : 'w-full flex-shrink-0 p-4 pb-0 lg:p-5 lg:pb-0'
              }
            >
              <div className="w-full rounded-2xl overflow-hidden shadow-md">
                <YouTubePlayer
                  videoId={currentSong.youtubeId}
                  onTimeUpdate={setCurrentTime}
                  onEnded={() => {
                    if (autoPlayNext) {
                      handlePlayNextSong();
                    }
                  }}
                  autoPlay={shouldAutoPlay}
                  playerRefCallback={(player) => {
                    playerRef.current = player;
                  }}
                />
              </div>
            </div>

            {/* 2. Video Mode Sub-content: Song Overview & All Kanji List */}
            {!showKanjiView && (
              <div className="flex-1 overflow-y-auto p-4 pt-3 lg:p-5 lg:pt-3 space-y-4">
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {currentSong.title}
                      </h2>
                      <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium mt-0.5">
                        {currentSong.artist}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      {currentSong.lyrics.length}구절
                    </span>
                  </div>

                  {/* In-Song Kanji Cloud */}
                  {Object.keys(currentSong.kanjiDictionary).length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          이 곡의 전체 한자 ({Object.keys(currentSong.kanjiDictionary).length}자)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowKanjiView(true)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          실시간 한자 보기 →
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 max-h-52 overflow-y-auto">
                        {Object.entries(currentSong.kanjiDictionary).map(([char, info]) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => setShowKanjiView(true)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all text-xs"
                            title={`${char} (${info.korean})`}
                          >
                            <span className="font-jpSerif font-bold text-base text-amber-600 dark:text-amber-200 group-hover:text-amber-500 dark:group-hover:text-amber-300">
                              {char}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 truncate max-w-[80px]">
                              {info.korean.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Real-time Kanji View (100% covers entire panel with independent scroll) */}
            {showKanjiView && (
              <div className="flex-1 overflow-y-auto p-4 lg:p-5 animate-fadeIn">
                <KanjiInspectorPanel
                  currentLineText={activeLyric?.rubyText}
                  currentLineTranslation={activeLyric?.translation}
                  currentLineKanji={currentLineKanji}
                  allSongKanji={currentSong.kanjiDictionary}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Interactive Sync Lyrics */}
        <section className="lg:col-span-7 xl:col-span-7 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950 relative">
          {/* Lyrics Header Bar */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2 font-medium">
              <Music2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>실시간 싱크 가사</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">(소절 클릭 시 점프)</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                서체: <span className="text-slate-700 dark:text-slate-200 font-bold">{fontStyle === 'serif' ? '명조(세리프)' : '고딕(산스)'}</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 font-bold">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Scrollable Lyrics Container */}
          <div className="flex-1 overflow-hidden relative">
            <LyricViewer
              lyrics={currentSong.lyrics}
              currentTime={currentTime}
              showFurigana={showFurigana}
              showTranslation={showTranslation}
              autoScroll={autoScroll}
              fontStyle={fontStyle}
              onSeek={handleSeek}
              onSelectKanji={handleKanjiClick}
            />
          </div>
        </section>
      </main>

      {/* Side Playlist Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        songs={songs}
        currentSongId={currentSong.id}
        onSelectSong={handleSelectSong}
        onOpenAddModal={() => {
          setIsPlaylistOpen(false);
          setIsAddModalOpen(true);
        }}
        onDeleteSong={handleDeleteSong}
        onResetDefaults={handleResetDefaults}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle(prev => !prev)}
        autoPlayNext={autoPlayNext}
        onToggleAutoPlayNext={() => setAutoPlayNext(prev => !prev)}
        onShufflePlayNow={handleShufflePlayNow}
      />

      {/* Add Custom Song Modal */}
      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSong={handleAddSong}
      />
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default App;
