import type { Song } from '../types/song';
import { emeraldSong } from '../data/songs/emerald';

const STORAGE_KEY = 'utastudy_songs_v28';
const TRASH_STORAGE_KEY = 'utastudy_trash_songs_v1';
const DELETED_STORAGE_KEY = 'utastudy_deleted_song_ids_v1';

// Minimal safe fallback song in case files are missing
const FALLBACK_EMERALD_SONG: Song = {
  id: 'kitani-emerald-safe-fallback',
  title: 'エメラルド (Emerald)',
  artist: 'キタニタツヤ (Tatsuya Kitani) feat. 初音ミク',
  youtubeId: 'kM8HEzBGU-0',
  lyrics: [
    {
      id: 1,
      start: 12.0,
      end: 18.0,
      rubyText: 'あなたは僕[ぼく]にとってまるで拡声器[かくせいき]だったよ',
      translation: '넌 내게 확성기 같았어'
    }
  ],
  kanjiDictionary: {
    '僕': {
      character: '僕',
      korean: '나 복 / 종 복',
      kun: ['しもべ'],
      on: ['ボク'],
      meaning: '나 (남성 1인칭 대명사), 하인',
      jlptLevel: 'N4',
      examples: [{ word: '僕たち', reading: 'ぼくたち', meaning: '우리들' }]
    }
  }
};

// Validate and sanitize any raw song object to prevent runtime crashes
export const sanitizeSong = (raw: any): Song => {
  if (!raw || typeof raw !== 'object') {
    return { ...FALLBACK_EMERALD_SONG };
  }

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `song-${Date.now()}`;
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '제목 없음';
  const artist = typeof raw.artist === 'string' && raw.artist.trim() ? raw.artist.trim() : '알 수 없음';
  const youtubeId = typeof raw.youtubeId === 'string' && raw.youtubeId.trim()
    ? raw.youtubeId.trim()
    : (typeof raw.youtube_id === 'string' ? raw.youtube_id.trim() : 'kM8HEzBGU-0');

  const lyrics = Array.isArray(raw.lyrics)
    ? raw.lyrics.map((l: any, idx: number) => ({
        id: typeof l.id === 'number' ? l.id : idx + 1,
        start: typeof l.start === 'number' ? l.start : Number(l.start) || 0,
        end: typeof l.end === 'number' ? l.end : Number(l.end) || (Number(l.start) || 0) + 4,
        rubyText: typeof l.rubyText === 'string' ? l.rubyText : (typeof l.ruby_text === 'string' ? l.ruby_text : (l.text || '')),
        translation: typeof l.translation === 'string' ? l.translation : (l.korean || ''),
        romaji: typeof l.romaji === 'string' ? l.romaji : undefined
      }))
    : [];

  const kanjiDictionary = (raw.kanjiDictionary && typeof raw.kanjiDictionary === 'object')
    ? raw.kanjiDictionary
    : ((raw.kanji_dictionary && typeof raw.kanji_dictionary === 'object') ? raw.kanji_dictionary : {});

  return {
    id,
    title,
    artist,
    youtubeId,
    thumbnail: raw.thumbnail || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    duration: typeof raw.duration === 'number' ? raw.duration : undefined,
    lyrics,
    kanjiDictionary
  };
};

// Deduplicate songs by id and youtubeId to prevent any duplicate entries (e.g. 2 copies of I'm Mine)
export const deduplicateSongs = (songs: Song[]): Song[] => {
  const seenIds = new Set<string>();
  const seenYtIds = new Set<string>();
  const result: Song[] = [];

  for (const s of songs) {
    if (!s || !s.id) continue;
    const yId = (s.youtubeId || '').trim();
    if (seenIds.has(s.id)) continue;
    if (yId && seenYtIds.has(yId)) continue;

    seenIds.add(s.id);
    if (yId) seenYtIds.add(yId);
    result.push(s);
  }
  return result;
};

