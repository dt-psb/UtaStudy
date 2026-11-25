# 🤖 UtaStudy 신규 곡 추가 SOP (다른 AI 세션용 인수인계 매뉴얼)

> **목적**: 이 문서는 새로운 AI 세션(또는 개발자)이 **유튜브 URL / 곡명 / 가사**를 전달받았을 때, 자막 다운로드부터 원문 가사·번역 확보, 요미가나(후리가나) 태깅, 한자 사전(Zero-Gap) 구축, 저장소 반영, 무결성 검증 및 빌드까지 **단일 표준 절차**로 완수하도록 작성된 실행 매뉴얼입니다.

---

## 0. 작업 시작 전 필독 원칙

1. **저장소 자동 로드 구조 이해**:
   - `src/services/songStorage.ts`의 `loadDiskSongs()`가 `import.meta.glob('../data/songs/*.ts', { eager: true })`로 `src/data/songs/*.ts` 파일을 자동 탐지합니다.
   - `deduplicateSongs()`가 `id`와 `youtubeId` 기준으로 중복을 제거합니다. 기존 349곡([SONG_ADD_GUIDE.md](./SONG_ADD_GUIDE.md) 참조)과 `youtubeId` 또는 `id`가 겹치지 않게 새 곡 파일명(`slug`)을 정하십시오.
2. **영구 삭제/스킵 곡 목록 준수 (`src/services/songStorage.ts`)**:
   - `DELETED_VIDS` 및 `getDeletedSongIds()`에 등록된 곡(예: `ThOViq2fHqg` *Kikuo - 君が死んでも許してあげるよ*, `lumina-hare`, `gen-hoshino-toki-yo` 등)은 사용자 요청으로 영구 제외/삭제된 곡이므로 다시 추가하지 마십시오.
3. **임시 작업 공간 (`scratch/`) 규칙**:
   - 내려받은 `.vtt`/`.srt` 자막, 파싱/검증용 임시 Python 스크립트는 반드시 `scratch/` 아래에서만 생성·실행하고, **작업 완료 후 `scratch/` 내부 임시 파일을 삭제**하여 저장소 루트가 어지럽혀지지 않게 하십시오.
   - *(참고: `.gitignore`에 `scripts/`, `scratch/`, `*.vtt`, `*.srt`가 포함되어 있으므로 원격 클론 환경에는 로컬 `scripts/`가 없을 수 있습니다. 아래 단계의 명령과 검증 코드를 그대로 사용하십시오.)*
4. **사용자 제공 텍스트 최우선**:
   - 사용자가 채팅에 일본어 가사·발음·한국어 번역(2줄 또는 3줄 세트 등)을 제공한 경우 **100% 최우선으로 사용**하십시오.

---

## Step 1. 유튜브 메타데이터 및 자막 다운로드 (`yt-dlp`)

먼저 영상 정보, 설명란(가사가 본문에 포함된 경우가 많음), 사용 가능한 자막 트랙을 확인합니다.

```powershell
# 1) 영상 ID, 제목, 채널(아티스트), 길이(초) 확인
yt-dlp --print "%(id)s | %(title)s | %(channel)s | %(duration)s" "<유튜브URL>"

# 2) 영상 설명란 전체 확인 (공식 가사·아테지·타임스탬프·크레딧 포함 여부 확인)
yt-dlp --print "%(description)s" "<유튜브URL>"

# 3) 제공되는 자막 트랙 목록 확인 (수동 공식 자막 vs 자동 생성 자막)
yt-dlp --list-subs "<유튜브URL>"
```

### 자막 파일 다운로드 (VTT)

공식(수동) 자막(`--write-sub`)을 먼저 시도하고, 없을 때만 자동 생성 자막(`--write-auto-sub`)을 보조 타임라인 참고용으로 받습니다.

