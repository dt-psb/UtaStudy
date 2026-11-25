# 📖 [일본어 자막 전용 트랙] 다른 세션 인수인계 및 작업 가이드 (Handover Guide)

> **⚠️ 세션 분담 및 작업 원칙**
> - **담당 대상**: `references/youtube_with_subtitles.xlsx`의 **`[2. 일본어만 (64곡)]`** 시트 대상 곡만 작업합니다.
> - **타 세션 절대 침범 금지**: `[1. 일어+한국어 (52곡)]` 시트 및 기타 언어 트랙(`docs/PROGRESS_KOREAN_ONLY.md`, `docs/PROGRESS_OTHER_LANG_SONGS.md`)은 타 세션이 작업하므로 **절대 파일을 수정하거나 중복 작업하지 마십시오.**
> - **동기화 필수 문서**: 곡 완성 시 `src/data/songs/` 파일 생성뿐만 아니라, [JAPANESE_ONLY_64_TRACKER.md](file:///x:/gamemaking/japanese_song_study/docs/JAPANESE_ONLY_64_TRACKER.md), [SONG_ADD_GUIDE.md](file:///x:/gamemaking/japanese_song_study/docs/SONG_ADD_GUIDE.md), [README.md](file:///x:/gamemaking/japanese_song_study/README.md), [.gitignore](file:///x:/gamemaking/japanese_song_study/.gitignore)에 즉시 반영해야 합니다.

---

## 1. 현재 작업 진행 현황 (Progress Overview)

- **총 대상 곡수**: 64곡
- **완료된 곡수**: **63곡 (100.0% - 전곡 완료!)**
- **스킵/제외된 곡**: **1곡** (14번: `集光 / 初音ミク` - 연주곡/학습 부적합으로 사용자 요청에 의해 제외)
- **남은 곡수**: **0곡 (🎉 64곡 전곡 작업 완수 완료!)**
- **최종 작업 완료 곡**: **64번 곡: `dezzy(一億円P) - エバーグリーン feat.IA` (`zGVxMbny1Dw`)**

---

## 2. 가장 중요한 사용자 피드백 및 번역 규칙 (Critical Rules)

> [!IMPORTANT]
> **한국어 번역 가사 처리 원칙**:
> 1. **사용자가 채팅창에 가사/번역을 제공한 경우**:
>    - 사용자가 준 한국어 번역을 **100% 최우선**으로 적용합니다. (자막 싱크와 1:1 매핑)
>    - 사용자가 3줄 세트(일본어 / 발음 / 한국어 번역)로 제공하는 경우가 많으므로 3번째 줄을 `translation`에 매핑합니다.
> 2. **사용자가 가사를 주지 않고 '진행'만 요청한 경우**:
>    - 임의로 AI 번역을 일방적으로 끝내지 말고, **"해당 곡의 가사/번역을 제공해주시겠습니까, 아니면 AI 자체 정밀 번역으로 진행할까요?"**라고 먼저 사용자에게 확인을 받거나, 사용자가 가사를 올릴 수 있도록 유도합니다.

---

## 3. 표준 작업 절차 (Step-by-Step SOP)

### Step 1. 공식 자막 다운로드
`yt-dlp`를 사용하여 유튜브에서 일본어 공식 자막(`.ja.vtt`)을 다운로드합니다:
```powershell
yt-dlp --write-subs --sub-lang "ja" --skip-download -o "scratch/<song_id>.%(ext)s" "https://youtube.com/watch?v=<youtube_id>"
```

### Step 2. 자막 파싱 및 전처리 (주의사항 필수 숙지)
파이썬 스크립트(`scratch/parse_<song_id>.py`)를 작성하여 VTT 큐를 파싱합니다.
1. **타임스탬프 변환 (필수)**:
   - VTT의 `00:00:15.972` 문자열을 반드시 **초 단위 부동소수점(`15.972`, number)**으로 변환해야 합니다. 문자열로 넣으면 `TS2322` 빌드 에러가 발생합니다.
2. **강희자전 부수 (Kangxi Radicals) 정규화**:
   - 일부 영상(예: SEKAI NO OWARI의 자막)에서 `見`(U+898B) 대신 강희자전 부수 `⾒`(U+2F92), `止` 대신 `⽌`, `雨` 대신 `⾬`, `生` 대신 `⽣` 등이 포함되어 있습니다.
   - `unicodedata.normalize('NFKC', ch)`를 적용하여 표준 CJK 한자로 치환해야 검색 및 폰트가 정상 작동합니다. (단, 문장 전체에 NFKC를 걸면 전각 `？`가 반각 `?`로 바뀌므로 `\u2f00 <= ch <= \u2fdf` 범위만 치환할 것)
3. **HTML 엔티티 변환**:
   - 자막의 `&amp;` 등은 `html.unescape`로 `&`로 복원합니다.
4. **자막 큐 병합/분할 확인**:
   - 가끔 사용자가 제공한 가사가 2줄인데 자막 큐는 1줄로 묶여 있는 경우(예: `，星`의 `ある日ある雨が降ったとさ`), 한국어 번역을 자연스럽게 합쳐서 1개 큐에 매핑합니다.

### Step 3. 루비 텍스트 (`rubyText`) 및 번역 작성
- 문법: `漢字[かんじ]` 인라인 표기
- 한자가 아닌 히라가나/가타카나/영어/특수기호에는 괄호를 달지 않습니다.
- 괄호 열림/닫힘(`[`와 `]`) 개수가 반드시 일치해야 합니다.
- `rubyText`에서 루비 괄호를 제거한 텍스트(`clean_ruby`)가 자막 원문과 100% 일치해야 싱크가 어긋나지 않습니다.

### Step 4. 한자 사전 (Zero-Gap) 100% 전수 등록
1. `rubyText`에 사용된 모든 한자(`[\u4e00-\u9faf\u3400-\u4dbf\u3005]`)를 추출합니다.
2. 기존 등록된 모든 곡(`src/data/songs/*.json`)의 `kanjiDictionary` 풀에서 한자 정보를 가져옵니다.
3. 기존 사전에 없는 신규 한자가 발견되면 스크립트 내 `custom_kanji`에 정의하여 추가합니다:
   ```python
   custom_kanji = {
       "濃": {
           "character": "濃",
           "korean": "짙을 농",
           "kun": ["こ.い"],
           "on": ["ノウ"],
           "meaning": "짙을, 진할",
           "jlptLevel": "N2", # 반드시 문자열 "N1"~"N5" (숫자 0, 1 불허)
           "examples": [
               {"word": "濃度", "reading": "のうど", "meaning": "농도"},
               {"word": "濃厚", "reading": "のうこう", "meaning": "농후, 짙음"}
           ]
       }
   }
   ```
4. **누락 한자 0개 (Zero-Gap)**인지 검증합니다.

### Step 5. JSON 및 TS 파일 동시 생성
- 파일 경로: `src/data/songs/<file_prefix>.json` 및 `src/data/songs/<file_prefix>.ts`
- 규격:
  - `Song` 인터페이스 준수 (`id`, `title`, `artist`, `youtubeId`, `thumbnail`, `lyrics`, `kanjiDictionary`)
  - `thumbnail`: `"https://i.ytimg.com/vi/<youtubeId>/maxresdefault.jpg"`
  - `lyrics`: `[{ id: 1, start: float, end: float, rubyText: str, translation: str }]` (`text` 필드 금지)
  - TS 모듈 상단: `import type { Song } from '../../types/song';`

### Step 6. 무결성 검증 스크립트 실행
`scratch/verify_<song_id>.py`를 작성하여 다음 항목을 전수 검사합니다:
- 큐 개수 일치 여부
- `start <= end` 유효성
- 루비 괄호(`[`, `]`) 매칭
- 번역 누락 여부
- 가사 내 모든 한자가 `kanjiDictionary`에 100% 존재하는지 (Zero-Gap)
- `examples`의 `word`, `reading`, `meaning` 포맷 준수 여부

### Step 7. 저장소 설정 및 문서 4종 업데이트
1. **[.gitignore](file:///x:/gamemaking/japanese_song_study/.gitignore)**:
   - 파일 끝의 곡 예외 목록에 추가:
     ```gitignore
     !src/data/songs/<file_prefix>.ts
     !src/data/songs/<file_prefix>.json
     ```
2. **[JAPANESE_ONLY_64_TRACKER.md](file:///x:/gamemaking/japanese_song_study/docs/JAPANESE_ONLY_64_TRACKER.md)**:
   - 완료 곡수 및 퍼센트 갱신
   - 해당 곡 행 상태를 `✅ 제작 완료 (<구절수>구절/<한자수>자) | <prefix>.json / <prefix>.ts`로 변경
3. **[SONG_ADD_GUIDE.md](file:///x:/gamemaking/japanese_song_study/docs/SONG_ADD_GUIDE.md)**:
   - 본문 곡 목록 테이블 끝에 순번 이어 추가 (예: 175번 ...)
4. **[README.md](file:///x:/gamemaking/japanese_song_study/README.md)**:
   - 곡 목록 테이블에 곡 추가

### Step 8. 빌드 및 린트 검증
```powershell
npm run lint   # oxlint: 0 warnings, 0 errors 확인
npm run build  # tsc -b && vite build: 100% 정상 번들링 확인
```

---

## 4. 스킵 / 제외된 곡 상세 내역

| 번호 | 제목 | YouTube ID | 사유 |
| :---: | :--- | :---: | :--- |
| **14** | **集光 / 初音ミク** (OLDUCT) | `sJt2mcriEqQ` | 가사가 거의 없는 연주 중심 곡으로 일본어 학습에 부적합하여 사용자 요청으로 **영구 제외(Skip)** 처리됨 |

---

## 5. 최종 완료된 마지막 3곡 상세 목록 (#62 ~ #64 - 전곡 완료)

| 순번 | 번호 | 곡명 (Title) | 아티스트 / 채널 | YouTube ID | 링크 | 비고 |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | **62** | **FANTASY★DiSCO NIGHT ft. Miku Hatsune** | SAWTOWNE | `_t3XkHDrH-o` | [유튜브](https://youtube.com/watch?v=_t3XkHDrH-o) | ✅ 제작 완료 (`sawtowne_fantasy_disco_night`) |
| 2 | **63** | **Side Quest King (KISAI remix) feat. 初音ミク【崩壊：スターレイル 3周年テーマソング】** | Hatsune Miku | `WSDSWdIt3jY` | [유튜브](https://youtube.com/watch?v=WSDSWdIt3jY) | ✅ 제작 완료 (`miku_side_quest_king`) |
| 3 | **64** | **dezzy(一億円P)  - エバーグリーン feat.IA** | dezzy(一億円P) | `zGVxMbny1Dw` | [유튜브](https://youtube.com/watch?v=zGVxMbny1Dw) | ✅ 제작 완료 (`dezzy_evergreen`) |

---

## 6. 최근 완료된 5곡 상세 정보 (참고용)

- **57번**: [ラブパラ](file:///x:/gamemaking/japanese_song_study/src/data/songs/deco27_love_para.ts) (`RgVLBtRLX9k`): 52구절 / 57자 (사용자 제공 번역 100% 매핑, 신규 한자 `謙`, `遜` 등록)
- **58번**: [ストリーミングダンサー](file:///x:/gamemaking/japanese_song_study/src/data/songs/kanzaki_streaming_dancer.ts) (`RpsbehcPU3w`): 78구절 / 80자 (공식 자막 기반 정밀 한국어 번역 매핑, 80자 전수 검증 완료)
- **59번**: [吸血鬼](file:///x:/gamemaking/japanese_song_study/src/data/songs/kanzaki_kyuuketsuki.ts) (`jZkDWFzLNxE`): 57구절 / 116자 (사용자 제공 번역 100% 매핑, 116자 전수 검증 완료)
- **60번**: [怪盗ハッチさん](file:///x:/gamemaking/japanese_song_study/src/data/songs/nazoj_kaito_hatchi_san.ts) (`lXWsJEoBHPU`): 88구절 / 177자 (사용자 제공 번역 100% 매핑, 신규 한자 `冠`, `惧`, `核`, `留`, `紀`, `緋`, `賊` 등록)
- **61번**: [一人脳内反省会](file:///x:/gamemaking/japanese_song_study/src/data/songs/majima_yuro_hitori_nounai_hanseikai.ts) (`BH3RXq2MTPM`): 44구절 / 103자 (공식 자막 기반 정밀 한국어 번역 매핑, 103자 전수 검증 완료)
