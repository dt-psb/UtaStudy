import type { Song } from '../types/song';

const STORAGE_KEY = 'utastudy_songs_v10';
const TRASH_STORAGE_KEY = 'utastudy_trash_songs_v1';

// Minimal safe fallback song in case all files in src/data/songs/ are removed
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

// Dynamically discover all song files in src/data/songs/ without hardcoded static imports
// Even if the user deletes, renames, or moves files out of the folder, NO compile errors occur!
export const loadBuiltinSongs = (): Song[] => {
  try {
    const modules = import.meta.glob('../data/songs/*.ts', { eager: true });
    const discovered: Song[] = [];

    for (const [, mod] of Object.entries(modules)) {
      const exported = mod as any;
      // Find any Song object exported from the file
      for (const val of Object.values(exported)) {
        if (val && typeof val === 'object' && ('lyrics' in (val as any) || 'youtubeId' in (val as any))) {
          discovered.push(sanitizeSong(val));
        }
      }
    }

    if (discovered.length > 0) {
      return discovered;
    }
  } catch (err) {
    console.warn('Failed to load dynamic song modules, using fallback:', err);
  }

  return [FALLBACK_EMERALD_SONG];
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
      // In production or offline, fail gracefully without blocking
      console.warn('Disk trash backup skipped:', err);
    });
  } catch {}
};

export const getStoredSongs = (): Song[] => {
  const currentBuiltins = loadBuiltinSongs();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return currentBuiltins;
    const stored: any[] = JSON.parse(raw);
    
    // Sanitize all stored songs
    const sanitized = stored
      .filter(s => s && typeof s === 'object')
      .map(sanitizeSong)
      .filter(s => 
        !s.id.toLowerCase().includes('yoasobi') && 
        !s.id.toLowerCase().includes('gunjo') && 
        !s.id.toLowerCase().includes('yoru')
      );

    // Merge built-in songs with user saved songs
    const songMap = new Map<string, Song>();
    currentBuiltins.forEach(s => songMap.set(s.id, s));
    sanitized.forEach(s => songMap.set(s.id, s));
    
    const result = Array.from(songMap.values());
    return result.length > 0 ? result : currentBuiltins;
  } catch (err) {
    console.error('Failed to load songs from localStorage:', err);
    return currentBuiltins;
  }
};

export const saveCustomSong = (newSong: Song): Song[] => {
  const sanitized = sanitizeSong(newSong);
  const currentSongs = getStoredSongs();
  const existsIndex = currentSongs.findIndex(s => s.id === sanitized.id);
  
  let updated: Song[];
  if (existsIndex >= 0) {
    updated = [...currentSongs];
    updated[existsIndex] = sanitized;
  } else {
    updated = [sanitized, ...currentSongs];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return updated;
};

// Safe delete with automatic backup to 'trash/' folder & localStorage trash
export const deleteSongById = (id: string): Song[] => {
  const current = getStoredSongs();
  const targetSong = current.find(s => s.id === id);
  if (targetSong) {
    backupToTrash(targetSong);
  }

  const updated = current.filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save after deletion:', e);
  }
  return updated;
};

// Restore default songs without wiping custom user songs
export const restoreDefaultSongs = (): Song[] => {
  const currentBuiltins = loadBuiltinSongs();
  const currentSongs = getStoredSongs();

  const songMap = new Map<string, Song>();
  currentSongs.forEach(s => songMap.set(s.id, s));
  currentBuiltins.forEach(s => songMap.set(s.id, s));

  const restored = Array.from(songMap.values());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
  } catch (e) {
    console.error('Failed to save restored defaults:', e);
  }
  return restored;
};

// Complete reset (all existing songs backed up to trash first!)
export const resetSongsToDefault = (): Song[] => {
  const currentSongs = getStoredSongs();
  // Backup all songs to trash before reset so nothing is lost permanently!
  currentSongs.forEach(backupToTrash);

  const currentBuiltins = loadBuiltinSongs();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBuiltins));
  } catch (e) {
    console.error('Failed to reset localStorage:', e);
  }
  return currentBuiltins;
};