```powershell
# 공식 자막 다운로드 (일본어, 한국어, 영어)
yt-dlp --skip-download --write-sub --sub-langs "ja,ko,en,ja.*,ko.*" -o "scratch/<slug>.%(ext)s" "<유튜브URL>"

# 공식 자막이 전혀 없을 때만 자동생성 자막 확인 (가사 텍스트는 반드시 공식 가사로 교체!)
yt-dlp --skip-download --write-auto-sub --sub-langs "ja,ko,en" -o "scratch/<slug>.%(ext)s" "<유튜브URL>"
```

### 자막 언어 조합별 처리 전략

| 자막 보유 상태 | 타임스탬프(`start`/`end`) 기준 | 일본어 가사 확보 | 한국어 번역(`translation`) 처리 |
| :--- | :--- | :--- | :--- |
| **Case A: 일본어 + 한국어 공식 자막** | `.ja.vtt` 우선 (`.ko.vtt`와 큐 수·시간대 대조) | `.ja.vtt` 기반 + 공식 가사 대조 검증 | `.ko.vtt` 큐를 소절별 1:1 매핑 (분할/병합 일치) |
| **Case B: 일본어 자막만 있음** | `.ja.vtt` | `.ja.vtt` 기반 + 아테지/한자 대조 | ① 사용자 제공 번역 우선 ② 없으면 맥락에 맞는 자연스러운 한국어 번역 작성 *(필요 시 사용자에게 번역 제공 여부 문의)* |
| **Case C: 한국어/영어 자막만 있음** | `.ko.vtt` 또는 `.en.vtt`의 큐 시간만 추출 | **번역 역번역 금지!** Step 2 방법으로 공식 일본어 가사를 별도 확보해 1:1 매핑 | `.ko.vtt`(있을 경우) 또는 사용자 제공 번역 사용 |
| **Case D: 자막이 전혀 없음** | 영상 설명란/고정 댓글 타임스탬프, 또는 사용자 제공 LRC/구간 | Step 2 방법으로 공식 가사 확보 | 자동 타이밍 추측 금지 — 자막·타임코드 소스 확보 후 매핑 |

---

## Step 2. 정확한 원문 가사(및 아테지) 확보 방법

유튜브 자막에는 오탈자, 가타카나 치환, 아테지(표기 한자와 다른 가창음) 누락, 자동자막 오인식이 잦으므로 **반드시 원문 가사를 교차 확인**합니다.

1. **사용자 제공 가사** (가장 우선)
2. **유튜브 영상 설명란 / 고정 댓글 / 아티스트 공식 게시물** (`yt-dlp --print "%(description)s"` 및 `piapro`, `note`, `fanbox` 링크 확인 — 특히 보컬로이드·신곡은 투고자 설명란에 정확한 가사와 루비가 올라와 있음)
3. **웹 검색 교차 검증** (브라우저 또는 웹 검색 도구 활용):
   - 보컬로이드 곡: **初音ミク Wiki (`w.atwiki.jp/hmiku`)**, **Vocaloid Lyrics Wiki (`vocaloidlyrics.fandom.com`)**, **VocaDB (`vocadb.net`)**
   - J-POP / 애니메이션 / 밴드 곡: **Uta-Net (`uta-net.com`)**, **UtaTen (`utaten.com`)**, **Genius (`genius.com`)**, **Lyrical Nonsense (`lyrical-nonsense.com`)**
4. **대조 시 중점 확인 사항**:
   - 1절과 2절 후렴의 미세한 조사/단어 차이
   - 한자 표기인데 가수가 전혀 다른 음으로 부르는 **아테지(当て字)** (예: `地球[ほし]`, `運命[さだめ]`, `現実[リアル]`)
   - UI 줄바꿈에 맞게 1개 소절(`id`)을 1문장~1프레이즈 단위로 정리 (자막이 2큐로 쪼개졌으면 `start=첫큐시작`, `end=둘째큐끝`으로 병합)

---

## Step 3. VTT 파싱·정제 및 `rubyText` 요미가나 규칙

### 3-1. VTT 파싱 및 데이터 정제 필수 사항

