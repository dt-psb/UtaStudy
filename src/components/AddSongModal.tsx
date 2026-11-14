import React, { useState } from 'react';
import type { Song } from '../types/song';
import { X, Copy, Check, FileJson, Sparkles, AlertCircle } from 'lucide-react';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: Song) => void;
}

const AI_PROMPT_TEMPLATE = `당신은 일본어 노래 가사 학습 프로그램 'UtaStudy'의 가사 데이터 변환 전문가입니다.
사용자가 제공하는 [1. 유튜브 자막 스크립트(시간 정보)], [2. 일본어 원문 가사], [3. 한국어 번역(선택)]을 분석하여 완벽한 싱크와 무결점 한자 사전이 포함된 JSON 데이터를 생성하세요.

### 📌 필수 변환 규칙 (엄격 준수):

1. **⏱️ 타임스탬프 추출 & 1:1 매핑**:
   - 유튜브 자막(또는 yt-dlp 추출 자막)의 언어(영어, 일본어, 자동생성 등)는 무관합니다.
   - **오직 각 소절의 '시작 시간(start)'과 '종료 시간(end)'**을 파싱하여 초 단위(소수점 둘째자리) 숫자로 변환하세요.
   - 예: "01:36.50" -> 96.50, "02:04.10" -> 124.10
   - 자막 타임라인 순서에 맞추어 [일본어 원문 가사]와 [한국어 번역]을 한 줄씩 1:1로 정밀하게 결합합니다.

2. **🎵 실제 노래 가창 독음(歌唱読み) & 숙자훈 절대 우선 (최우선 원칙)**:
   - 사전의 기계적인 1순위 음독을 달지 말고, **노래에서 가수가 실제로 부르는 발음**을 후리가나로 달아야 합니다!
   - ⚠️ 필수 주의 예시:
     - \`明後日\`는 사전식 'みょうごにち'가 아니라 노래에서 실제로 부르는 **\`あさって\`** -> \`明後日[あさって]\`
     - \`今日の日\`는 'にち'가 아니라 **\`ひ\`** -> \`今日[きょう]の日[ひ]\`
     - \`詩の束\`는 'そく'가 아니라 **\`たば\`** -> \`詩[し]の束[たば]\`
     - \`明日\`는 가창 박자에 맞춰 **\`あした\`** 또는 **\`あす\`**
     - \`昨日[きのう]\`, \`大人[おとな]\`, \`友達[ともだち]\`, \`眼鏡[めがね]\`, \`二人[ふたり]\`, \`一人[ひとり]\` 등 숙자훈 독음 필수 준수
     - J-POP 특유의 아테지(当て字): 가사에 \`地球\`라 적혀 있어도 '호시'라고 부르면 반드시 **\`地球[ほし]\`**, \`運命\`를 '사다메'로 부르면 **\`運命[さだめ]\`**로 표기!

3. **🎯 루비 문자(후리가나) 정밀 태깅 (글자 위치 어긋남 방지)**:
   - 반드시 **오직 한자 블록 바로 뒤에만** \`[후리가나]\`를 부착하세요!
   - ❌ 잘못된 예: \`きっと今日[きょう]\` (앞의 히라가나 'きっと'까지 루비에 포함되면 위치가 어긋납니다)
   - ✅ 올바른 예: \`きっと今日[きょう]\`
   - ❌ 잘못된 예: \`消えゆく[きえゆく]\` (오쿠리가나 'えゆく'까지 괄호에 넣지 마세요)
   - ✅ 올바른 예: \`消[き]えゆく\`
   - ❌ 잘못된 예: \`拡声器だったよ[かくせいきだったよ]\`
   - ✅ 올바른 예: \`拡声器[かくせいき]だったよ\`
   - 순수 히라가나/가타카나/영문 단어에는 대괄호를 붙이지 않습니다.

4. **📚 가사 내 모든 한자 전수 사전화 (kanjiDictionary 누락 0%)**:
   - 가사에 등장하는 모든 한자는 단 1글자도 빠짐없이 "kanjiDictionary"에 등록해야 합니다 (누락 시 빈 카드가 발생합니다).
   - 각 한자별 필수 필드:
     - \`character\`: 한자 1글자
     - \`korean\`: 한국어 훈음 (예: "가슴 흉", "뛸 도", "비로소 시", "변할 변", "그릇 기")
     - \`kun\`: 일본어 훈독 배열 (예: ["むね", "むな"], ["は.ねる", "と.ぶ"])
     - \`on\`: 일본어 음독 배열 (예: ["キョウ"], ["チョウ"])
     - \`meaning\`: 명확하고 친절한 의미 설명 (예: "가슴, 마음속", "뛰어오르다, 튀다")
     - \`jlptLevel\`: "N1" ~ "N5" (알 수 없을 경우 생략 가능)
     - \`examples\`: 대표 활용 단어 2개 (반드시 \`word\`, \`reading\`, \`meaning\` 포함)

5. **출력 형식**:
   - 마크다운 인사말이나 부가 설명 없이 **오직 유효한 순수 JSON 코드**만 출력하세요.

### 📋 JSON 출력 템플릿:
{
  "id": "song-identifier (영문소문자-하이픈)",
  "title": "노래 제목",
  "artist": "가수/아티스트명",
  "youtubeId": "유튜브 11자리 비디오 ID",
  "lyrics": [
    {
      "id": 1,
      "start": 188.66,
      "end": 194.69,
      "rubyText": "きっと今日[きょう]の日[ひ]も、明日[あした]も、明後日[あさって]も",
      "translation": "분명 오늘도, 내일도, 모레도"
    }
  ],
  "kanjiDictionary": {
    "明": {
      "character": "明",
      "korean": "밝을 명",
      "kun": ["あか.るい", "あ.ける"],
      "on": ["メイ", "ミョウ"],
      "meaning": "밝다, 환하다, 밝히다",
      "jlptLevel": "N4",
      "examples": [
        { "word": "明日", "reading": "あした", "meaning": "내일" },
        { "word": "明後日", "reading": "あさって", "meaning": "모레" }
      ]
    }
  }
}`;

