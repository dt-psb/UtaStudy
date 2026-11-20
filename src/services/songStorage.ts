import type { Song } from '../types/song';
import { emeraldSong } from '../data/songs/emerald';

const STORAGE_KEY = 'utastudy_songs_v31';
const TRASH_STORAGE_KEY = 'utastudy_trash_songs_v1';
const DELETED_STORAGE_KEY = 'utastudy_deleted_song_ids_v1';

// Known video IDs of songs deleted per user request
const DELETED_VIDS = new Set([
  '5l8VZEyNRH8', // LEMON MELON COOKIE
  'D5s8U3IDfwI', // ババロア
  '8Cm-7oCq9HA', // PPPP
  'Kv5-7kTp9m8', // 夜のうた
  'uRjI2ve5v2A', // 了冫/ヽ″廾勺″ー
  'I0CBrq1hpIg', // ボカロPには手を出すな！
  'pIuQ_us5W4Y', // MTMTM
  'ksdvNgqOToQ', // どっちにするの？
  '4LrRm2Kv0So', // リトライ！
  'dgNceSpd424'  // 거짓, 음률, 세상
]);

// Deleted song title markers
const DELETED_TITLE_SUBSTRINGS = [
  'LEMON MELON COOKIE',
  'ババロア',
  'PPPP',
  '夜のうた',
  '了冫/ヽ″廾',
  'ボカロPには手を出すな',
  'MTMTM',
  'どっちにするの',
  'リトライ！',
  '거짓, 음률'
];

export const isDeletedSong = (s: { id?: string; youtubeId?: string; title?: string } | null | undefined): boolean => {
  if (!s) return true;
  const deletedIds = getDeletedSongIds();
  if (s.id && deletedIds.has(s.id)) return true;
  const yId = (s.youtubeId || '').trim();
  if (yId && (deletedIds.has(yId) || DELETED_VIDS.has(yId))) return true;
  if (s.title) {
    for (const sub of DELETED_TITLE_SUBSTRINGS) {
      if (s.title.includes(sub)) return true;
    }
  }
  return false;
};

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
  let youtubeId = typeof raw.youtubeId === 'string' && raw.youtubeId.trim()
    ? raw.youtubeId.trim()
    : (typeof raw.youtube_id === 'string' ? raw.youtube_id.trim() : '');
  if (!youtubeId && typeof raw.youtubeUrl === 'string') {
    const m = raw.youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (m) youtubeId = m[1];
  }
  if (!youtubeId) youtubeId = 'kM8HEzBGU-0';

  const lyrics = Array.isArray(raw.lyrics)
    ? raw.lyrics.map((l: any, idx: number) => {
        const start = typeof l.start === 'number'
          ? l.start
          : (typeof l.startTime === 'number'
            ? l.startTime
            : (typeof l.time === 'number'
              ? l.time
              : (Number(l.start ?? l.startTime ?? l.time) || 0)));
        const end = typeof l.end === 'number' ? l.end : (typeof l.endTime === 'number' ? l.endTime : (Number(l.end ?? l.endTime) || start + 4));
        const rubyText = typeof l.rubyText === 'string' ? l.rubyText : (typeof l.ruby === 'string' ? l.ruby : (typeof l.ruby_text === 'string' ? l.ruby_text : (l.text || '')));
        const translation = typeof l.translation === 'string' ? l.translation : (l.korean || '');
        return {
          id: typeof l.id === 'number' ? l.id : idx + 1,
          start,
          end,
          rubyText,
          translation,
          romaji: typeof l.romaji === 'string' ? l.romaji : undefined
        };
      })
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

  // Explicitly deleted 10 flawed / Korean songs
  const toDelete = [
    '01-tak-doridori-tak-lemon-melon-cookie', '5l8VZEyNRH8',
    '11-tak-doridori-tak-babaroa-bavaroa-hatsune', 'D5s8U3IDfwI',
    '12-tak-doridori-tak-pppp-hatsune-miku', '8Cm-7oCq9HA',
    '13-kikuo-kikuo-yoru-nouta', 'Kv5-7kTp9m8',
    '16-dada-ryou-hyou-kyou-shaku', 'uRjI2ve5v2A',
    '18-chenomio-chenomio-bokaro-p-niha', 'I0CBrq1hpIg',
    '24-tak-doridori-tak-mtmtm-hatsune-miku', 'pIuQ_us5W4Y',
    '25-hiroki-dotchinisuruno-hatsune-miku-juuon', 'ksdvNgqOToQ',
    '26-hiroki-ritorai-hatsune-miku-juuon', '4LrRm2Kv0So',
    '49-wyvernp-sv', 'dgNceSpd424'
  ];
  toDelete.forEach(id => set.add(id));
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
          const sanitized = sanitizeSong(val);
          if (!isDeletedSong(sanitized)) {
            discovered.push(sanitized);
          }
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
  // Purge any stale legacy storage keys
  try {
    ['utastudy_songs_v28', 'utastudy_songs_v29', 'utastudy_songs_v30'].forEach(k => localStorage.removeItem(k));
  } catch {}

  const diskSongs = loadDiskSongs().filter(s => !isDeletedSong(s));

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: initialize with all available non-deleted disk songs
      const initial = deduplicateSongs(diskSongs);
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
            .filter(s => !isDeletedSong(s))
        )
      : [];

    // Build map of latest non-deleted disk songs to ensure disk updates always reflect in storage
    const diskSongMap = new Map<string, Song>();
    for (const dSong of diskSongs) {
      if (!isDeletedSong(dSong)) {
        diskSongMap.set(dSong.id, dSong);
        const yId = (dSong.youtubeId || '').trim();
        if (yId) diskSongMap.set(yId, dSong);
      }
    }

    // Update matching stored songs with latest disk data, while preserving custom user songs & ordering
    const updatedStored = currentStored.map(s => {
      const fromDisk = diskSongMap.get(s.id) || (s.youtubeId ? diskSongMap.get(s.youtubeId.trim()) : undefined);
      return fromDisk ? fromDisk : s;
    }).filter(s => !isDeletedSong(s));

    const existingIds = new Set<string>(updatedStored.map(s => s.id));
    const existingYtIds = new Set<string>(
      updatedStored.map(s => (s.youtubeId || '').trim()).filter(Boolean)
    );

    // Find new songs on disk that the user hasn't seen/stored yet and hasn't deleted!
    const newlyAddedSongs: Song[] = [];
    for (const dSong of diskSongs) {
      if (isDeletedSong(dSong)) continue;
      const yId = (dSong.youtubeId || '').trim();
      if (existingIds.has(dSong.id) || (yId && existingYtIds.has(yId))) {
        continue;
      }
      newlyAddedSongs.push(dSong);
      existingIds.add(dSong.id);
      if (yId) existingYtIds.add(yId);
    }

    // Prepend newly added songs to the top of the playlist so they are immediately accessible!
    const merged = deduplicateSongs([...newlyAddedSongs, ...updatedStored].filter(s => !isDeletedSong(s)));

    // Save back deduplicated clean array to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}

    return merged.length > 0 ? merged : [sanitizeSong(emeraldSong)];
  } catch (err) {
    console.error('Failed to load songs from localStorage:', err);
    return deduplicateSongs(diskSongs.filter(s => !isDeletedSong(s)));
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
