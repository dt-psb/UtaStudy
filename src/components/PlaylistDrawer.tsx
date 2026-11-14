import React, { useState } from 'react';
import type { Song } from '../types/song';
import { ListMusic, Plus, Trash2, Search, Play, Music, RotateCcw, X, Shuffle, Repeat } from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  currentSongId: string;
  onSelectSong: (song: Song) => void;
  onOpenAddModal: () => void;
  onDeleteSong: (id: string) => void;
  onResetDefaults: () => void;
  onRestoreDefaults?: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  autoPlayNext: boolean;
  onToggleAutoPlayNext: () => void;
  onShufflePlayNow: () => void;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  songs,
  currentSongId,
  onSelectSong,
  onOpenAddModal,
  onDeleteSong,
  onResetDefaults,
  onRestoreDefaults,
  isShuffle,
  onToggleShuffle,
  autoPlayNext,
  onToggleAutoPlayNext,
  onShufflePlayNow
}) => {
  const [search, setSearch] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">노래 보관함 (Playlist)</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-mono">
              {songs.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={onOpenAddModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            새 노래 (JSON) 추가하기
          </button>

          {/* Playback Controls: Shuffle & Auto-Next Toggle */}
          <div className="grid grid-cols-2 gap-2">
            {/* Shuffle Mode Toggle */}
            <button
              type="button"
              onClick={onToggleShuffle}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                isShuffle
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
              }`}
              title="곡이 끝났을 때 무작위 곡으로 재생"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffle ? 'text-white' : 'text-purple-500'}`} />
              <span>{isShuffle ? '셔플 ON' : '셔플 OFF'}</span>
            </button>

            {/* Auto Next Song Toggle */}
            <button
              type="button"
              onClick={onToggleAutoPlayNext}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                autoPlayNext
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
              title="곡이 끝났을 때 자동으로 다음 곡 재생"
            >
              <Repeat className={`w-3.5 h-3.5 ${autoPlayNext ? 'text-white' : 'text-indigo-500'}`} />
              <span>{autoPlayNext ? '자동넘김 ON' : '자동넘김 OFF'}</span>
            </button>
          </div>

          {/* Quick Shuffle Trigger (if 2 or more songs exist) */}
          {songs.length >= 2 && (
            <button
              type="button"
              onClick={onShufflePlayNow}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/80 dark:border-purple-800/60 text-xs font-semibold transition-colors"
            >
              <Shuffle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>지금 무작위 곡으로 셔플 재생</span>
            </button>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="제목 또는 아티스트 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Delete Mode Guidance Banner */}
        {isDeleteMode && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5 font-medium">
              <Trash2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              삭제할 곡의 휴지통을 누르세요 (trash 백업)
            </span>
            <button
              type="button"
              onClick={() => setIsDeleteMode(false)}
              className="font-bold underline text-[11px] ml-2 text-rose-600 dark:text-rose-400"
            >
              완료
            </button>
          </div>
        )}

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSongs.map((song, index) => {
            const isPlaying = song.id === currentSongId;
            const thumbnail = song.thumbnail || `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;

            return (
              <div
                key={song.id}
                onClick={() => {
                  onSelectSong(song);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group relative flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isPlaying
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-500/60 shadow-sm'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Status indicator */}
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-4 text-center">
                  {isPlaying ? (
                    <Play className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Thumbnail */}
                <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 dark:border-slate-700/50">
                  <img
                    src={thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>

                {/* Song Meta (구절 표시 제거 완료!) */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${
                    isPlaying ? 'text-indigo-900 dark:text-indigo-200 font-bold' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {song.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {song.artist}
                  </p>
                </div>

                {/* Delete button (ONLY shown when isDeleteMode is active!) */}
                {isDeleteMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`'${song.title}' 곡을 보관함에서 삭제하시겠습니까?\n\n(삭제된 곡은 trash/ 폴더에 안전하게 백업 보관됩니다)`)) {
                        onDeleteSong(song.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/60 transition-all flex-shrink-0 animate-scaleIn shadow-sm border border-rose-200 dark:border-rose-800"
                    title="trash/ 폴더에 안전 백업 후 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {filteredSongs.length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400 space-y-3">
              <Music className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
              <p className="text-sm font-medium">
                {search ? '검색된 곡이 없습니다.' : '보관함에 노래가 없습니다.'}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-600/20 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  기본 곡(에메랄드) 불러오기
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer info & Safe Management Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between text-xs">
          {/* Left: Safe Restore Button (Restores built-ins without deleting custom songs) */}
          <button
            type="button"
            onClick={() => {
              if (confirm('기본 곡(에메랄드 등)을 보관함에 복원(추가)하시겠습니까?\n(사용자가 추가한 다른 곡은 유지됩니다)')) {
                if (onRestoreDefaults) {
                  onRestoreDefaults();
                } else {
                  onResetDefaults();
                }
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            title="기본 곡을 보관함에 복원"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>기본 곡 복원</span>
          </button>

          {/* Right: Toggle Delete / Management Mode Button */}
          <button
            type="button"
            onClick={() => setIsDeleteMode(prev => !prev)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
              isDeleteMode
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/30'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600'
            }`}
            title="곡 삭제 버튼 표시/숨김 토글"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleteMode ? '삭제 완료' : '곡 삭제'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
