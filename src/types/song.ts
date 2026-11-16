export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiDetail {
  character: string;
  korean: string; // 한국어 음훈 (예: "가라앉을 침")
  kun: string[];  // 훈독 (예: ["しず.む"])
  on: string[];   // 음독 (예: ["チン"])
  meaning: string;// 한자 의미
  jlptLevel?: string; // N1 ~ N5
  examples: KanjiExample[];
}

export interface LyricLine {
  id: number;
  start: number; // 시작 초 (예: 12.5)
  end: number;   // 종료 초 (예: 16.2)
  rubyText: string; // 인라인 루비 문법: "沈[しず]むように溶[と]けてゆくように"
  translation: string; // 한국어 번역
  romaji?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: number; // 전체 길이(초)
  endTime?: number;
  lyrics: LyricLine[];
  kanjiDictionary: Record<string, KanjiDetail>;
}