const SAMPLE_JSON_TEMPLATE = `{
  "id": "sample-song-custom",
  "title": "Lemon (레몬)",
  "artist": "요네즈 켄시 (米津玄師)",
  "youtubeId": "SX_ViT4Ra7k",
  "lyrics": [
    {
      "id": 1,
      "start": 16.5,
      "end": 21.0,
      "rubyText": "夢[ゆめ]ならばどれほどよかったでしょう",
      "translation": "꿈이었다면 얼마나 좋았을까요"
    },
    {
      "id": 2,
      "start": 21.5,
      "end": 26.5,
      "rubyText": "未[いま]だにあなたのことを夢[ゆめ]にみる",
      "translation": "지금도 당신을 꿈에서 봅니다"
    },
    {
      "id": 3,
      "start": 27.0,
      "end": 33.0,
      "rubyText": "忘[わす]れた物[もの]を取[と]りに帰[かえ]るように",
      "translation": "잊어버린 물건을 찾으러 돌아가듯이"
    },
    {
      "id": 4,
      "start": 33.0,
      "end": 39.5,
      "rubyText": "古[ふる]びた思[おも]い出[で]の埃[ほこり]を払[はら]う",
      "translation": "오래된 추억의 먼지를 털어내요"
    }
  ],
  "kanjiDictionary": {
    "夢": {
      "character": "夢",
      "korean": "꿈 몽",
      "kun": ["ゆめ"],
      "on": ["ム"],
      "meaning": "잠자는 동안 꾸는 꿈, 희망",
      "jlptLevel": "N3",
      "examples": [
        { "word": "悪夢", "reading": "あくむ", "meaning": "악몽" },
        { "word": "夢中", "reading": "むちゅう", "meaning": "열중함, 푹 빠짐" }
      ]
    },
    "埃": {
      "character": "埃",
      "korean": "티끌 애",
      "kun": ["ほこり"],
      "on": ["アイ"],
      "meaning": "먼지, 티끌",
      "jlptLevel": "N1",
      "examples": [
        { "word": "砂埃", "reading": "すなぼこり", "meaning": "흙먼지" }
      ]
    }
  }
}`;

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  onAddSong
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Fallback
      alert('클립보드 복사 권한이 없습니다. 직접 텍스트를 복사해 주세요.');
    }
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE_JSON_TEMPLATE);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!jsonInput.trim()) {
      setErrorMsg('JSON 텍스트를 입력해 주세요.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      // Support snake_case or camelCase keys from various AI outputs
      const song: Song = {
        id: parsed.id || `custom-${Date.now()}`,
        title: parsed.title || '제목 없음',
        artist: parsed.artist || '알 수 없음',
        youtubeId: parsed.youtubeId || parsed.youtube_id || '',
        thumbnail: parsed.thumbnail || (parsed.youtubeId || parsed.youtube_id ? `https://img.youtube.com/vi/${parsed.youtubeId || parsed.youtube_id}/hqdefault.jpg` : undefined),
        lyrics: (parsed.lyrics || []).map((l: any, i: number) => ({
          id: l.id || i + 1,
          start: Number(l.start) || 0,
          end: Number(l.end) || (Number(l.start) + 4),
          rubyText: l.rubyText || l.ruby_text || l.text || '',
          translation: l.translation || l.korean || '',
          romaji: l.romaji
        })),
        kanjiDictionary: {}
      };

      // Normalize kanji dictionary
      const rawDict = parsed.kanjiDictionary || parsed.kanji_dictionary || {};
      for (const [char, detail] of Object.entries(rawDict)) {
        const d = detail as any;
        song.kanjiDictionary[char] = {
          character: d.character || char,
          korean: d.korean || `${char} (한국어 음훈)`,
          kun: Array.isArray(d.kun) ? d.kun : (d.kun ? [d.kun] : []),
          on: Array.isArray(d.on) ? d.on : (d.on ? [d.on] : []),
          meaning: d.meaning || '',
          jlptLevel: d.jlptLevel || d.jlpt_level,
          examples: Array.isArray(d.examples) ? d.examples : []
        };
      }

      if (!song.youtubeId) {
        setErrorMsg('"youtubeId" (또는 "youtube_id") 필드가 비어있습니다. 유튜브 11자리 비디오 ID를 입력해 주세요.');
        return;
      }

      if (song.lyrics.length === 0) {
        setErrorMsg('"lyrics" 목록이 비어있습니다. 최소 1개 이상의 가사 타임라인이 필요합니다.');
        return;
      }

      onAddSong(song);
      setJsonInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(`JSON 파싱 오류: ${err.message}. 형식이 유효한 JSON인지 확인해 주세요.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <FileJson className="w-5 h-5 text-indigo-200" />
            <span>새 노래 JSON 추가 (AI 데이터 임포트)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* AI Prompt Guide Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI(ChatGPT / Claude / Gemini) 전용 프롬프트</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-950"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>프롬프트 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>프롬프트 복사</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              위 버튼으로 프롬프트를 복사하여 AI에게 전달하고, 추가하고 싶은 노래의 <b>유튜브 링크와 가사</b>를 함께 넘겨주세요. 생성된 JSON을 아래 입력창에 붙여넣으면 즉시 새 노래가 등록됩니다.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label htmlFor="json-textarea" className="font-semibold text-slate-200">
                곡 데이터 (JSON):
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                예시 템플릿(Lemon) 불러오기
              </button>
            </div>

            <textarea
              id="json-textarea"
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="AI가 생성한 JSON 코드를 여기에 붙여넣으세요..."
              className="w-full p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />

            {errorMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.02]"
              >
                보관함에 저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