// Permanently deleted song ID tracking
export const getDeletedSongIds = (): Set<string> => {
  const set = new Set<string>();
  // Songs explicitly deleted by user
  set.add('lumina-hare');
  set.add('gen-hoshino-toki-yo');
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach(id => set.add(id));
      }
    }
  } catch (e) {
    console.error('Failed to read deleted song ids:', e);
  }
  return set;
};

export const addDeletedSongId = (id: string) => {
  try {
    const set = getDeletedSongIds();
    set.add(id);
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to record deleted song id:', e);
  }
};

export const removeDeletedSongId = (id: string) => {
  try {
    const set = getDeletedSongIds();
    set.delete(id);
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to remove deleted song id:', e);
  }
};

// Discover all valid songs from src/data/songs/*.ts (auto-detects all songs created on disk!)
export const loadDiskSongs = (): Song[] => {
  try {
    const modules = import.meta.glob('../data/songs/*.ts', { eager: true });
    const discovered: Song[] = [];

    for (const [, mod] of Object.entries(modules)) {
      const exported = mod as any;
      for (const val of Object.values(exported)) {
        if (val && typeof val === 'object' && ('lyrics' in (val as any) || 'youtubeId' in (val as any))) {
          discovered.push(sanitizeSong(val));
        }
      }
    }

    if (discovered.length > 0) {
      return deduplicateSongs(discovered);
    }
  } catch (err) {
    console.warn('Failed to discover songs from disk:', err);
  }

  return [sanitizeSong(emeraldSong)];
};

// Default song: Emerald is the fallback
export const loadBuiltinSongs = (): Song[] => {
  try {
    return [sanitizeSong(emeraldSong)];
  } catch (err) {
    console.warn('Failed to load emerald song, using fallback:', err);
    return [FALLBACK_EMERALD_SONG];
  }
};

export const initialSongs: Song[] = loadBuiltinSongs();

// Backup a deleted song to local trash/ folder (via Vite dev server API) and localStorage
export const backupToTrash = (song: Song) => {
  // 1. Backup to browser localStorage trash
  try {
    const rawTrash = localStorage.getItem(TRASH_STORAGE_KEY);
    const trashList: Song[] = rawTrash ? JSON.parse(rawTrash) : [];
    const exists = trashList.some(s => s.id === song.id);
    if (!exists) {
      trashList.push(song);
      localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trashList));
    }
  } catch (e) {
    console.error('Failed to backup to localStorage trash:', e);
  }

  // 2. Backup to physical 'trash/' folder on disk via Vite dev server middleware
  try {
    fetch('/api/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    }).catch(err => {
      console.warn('Disk trash backup skipped:', err);
    });
  } catch {}
};

