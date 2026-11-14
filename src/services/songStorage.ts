import type { Song } from '../types/song';
import { emeraldSong } from '../data/songs/emerald';
import { gambleShotSong } from '../data/songs/gamble_shot';

const STORAGE_KEY = 'utastudy_songs_v7';

export const initialSongs: Song[] = [
  emeraldSong,
  gambleShotSong
];

export const getStoredSongs = (): Song[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialSongs;
    const customSongs: Song[] = JSON.parse(raw);
    
    // Remove any legacy yoasobi songs completely from stored list as requested
    const filtered = customSongs.filter(s => 
      !s.id.toLowerCase().includes('yoasobi') && 
      !s.id.toLowerCase().includes('gunjo') && 
      !s.id.toLowerCase().includes('yoru')
    );
    
    // Merge built-in songs with user saved songs
    const songMap = new Map<string, Song>();
    initialSongs.forEach(s => songMap.set(s.id, s));
    filtered.forEach(s => songMap.set(s.id, s));
    
    const result = Array.from(songMap.values());
    return result.length > 0 ? result : initialSongs;
  } catch (err) {
    console.error('Failed to load songs from localStorage:', err);
    return initialSongs;
  }
};

export const saveCustomSong = (newSong: Song): Song[] => {
  const currentSongs = getStoredSongs();
  const existsIndex = currentSongs.findIndex(s => s.id === newSong.id);
  
  let updated: Song[];
  if (existsIndex >= 0) {
    updated = [...currentSongs];
    updated[existsIndex] = newSong;
  } else {
    updated = [newSong, ...currentSongs];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return updated;
};

export const deleteSongById = (id: string): Song[] => {
  const current = getStoredSongs();
  const updated = current.filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save after deletion:', e);
  }
  return updated;
};

export const resetSongsToDefault = (): Song[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSongs));
  } catch (e) {
    console.error('Failed to reset localStorage:', e);
  }
  return initialSongs;
};