1. **타임스탬프 숫자형(`number`) 변환**:
   - `"00:01:23.450"` 문자열 금지 → 반드시 초 단위 실수 `83.45` (`round(sec, 2)` 또는 `3`)로 변환. 모든 소절은 `start <= end`.
2. **VTT 노이즈 제거**:
   - `WEBVTT`, `Kind:`, `Language:`, 인라인 태그(`<c>`, `<00:00:00.000>`, `<i>`), `♪` 단독 큐 제거.
   - 롤업(roll-up) 자막의 연속 중복 줄 제거.
3. **HTML 엔티티 및 강희자전 부수/호환 한자 정규화**:
   - `&amp;`, `&quot;`, `&#39;` 등은 `html.unescape()`로 복원.
   - 일부 유튜브 자막(예: `見` 대신 `⾒`(U+2F92), `止` 대신 `⽌`(U+2F4C))에 **강희자전 부수(`\u2f00-\u2fdf`) / 호환 한자(`\uf900-\ufaff`)**가 섞여 있으므로 해당 범위 문자만 `unicodedata.normalize('NFKC', ch)`로 표준 CJK 한자로 치환합니다. *(⚠️ 문장 전체에 NFKC를 걸면 전각 물음표/공백 등이 변형되므로 한자 범위만 치환할 것)*
4. **소절 스키마 (`src/types/song.ts` `LyricLine`)**:
   - 필수: `id` (1부터 순차 증가), `start` (`number`), `end` (`number`), `rubyText` (`string`), `translation` (`string`)
   - 선택: `romaji` (`string`, 로마자 발음. UI의 `LyricViewer.tsx`는 `rubyText`와 `translation`을 렌더링하며 `romaji`는 데이터 보조용)
   - 중복 레거시 필드(`text`, `ruby`, `korean`)는 넣지 않습니다.

### 3-2. `rubyText` 인라인 루비 문법 (`src/utils/lyricParser.ts`)

`LyricViewer`는 `parseRubyText()` 정규식으로 텍스트를 파싱합니다:

```ts
/([^\[\]]*?)([\u4e00-\u9faf\u3400-\u4dbf\u3005]+)\[([^\]]+)\]|([^\[\]]+)/g
```

따라서 아래 규칙을 **단 하나의 예외 없이** 지켜야 합니다:

1. **모든 한자(`[\u4e00-\u9faf\u3400-\u4dbf\u3005]`, 반복 부호 `々` 포함)에 루비 필수**:
   - 한자 블록 바로 뒤에만 `[요미가나]`를 붙입니다.
   - `々`를 단독 미주석 상태로 두지 않습니다 (`日[ひ]々[び]` 또는 `日々[ひび]` ⭕ / `日[ひ]々` ❌).
2. **자석 밀착 원칙 (히라가나/오쿠리가나 분리)**:
   - 앞 히라가나나 뒤 오쿠리가나를 `[...]` 안에 넣지 마십시오.
   - ❌ `きっと今日[きょう]`의 앞부분을 묶은 `きっと今日[きっときょう]` / `消えゆく[きえゆく]` / `上[うま]手[く]`(본문 `く` 누락)
   - ✅ `きっと今日[きょう]` / `消[き]えゆく` / `上手[うま]く`
3. **숫자 + 한자(조수사 등)**:
   - 정규식이 아라비아 숫자 앞부분은 한자로 잡지 않으므로 `16歳[じゅうろくさい]`, `3時[さんじ]`, `8月[はちがつ]`처럼 해당 한자 뒤에 결합 읽기를 붙입니다.