// Get stored songs from localStorage (Single Source of Truth with auto-detection of disk songs & deduplication)
export const getStoredSongs = (): Song[] => {
  const diskSongs = loadDiskSongs();
  const deletedIds = getDeletedSongIds();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: initialize with all available non-deleted disk songs
      const initial = deduplicateSongs(diskSongs.filter(s => !deletedIds.has(s.id)));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      } catch {}
      return initial;
    }

    const stored: any[] = JSON.parse(raw);
    const currentStored: Song[] = Array.isArray(stored)
      ? deduplicateSongs(
          stored
            .filter(s => s && typeof s === 'object')
            .map(sanitizeSong)
            .filter(s => !deletedIds.has(s.id))
        )
      : [];

    // Build map of latest non-deleted disk songs to ensure disk updates always reflect in storage
    const diskSongMap = new Map<string, Song>();
    for (const dSong of diskSongs) {
      if (!deletedIds.has(dSong.id)) {
        diskSongMap.set(dSong.id, dSong);
        const yId = (dSong.youtubeId || '').trim();
        if (yId) diskSongMap.set(yId, dSong);
      }
    }

    // Update matching stored songs with latest disk data, while preserving custom user songs & ordering
    const updatedStored = currentStored.map(s => {
      const fromDisk = diskSongMap.get(s.id) || (s.youtubeId ? diskSongMap.get(s.youtubeId.trim()) : undefined);
      return fromDisk ? fromDisk : s;
    });

    const existingIds = new Set<string>(updatedStored.map(s => s.id));
    const existingYtIds = new Set<string>(
      updatedStored.map(s => (s.youtubeId || '').trim()).filter(Boolean)
    );

    // Find new songs on disk that the user hasn't seen/stored yet and hasn't deleted!
    const newlyAddedSongs: Song[] = [];
    for (const dSong of diskSongs) {
      if (deletedIds.has(dSong.id)) continue;
      const yId = (dSong.youtubeId || '').trim();
      if (existingIds.has(dSong.id) || (yId && existingYtIds.has(yId))) {
        continue;
      }
      newlyAddedSongs.push(dSong);
      existingIds.add(dSong.id);
      if (yId) existingYtIds.add(yId);
    }

    // Prepend newly added songs to the top of the playlist so they are immediately accessible!
    const merged = deduplicateSongs([...newlyAddedSongs, ...updatedStored]);

    // Save back deduplicated clean array to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}

    return merged.length > 0 ? merged : [sanitizeSong(emeraldSong)];
  } catch (err) {
    console.error('Failed to load songs from localStorage:', err);
    return deduplicateSongs(diskSongs.filter(s => !deletedIds.has(s.id)));
  }
};

// Save newly added song to storage
export const saveCustomSong = (newSong: Song): Song[] => {
  const sanitized = sanitizeSong(newSong);
  // Unmark from deleted list if user explicitly re-adds it
  removeDeletedSongId(sanitized.id);

  const currentSongs = getStoredSongs();
  const existsIndex = currentSongs.findIndex(
    s => s.id === sanitized.id || (s.youtubeId && s.youtubeId === sanitized.youtubeId)
  );
  
  let updated: Song[];
  if (existsIndex >= 0) {
    updated = [...currentSongs];
    updated[existsIndex] = sanitized;
  } else {
    updated = [sanitized, ...currentSongs];
  }

  const cleanUpdated = deduplicateSongs(updated);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanUpdated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return cleanUpdated;
};

// Safe delete with automatic backup to 'trash/' folder & localStorage trash
export const deleteSongById = (id: string): Song[] => {
  const current = getStoredSongs();
  const targetSong = current.find(s => s.id === id);
  if (targetSong) {
    backupToTrash(targetSong);
    // If target has a youtubeId, ensure it's tracked
    addDeletedSongId(id);
  } else {
    addDeletedSongId(id);
  }

  // 1. Remove from active song list
  const updated = current.filter(s => s.id !== id);
  const cleanUpdated = deduplicateSongs(updated);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanUpdated));
  } catch (e) {
    console.error('Failed to save after deletion:', e);
  }
  return cleanUpdated;
};

// Restore default songs without wiping custom user songs
export const restoreDefaultSongs = (): Song[] => {
  const diskSongs = loadDiskSongs();
  const currentSongs = getStoredSongs();

  // Deduplicate and combine
  const restored = deduplicateSongs([...currentSongs, ...diskSongs.filter(s => s.id !== 'lumina-hare' && s.id !== 'gen-hoshino-toki-yo')]);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
  } catch (e) {
    console.error('Failed to save restored defaults:', e);
  }
  return restored;
};

// Complete reset (all existing songs backed up to trash first, resets to only Emerald)
export const resetSongsToDefault = (): Song[] => {
  const currentSongs = getStoredSongs();
  currentSongs.forEach(backupToTrash);

  const defaultBuiltins = loadBuiltinSongs(); // [emeraldSong]
  try {
    localStorage.removeItem(DELETED_STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBuiltins));
  } catch (e) {
    console.error('Failed to reset localStorage:', e);
  }
  return defaultBuiltins;
};
