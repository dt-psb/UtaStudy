import type { KanjiDetail } from '../types/song';

// Common Master Kanji Knowledge Base for Fallback
export const masterKanjiDictionary: Record<string, KanjiDetail> = {
  // Frequently used kanji in J-POP lyrics
  '愛': { character: '愛', korean: '사랑 애', kun: ['いと.しい', 'かな.しい'], on: ['アイ'], meaning: '사랑하다, 아끼다', jlptLevel: 'N3', examples: [{ word: '愛情', reading: 'あいじょう', meaning: '애정' }, { word: '恋愛', reading: 'れんあい', meaning: '연애' }] },
  '心': { character: '心', korean: '마음 심', kun: ['こころ'], on: ['シン'], meaning: '마음, 심장, 중심', jlptLevel: 'N4', examples: [{ word: '安心', reading: 'あんしん', meaning: '안심' }, { word: '中心', reading: 'ちゅうしん', meaning: '중심' }] },
  '夢': { character: '夢', korean: '꿈 몽', kun: ['ゆめ'], on: ['ム'], meaning: '꿈, 희망', jlptLevel: 'N3', examples: [{ word: '夢中', reading: 'むちゅう', meaning: '열중' }, { word: '悪夢', reading: 'あくむ', meaning: '악몽' }] },
  '時': { character: '時', korean: '때 시', kun: ['とき'], on: ['ジ'], meaning: '때, 시간', jlptLevel: 'N5', examples: [{ word: '時間', reading: 'じかん', meaning: '시간' }, { word: '時計', reading: 'とけい', meaning: '시계' }] },
  '夜': { character: '夜', korean: '밤 야', kun: ['よ', 'よる'], on: ['ヤ'], meaning: '밤, 어두운 때', jlptLevel: 'N5', examples: [{ word: '今夜', reading: 'こんや', meaning: '오늘 밤' }, { word: '深夜', reading: 'しんや', meaning: '심야' }] },
  '空': { character: '空', korean: '하늘 공 / 빌 공', kun: ['そら', 'から', 'あ.く'], on: ['クウ'], meaning: '하늘, 비어 있음', jlptLevel: 'N5', examples: [{ word: '青空', reading: 'あおぞら', meaning: '푸른 하늘' }, { word: '空気', reading: 'くうき', meaning: '공기' }] },
  '人': { character: '人', korean: '사람 인', kun: ['ひと'], on: ['ジン', 'ニン'], meaning: '사람, 인간', jlptLevel: 'N5', examples: [{ word: '人間', reading: 'にんげん', meaning: '인간' }, { word: '恋人', reading: 'こいびと', meaning: '연인' }] },
  '僕': { character: '僕', korean: '나 복 / 종 복', kun: ['しもべ'], on: ['ボク'], meaning: '나 (남성 1인칭), 하인', jlptLevel: 'N4', examples: [{ word: '僕たち', reading: 'ぼくたち', meaning: '우리들' }] },
  '君': { character: '君', korean: '임금 군 / 그대 군', kun: ['きみ'], on: ['クン'], meaning: '너, 그대, 임금', jlptLevel: 'N4', examples: [{ word: '君たち', reading: 'きみたち', meaning: '너희들' }] },
  '私': { character: '私', korean: '사사 사 / 나 사', kun: ['わたし', 'わたくし'], on: ['シ'], meaning: '나, 저 (1인칭)', jlptLevel: 'N5', examples: [{ word: '私立', reading: 'しりつ', meaning: '사립' }] },
  '言': { character: '言', korean: '말씀 언', kun: ['い.う', 'こと'], on: ['ゲン', 'ゴン'], meaning: '말하다, 말씀', jlptLevel: 'N5', examples: [{ word: '言葉', reading: 'ことば', meaning: '말, 언어' }] },
  '思': { character: '思', korean: '생각 사', kun: ['おも.う'], on: ['シ'], meaning: '생각하다', jlptLevel: 'N4', examples: [{ word: '思い出', reading: 'おもいで', meaning: '추억' }] },
  '見': { character: '見', korean: '볼 견', kun: ['み.る', 'み.える'], on: ['ケン'], meaning: '보다, 보이다', jlptLevel: 'N5', examples: [{ word: '意見', reading: 'いけん', meaning: '의견' }] },
  '聞': { character: '聞', korean: '들을 문', kun: ['き.く', 'き.こえる'], on: ['ブン', 'モン'], meaning: '듣다, 들리다', jlptLevel: 'N5', examples: [{ word: '新聞', reading: 'しんぶん', meaning: '신문' }] },
  '歌': { character: '歌', korean: '노래 가', kun: ['うた', 'うた.う'], on: ['カ'], meaning: '노래, 노래하다', jlptLevel: 'N5', examples: [{ word: '歌手', reading: 'かしゅ', meaning: '가수' }] },
  '声': { character: '声', korean: '소리 성', kun: ['こえ'], on: ['セイ', 'ショウ'], meaning: '소리, 목소리', jlptLevel: 'N4', examples: [{ word: '大声', reading: 'おおごえ', meaning: '큰 소리' }] },
  '手': { character: '手', korean: '손 수', kun: ['て'], on: ['シュ'], meaning: '손, 방법', jlptLevel: 'N5', examples: [{ word: '手紙', reading: 'てがみ', meaning: '편지' }] },
  '目': { character: '目', korean: '눈 목', kun: ['め'], on: ['モク'], meaning: '눈, 안목', jlptLevel: 'N5', examples: [{ word: '目的', reading: 'もくてき', meaning: '목적' }] },
  '道': { character: '道', korean: '길 도', kun: ['みち'], on: ['ドウ'], meaning: '길, 도리', jlptLevel: 'N5', examples: [{ word: '道路', reading: 'どうろ', meaning: '도로' }] },
  '日': { character: '日', korean: '날 일', kun: ['ひ', 'か'], on: ['ニチ', 'ジツ'], meaning: '해, 날, 낮', jlptLevel: 'N5', examples: [{ word: '毎日', reading: 'まいにち', meaning: '매일' }] },
  '月': { character: '月', korean: '달 월', kun: ['つき'], on: ['ゲツ', 'ガツ'], meaning: '달, 월, 한 달', jlptLevel: 'N5', examples: [{ word: '今月', reading: 'こんげつ', meaning: '이번 달' }] },
  '火': { character: '火', korean: '불 화', kun: ['ひ'], on: ['カ'], meaning: '불, 화요일', jlptLevel: 'N5', examples: [{ word: '火曜日', reading: 'かようび', meaning: '화요일' }] },
  '水': { character: '水', korean: '물 수', kun: ['みず'], on: ['スイ'], meaning: '물, 액체', jlptLevel: 'N5', examples: [{ word: '水泳', reading: 'すいえい', meaning: '수영' }] },
  '木': { character: '木', korean: '나무 목', kun: ['き'], on: ['モク', 'ボク'], meaning: '나무, 목요일', jlptLevel: 'N5', examples: [{ word: '木曜日', reading: 'もくようび', meaning: '목요일' }] },
  '金': { character: '金', korean: '쇠 금', kun: ['かね'], on: ['キン'], meaning: '돈, 쇠, 금요일', jlptLevel: 'N5', examples: [{ word: 'お金', reading: 'おかね', meaning: '돈' }] },
  '土': { character: '土', korean: '흙 토', kun: ['つち'], on: ['ト', 'ド'], meaning: '흙, 땅, 토요일', jlptLevel: 'N5', examples: [{ word: '土地', reading: 'とち', meaning: '토지' }] },
  '花': { character: '花', korean: '꽃 화', kun: ['はな'], on: ['カ'], meaning: '꽃, 화초', jlptLevel: 'N4', examples: [{ word: '花火', reading: 'はなび', meaning: '불꽃놀이' }] },
  '雨': { character: '雨', korean: '비 우', kun: ['あめ'], on: ['ウ'], meaning: '비, 강우', jlptLevel: 'N5', examples: [{ word: '雨水', reading: 'あまみず', meaning: '빗물' }] },
  '光': { character: '光', korean: '빛 광', kun: ['ひかり', 'ひか.る'], on: ['コウ'], meaning: '빛, 광선', jlptLevel: 'N3', examples: [{ word: '日光', reading: 'にっこう', meaning: '일광' }] },
  '影': { character: '影', korean: '그림자 영', kun: ['かげ'], on: ['エイ'], meaning: '그림자, 환영', jlptLevel: 'N2', examples: [{ word: '影響', reading: 'えいきょう', meaning: '영향' }] },
  '々': { character: '々', korean: '되풀이표 노마', kun: ['くりかえし', 'のま'], on: [], meaning: '한자 반복 기호 (앞 한자를 거듭 쓸 때 사용)', jlptLevel: 'N3', examples: [{ word: '虎視眈々', reading: 'こしたんたん', meaning: '호시탐탐' }, { word: '日々', reading: 'ひび', meaning: '나날, 매일' }] }
};

export const getKanjiWithFallback = (
  char: string,
  songDict?: Record<string, KanjiDetail>
): KanjiDetail => {
  // 1. Try song dictionary
  if (songDict && songDict[char] && songDict[char].meaning) {
    return songDict[char];
  }

  // 2. Try master fallback dictionary
  if (masterKanjiDictionary[char]) {
    return masterKanjiDictionary[char];
  }

  // 3. Fallback for undefined kanji
  return {
    character: char,
    korean: `${char} (상세 정보 확인 가능)`,
    kun: [],
    on: [],
    meaning: '상세 뜻과 예문은 아래 네이버 사전에서 즉시 확인하실 수 있습니다.',
    examples: []
  };
};