4. **실제 가창 독음(歌唱読み) & 자동 변환(`pykakasi`) 오독 교정 체크리스트**:
   - Python 형태소/루비 변환기는 초벌 생성에만 사용하고, 아래 대표 오독 패턴을 반드시 육안·스크립트로 교정하십시오:
     - **시간/대명사 숙자훈**: `昨日[きのう]`(`さくじつ`❌), `今日[きょう]の日[ひ]`(`こんにち`/`にち`❌), `明日[あした/あす]`(`みょうにち`❌), `明後日[あさって]`(`みょうごにち`❌), `今年[ことし]`(`こんねん`❌), `大人[おとな]`, `一人[ひとり]`, `二人[ふたり]`, `友達[ともだち]`, `お生憎[あいにく]`(`せいぞう`❌)
     - **음독으로 잘못 읽히는 동사/형용사/부사**: `通[とお]り`(`とうり`❌), `失[うしな]って`(`うって`❌), `抗[あらが]い`(`こうい`❌), `模[かたど]った`(`もった`❌), `獲[と]った`(`かくった`❌), `狩[か]って`(`かりって`❌), `嗤[わら]って`(`しって`❌), `慄[おのの]く`(`りつく`❌), `酷[ひど]く`(`こくく`❌), `入[はい]って`(`いって`❌), `滲[し]んで`(`しんんで`❌)
     - **오쿠리가나 중복**: `癒[い]やす`(`癒[いや]やす`❌), `水溜[みずた]まり`(`水溜[みずたま]まり`❌), `耽[ふ]けて`(`耽[ふけ]けて`❌), `舞[ま]い`(`舞[まい]い`❌), `神懸[かみが]かり`(`神懸[かみがか]かり`❌)
     - **부자연스러운 2글자+ 분절**: `想定外[そうていがい]`(`想定[そうてい]外[そと]`❌), `桜[さくら]日和[びより]`, `相応[ふさわ]しい`, `景色[けしき]`, `勿忘草[わすれなぐさ]`, `流行[はや]り風邪[かぜ]`, `身体[からだ]`, `裸足[はだし]`
5. **`[...]` 내부 금지 문자**:
   - `[...]` 안에 **한글(`未来[미라이]` ❌)**, **한자**, **공백/줄바꿈**이 절대 들어가면 안 됩니다.
   - 아테지·외래어 루비(예: `現実[リアル]`, `兵隊[ソルジャー]`)의 경우에만 가타카나를 허용하며, 일반 일본어 독음은 순수 히라가나(및 장음 `ー`)로만 작성합니다.

---

## Step 4. `kanjiDictionary` (Zero-Gap 한자 사전) 구축

1. **Zero-Gap 원칙**:
   - 곡의 모든 `lyrics[].rubyText`에 등장하는 모든 한자(`[\u4e00-\u9faf\u3400-\u4dbf\u3005]`, `々` 포함)가 `kanjiDictionary` 객체의 키로 **100% 존재**해야 합니다.
2. **기존 곡 데이터 풀(Pool) 재사용**:
   - `src/data/songs/*.json`에는 이미 349곡 분량의 한자 사전이 구축되어 있으므로, Python 스크립트로 기존 곡들의 `kanjiDictionary` 풀을 먼저 모아 재사용한 뒤 **신규 한자만 추가 정의**하십시오.
   - *(주의: 기존 데이터나 참고 스크립트에서 가져오더라도 반드시 필드 무결성 검증을 실행해 오타가 없는지 확인하십시오.)*
3. **필수 필드 규격 (`KanjiDetail`)**:
   ```json
   "栞": {
     "character": "栞",
     "korean": "책갈피 간",
     "kun": ["しおり"],
     "on": ["カン"],
     "meaning": "책갈피, 길잡이, 안내서",
     "jlptLevel": "N1",
     "examples": [
       { "word": "栞", "reading": "しおり", "meaning": "책갈피, 안내서" }
     ]
   }
   ```
   - `jlptLevel`: `"N1"` ~ `"N5"` 문자열(모르면 생략). 숫자(`1`, `0`) 금지.
   - `on`: 가타카나 표기 권장.
   - `examples[].reading`: 순수 가나(히라가나 권장)만 사용하며 **한글 오타/한자 혼입 금지**.

---

## Step 5. 파일 생성 및 저장소 4곳 동기화

1. **JSON 파일 생성**: `src/data/songs/<slug>.json`
   - 루트 필드: `id`, `title`, `artist`, `youtubeId`, `thumbnail`, (`duration` 선택), `lyrics`, `kanjiDictionary`
   - `thumbnail`: `"https://i.ytimg.com/vi/<youtubeId>/maxresdefault.jpg"` 또는 `"https://img.youtube.com/vi/<youtubeId>/hqdefault.jpg"`
2. **TS 모듈 파일 생성**: `src/data/songs/<slug>.ts`
   - **권장 형식 (JSON 단일 소스 참조 — TS/JSON 불일치 원천 방지)**:
     ```ts
     import type { Song } from '../../types/song';
     import songData from './<slug>.json';

     export const <camelCase>Song: Song = songData as unknown as Song;
     ```
   - *(기존처럼 객체 리터럴을 `.ts`에 직접 쓰는 방식도 동작하지만, 반드시 `.json`과 100% 동일 내용을 유지해야 합니다.)*
3. **`.gitignore` 화이트리스트 등록 (필수!)**:
   - `src/data/songs/*`가 기본 무시(ignore)되어 있으므로, `.gitignore` 맨 아래에 아래 두 줄을 추가하지 않으면 GitHub에 곡 파일이 올라가지 않습니다:
     ```gitignore
     !src/data/songs/<slug>.ts
     !src/data/songs/<slug>.json
     ```
4. **카탈로그 문서 업데이트**:
   - [README.md](../README.md)의 `## 🎶 수록곡 (Built-in Songs)` 테이블에 새 행 추가 (`| **곡명** | 아티스트 | \`youtubeId\` | N구절 | M자 (전수 매핑) |`) 및 안내 곡 수 갱신
   - [docs/SONG_ADD_GUIDE.md](./SONG_ADD_GUIDE.md) 하단 카탈로그 테이블에 행 추가

---

## Step 6. 무결성 검증 · 린트 · 빌드 (필수 실행)

커밋 또는 완료 보고 전에 반드시 아래 **전수 검증**을 통과해야 합니다.

### 6-1. 한 번에 실행하는 Python 무결성 검증 스크립트 예시

`scratch/verify_song.py` 등에 저장하여 실행한 뒤, 검증 완료 후 삭제하십시오.

```python
import glob, json, re, os

ruby_re = re.compile(r"([^\[\]]*?)([\u4e00-\u9faf\u3400-\u4dbf\u3005]+)\[([^\]]+)\]|([^\[\]]+)")
kanji_re = re.compile(r"[\u4e00-\u9faf\u3400-\u4dbf\u3005]")
hangul_re = re.compile(r"[가-힣ㄱ-ㅎㅏ-ㅣ]")
compat_re = re.compile(r"[\u2f00-\u2fdf\uf900-\ufaff]")
entity_re = re.compile(r"&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);")

seen_yt = {}
errors = []

for jf in sorted(glob.glob("src/data/songs/*.json")):
    stem = os.path.splitext(os.path.basename(jf))[0]
    d = json.load(open(jf, encoding="utf-8"))
    yt = d["youtubeId"].strip()
    if yt in seen_yt:
        errors.append((stem, f"Duplicate youtubeId {yt} with {seen_yt[yt]}"))
    seen_yt[yt] = stem

    kd = d.get("kanjiDictionary", {})
    for l in d.get("lyrics", []):
        rt = l.get("rubyText", "")
        lid = l.get("id")
        if not isinstance(l.get("start"), (int, float)) or not isinstance(l.get("end"), (int, float)) or l["start"] > l["end"]:
            errors.append((stem, lid, "invalid start/end"))
        if entity_re.search(rt) or compat_re.search(rt):
            errors.append((stem, lid, "html entity or kangxi/compat kanji"))

        rec = ""
        for m in ruby_re.finditer(rt):
            if m.group(2) is not None and m.group(3) is not None:
                if m.group(1):
                    rec += m.group(1)
                    if kanji_re.search(m.group(1)):
                        errors.append((stem, lid, f"unannotated kanji: {m.group(1)}"))
                r = m.group(3)
                if hangul_re.search(r) or kanji_re.search(r):
                    errors.append((stem, lid, f"bad ruby chars in [{r}]"))
                rec += m.group(2) + "[" + r + "]"
            elif m.group(4) is not None:
                rec += m.group(4)
                if kanji_re.search(m.group(4)) and stem != "dezzy_evergreen":
                    errors.append((stem, lid, f"unannotated kanji: {m.group(4)}"))
        if rec != rt:
            errors.append((stem, lid, f"bracket leak: {rt}"))

        for ch in kanji_re.findall(rt):
            if ch not in kd:
                errors.append((stem, lid, f"missing kanjiDictionary key: {ch}"))

    for ch, det in kd.items():
        for f in ("kun", "on"):
            for item in det.get(f, []):
                if hangul_re.search(item):
                    errors.append((stem, ch, f"hangul in {f}: {item}"))
        for ex in det.get("examples", []):
            if hangul_re.search(ex.get("reading", "")) or kanji_re.search(ex.get("reading", "")):
                errors.append((stem, ch, f"bad example reading: {ex}"))

gi = open(".gitignore", encoding="utf-8").read()
for jf in sorted(glob.glob("src/data/songs/*.json")):
    stem = os.path.splitext(os.path.basename(jf))[0]
    if f"!src/data/songs/{stem}.json" not in gi or f"!src/data/songs/{stem}.ts" not in gi:
        errors.append((stem, "missing from .gitignore"))

print(f"Total songs: {len(seen_yt)}, errors: {len(errors)}")
for e in errors[:30]:
    print(" ", e)
assert not errors
```

### 6-2. 린트 및 프로덕션 빌드

```powershell
npm run lint    # oxlint: 0 warnings, 0 errors 확인
npm run build   # tsc -b && vite build 정상 완료 확인
```

### 6-3. 임시 파일 정리 & 동작 확인
- `scratch/`에 생성한 임시 VTT/스크립트 삭제 (`trash/`는 Vite dev server 삭제 백업용이므로 삭제하지 않음).
- `npm run dev`로 로컬 서버 실행 후 브라우저 새로고침(F5) 시 새 곡이 보관함 최상단에 자동 로드되고, 한자 카드/싱크/후리가나가 정상 동작하는지 확인합니다. *(JSON만 빠르게 테스트할 때는 앱 우측 UI의 **새 노래 추가(`AddSongModal`)** 모달에 JSON을 붙여넣어 바로 미리보기 가능)*

---

## 📋 부록: 다른 AI 세션에 바로 전달하는 작업 요청 프롬프트 템플릿

```text
이 저장소의 `docs/AI_SONG_ADD_GUIDE.md`를 먼저 읽고 그 절차대로 새 곡을 추가해줘.

- 유튜브 URL: <URL>
- 곡명 / 아티스트 (선택): <제목 / 아티스트>
- 내가 제공하는 가사/번역 (선택):
<가사 및 번역 붙여넣기 — 없으면 yt-dlp 자막/설명란/웹 검색으로 공식 일본어 가사 확보 후 진행>

규칙 요약:
1. `yt-dlp`로 `scratch/`에 메타데이터와 자막을 받아 타임스탬프를 확보하고, 공식 일본어 원문 가사와 교차 검증할 것.
2. `rubyText`는 `src/utils/lyricParser.ts` 정규식 기준으로 모든 한자(`々` 포함)에 실제 가창 독음 요미가나를 부착하며, `pykakasi` 오독/오쿠리가나 중복/한글 혼입이 없도록 검수할 것.
3. `kanjiDictionary`는 기존 `src/data/songs/*.json` 풀을 재활용해 Zero-Gap(누락 0자)으로 채울 것.
4. `src/data/songs/<slug>.json`, `<slug>.ts`, `.gitignore`, `README.md`, `docs/SONG_ADD_GUIDE.md`를 동기화할 것.
5. `scratch/` 정리 후 무결성 검증 스크립트 + `npm run lint` + `npm run build`를 모두 통과한 뒤 결과를 보고할 것.
```
