# 🎵 UtaStudy 신규 곡 추가 및 개발 가이드 (Next Session Handover)

이 문서는 다른 AI 세션 또는 개발자가 본 프로젝트에서 **새로운 노래를 추가**하거나 **데이터 및 스토리지를 관리**할 때 반드시 숙지해야 할 작업 절차와 핵심 주의사항을 정리한 인수인계 가이드입니다.

> [!TIP]
> **다른 AI 세션에 곡 추가를 지시할 때는** 자막 다운로드(`yt-dlp`), 공식 가사/아테지 확보, `pykakasi` 오독 방지, 한자 사전 구축, 무결성 검증 스크립트 및 복사용 프롬프트까지 상세히 정리된 **[AI_SONG_ADD_GUIDE.md](./AI_SONG_ADD_GUIDE.md)** 문서를 함께 참고하십시오.

---

## 📌 1. 핵심 아키텍처 및 스토리지 동작 원리 (필독)

### 1-1. '기본 곡'의 정의와 삭제 처리 방식 (⚠️ 가장 중요한 주의사항)
* **기본 Fallback 곡**: `エメラルド (kitani-emerald)`
  * 사용자가 *"기본곡은 에메랄드만으로 충분하다"*고 한 의미는 **"모든 곡을 비우거나 초기화(Reset)했을 때 무조건 최소 1곡으로 남아있어야 하는 Fallback 기본 곡이 에메랄드"**라는 뜻입니다.
  * ❌ **절대 금지**: 다른 곡들이나 기존 10여 곡의 곡들을 임의로 데모/테스트곡으로 취급하여 필터링하거나 숨기지 마십시오.
  * ⭕ **올바른 처리**: 사용자가 명시적으로 *"XX 곡 삭제해"*라고 요청한 특정 곡(예: `ハレ (lumina-hare)`)만 삭제 목록(`deletedIds`)에 넣어야 합니다.
* **영구 삭제 보장 (`utastudy_deleted_song_ids_v1`)**:
  * 사용자가 UI에서 휴지통 버튼으로 삭제한 곡 ID는 로컬 스토리지의 `deletedIds`에 영구 기록됩니다.
  * 디스크에 `.ts` 파일이 존재하더라도 `deletedIds`에 포함된 곡은 **F5 새로고침을 해도 절대 다시 나타나지 않습니다.**
* **영구 스킵 곡 (`ThOViq2fHqg` - 필독)**:
  * 3번 시트 (한국어만 80곡)의 18번 `ThOViq2fHqg` (Kikuo - 君が死んでも許してあげるよ)는 **사용자의 명시적 요청으로 영구 스킵(제작 불필요)** 처리되었습니다.
  * ❌ **절대 금지**: 다른 AI 에이전트나 세션은 이 곡(`ThOViq2fHqg`)을 생성하거나 추가하지 마십시오. 스킵 상태로 유지해야 합니다.

### 1-2. 신규 곡 자동 감지 메커니즘
* `src/services/songStorage.ts`의 `loadDiskSongs()`는 `import.meta.glob('../data/songs/*.ts', { eager: true })`를 사용하여 디스크에 새로 생긴 곡을 자동으로 읽어들입니다.
* `getStoredSongs()`는 디스크에 새 곡이 추가되었고 사용자가 삭제하지 않은 곡(`!deletedIds.has(id)`)이라면, **보관함 최상단(1번 트랙)에 자동 배치**합니다.
* 사용자가 브라우저를 **F5(새로고침)**하면 새로 추가된 곡이 즉시 화면에 첫 곡으로 로드됩니다.

### 1-3. 중복 방지 (Deduplication)
* 곡 데이터는 `id`뿐만 아니라 **`youtubeId`** 기준으로도 중복을 필터링(`deduplicateSongs`)합니다.
* 동일한 유튜브 영상이 다른 ID로 2중 등록되는 현상(예: `아이문마인` 2개 복제 현상)이 발생하지 않도록 항상 `deduplicateSongs`를 거쳐 저장됩니다.

---

## 🛠️ 2. 신규 곡 추가 단계별 워크플로우 (Step-by-Step)

### Step 1. 유튜브 메타데이터 및 자막 확인
터미널에서 `yt-dlp`를 사용하여 영상 정보 및 공식 자막을 확인합니다:
```bash
# 영상 제목, 업로더, 재생시간 확인
yt-dlp --print "%(title)s | %(uploader)s | %(duration)s" "<유튜브URL>"

# 제공되는 자막 트랙 확인
yt-dlp --list-subs "<유튜브URL>"
```
* **자막 다운로드 (VTT)**:
  ```bash
  yt-dlp --write-sub --sub-lang ko,ja --skip-download -o "scratch/<곡명>.%(ext)s" "<유튜브URL>"
  ```
* 사용자가 일본어 가사나 한국어 번역을 직접 제공한 경우, 해당 텍스트를 우선 사용하여 자막 타임라인에 1:1로 매핑합니다.

### Step 2. 타임스탬프 & 가사 1:1 매핑
* `lyrics` 배열의 각 소절은 아래 규격을 엄격히 준수해야 합니다:
  * `id`: 1부터 증가하는 정수
  * `start`: 소절 시작 시간 (초 단위, 소수점 둘째 자리 숫자, 예: `23.89`)
  * `end`: 소절 종료 시간 (초 단위, 소수점 둘째 자리 숫자, 예: `26.81`)
  * `rubyText`: 한자 블록 뒤에만 `[후리가나]`가 부착된 문자열
  * `translation`: 한국어 번역
  * `romaji`: 로마자 발음 표기

---

### Step 3. Zero-Gap 후리가나(루비) 작성 규칙 (엄격 준수)

#### 1) 🎵 실제 노래 가창 독음(歌唱読み) & 숙자훈 절대 우선
사전의 기계적인 1순위 음독을 달지 말고, **노래에서 가수가 실제로 부르는 발음**을 달아야 합니다.
* `昨日[きのう]` (사쿠지츠 ❌ -> 키노우 ⭕)
* `今日[きょう]の日[ひ]` (니치 ❌ -> 히 ⭕)
* `明日[あした]` 또는 `明日[あす]` (가창 박자에 맞춤)
* `明後日[あさって]` (묘우고니치 ❌ -> 아삿테 ⭕)
* `詩[し]の束[たば]` (소쿠 ❌ -> 타바 ⭕)
* `波[なみ]の随[まにま]に` (즈이니 ❌ -> 마니마니 ⭕)
* `お生憎[あいにく]` (세이조우 ❌ -> 아이니쿠 ⭕)
* `大人[おとな]`, `友達[ともだち]`, `二人[ふたり]`, `一人[ひとり]` 등 숙자훈 필수 준수

#### 2) 🎯 오직 한자 블록에만 자석 밀착 루비 부착 (글자 밀림 방지)
* ❌ 잘못된 예: `きっと今日[きっときょう]` (앞의 히라가나까지 루비에 포함되면 위치가 어긋남)
* ✅ 올바른 예: `きっと今日[きょう]`
* ❌ 잘못된 예: `消えゆく[きえゆく]` (오쿠리가나 'えゆく'를 괄호에 넣지 말 것)
* ✅ 올바른 예: `消[き]えゆく`
* ❌ 잘못된 예: `見失って[みうしなって]`
* ✅ 올바른 예: `見失[みうしな]って` 또는 `見[み]失[うしな]って`
* ❌ 잘못된 예: `拡声器だったよ[かくせいきだったよ]`
* ✅ 올바른 예: `拡声器[かくせいき]だったよ`

#### 3) 정규식 호환성 검증
`src/utils/lyricParser.ts`의 루비 파싱 정규식과 완전히 부합하는지 Python 스크립트 등으로 사전에 매칭 테스트를 거쳐야 합니다:
```python
import re
regex = re.compile(r'([^\[\]]*?)([\u4e00-\u9faf\u3400-\u4dbf\u3005]+)\[([^\]]+)\]|([^\[\]]+)')
```

---

### Step 4. 한자 사전 (kanjiDictionary) 100% 전수 등재
* 가사에 등장하는 모든 한자는 **단 1글자도 누락 없이** `kanjiDictionary`에 등록해야 합니다. (누락 시 UI 카드 렌더링 오류 발생)
* 기존 곡 파일(`src/data/songs/*.json`)에 이미 수백 자의 한자가 완성도 높게 구축되어 있으므로, 기존 풀을 먼저 로드한 뒤 해당 곡에만 등장하는 신규 한자만 추가 정의하면 매우 빠르고 정확합니다.
* **필수 한자 필드**:
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

---

### Step 5. 파일 생성 및 저장소 반영

1. **JSON 생성**: `src/data/songs/<song_id>.json`
2. **TypeScript 모듈 생성**: `src/data/songs/<song_id>.ts`
   ```typescript
   import type { Song } from '../../types/song';

   export const <songName>Song: Song = {
     "id": "<고유아이디>",
     "title": "<노래 제목>",
     "artist": "<아티스트명>",
     "youtubeId": "<유튜브 11자리 비디오 ID>",
     "thumbnail": "https://img.youtube.com/vi/<비디오ID>/hqdefault.jpg",
     "duration": <초단위 재생시간>,
     "lyrics": [ ... ],
     "kanjiDictionary": { ... }
   };
   ```
3. **`.gitignore` 화이트리스트 등록**:
   ```gitignore
   !src/data/songs/<song_id>.ts
   !src/data/songs/<song_id>.json
   ```
4. **`README.md` 테이블 업데이트**:
   `README.md`의 `## 🎶 수록곡 (Built-in Songs)` 테이블에 행 추가.

---

### Step 6. 빌드 및 린트 검증 (필수)
새 파일을 추가한 후 아래 명령을 반드시 실행하여 에러가 없는지 확인합니다:
```bash
npm run build   # tsc -b && vite build 정상 완료 확인
npm run lint    # oxlint 통과 확인
```

---

## 📋 3. 현재 등록된 곡 현황 (Current Catalog - 총 349곡)

| 번호 | 곡명 (Title) | 아티스트 (Artist) | YouTube ID | 구절 수 | 한자 수 | 상태 |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | **エメラルド (Emerald)** | キタニタツヤ (Tatsuya Kitani) feat. 初音ミク | `kM8HEzBGU-0` | 32구절 | 81자 | 기본 Fallback 곡 |
| 2 | **ギャンブルショット (Gamble Shot)** | 佐倉流星 feat. 重音テトSV | `QOVVWkAXtSg` | 44구절 | 129자 | 정상 등록 (ID: `gamble-shot`) |
| 3 | **でまかせなシンフォニー (되는대로 심포니)** | 馬車馬カエデ × ちから feat. 重音テト & ALL | `Gtu2utelMRc` | 83구절 | 131자 | 정상 등록 (ID: `demakase-symphony`) |
| 4 | **ハローサロウ (Hello Sorrow)** | Aliey:S feat. v flower | `-kXdEsihdvU` | 81구절 | 127자 | 정상 등록 (ID: `hello-sorrow`) |
| 5 | **運命 (운명) - 던전밥 2기 OP** | sumika | `qabqhNQS-S0` | 70구절 | 94자 | 정상 등록 (ID: `sumika-unmei`) |
| 6 | **エゴ (Ego) feat. 初音ミク** | sasakure.UK | `79LwIdheZts` | 52구절 | 68자 | 정상 등록 (ID: `sasakure-ego`) |
| 7 | **ウルトラトレーラー (Ultra Trailer)** | マサラダ feat. 重音テトSV | `Fhg3KsDkMJM` | 67구절 | 128자 | 정상 등록 (ID: `masarada-ultra-trailer`) |
| 8 | **ちっちゃな私 (Chiisana Watashi)** | マサラダ feat. 重音テトSV | `4aFC2oC-wHA` | 30구절 | 29자 | 정상 등록 (ID: `masarada-chiisana-watashi`) |
| 9 | **ライアーダンサー (Liar Dancer)** | マサラダ feat. 重音テトSV | `UHbmkxv-874` | 51구절 | 80자 | 정상 등록 (ID: `masarada-liar-dancer`) |
| 10 | **ゼロトーキング (Zero Talking)** | はるまきごはん feat. 初音ミク | `2INYgH-Gcjk` | 61구절 | 82자 | 정상 등록 (ID: `harumakigohan-zero-talking`) |
| 11 | **一輪の詩 (Ichirin no Uta / 한 송이의 시)** | Project Lumina feat. 星界 | `_zhfi_RyF1U` | 65구절 | 92자 | 정상 등록 (ID: `lumina-ichirin-no-uta`) |
| 12 | **パリィ (Parry)** | 宮守文学 feat. 鏡音レン, 鏡音リン | `p9F__9fciRo` | 96구절 | 128자 | 정상 등록 (ID: `miyamori-parry`) |
| 13 | **ハレ (Hare / 맑음)** | Project Lumina feat. 知声 | `T9eFcn4vKTI` | 54구절 | 53자 | 영구 삭제 숨김 (`deletedIds`, 디스크 파일 유지) |
| 14 | **アイムマイン (I'm Mine)** | halyosy ft. VOCALOIDS | `yVMHWv7hKTE` | 83구절 | 203자 | 정상 등록 (ID: `halyosy-im-mine`) |
| 15 | **あっぷりケ (Applique / 아플리케)** | 真島ゆろ feat. 可不 | `TpkZqCopUDA` | 59구절 | 97자 | 정상 등록 (ID: `majima-yuro-applike`) |
| 16 | **Ours** | *Luna feat. 初音ミク | `QcpjV43ALCA` | 39구절 | 62자 | 정상 등록 (ID: `luna-ours`) |
| 17 | **フィクション (Fiction)** | sumika | `IKHGAuNaGuA` | 41구절 | 76자 | 정상 등록 (ID: `sumika-fiction`) |
| 18 | **にっこり^^調査隊のテーマ (Niccori Survey Team Theme)** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン, 鏡音レン | `C_Fc1x_aeFQ` | 85구절 | 118자 | 정상 등록 (ID: `wanopo-nikkori`) |
| 19 | **ひゅ〜どろどろ (Hyu~Dorodoro)** | 栗山夕璃 feat. 初音ミク, MEIKO | `8D_7-jNaErg` | 26구절 | 87자 | 정상 등록 (ID: `kuriyama-hyu-dorodoro`) |
| 20 | **オーバーレイ・ワールド (Overlay World)** | 雪乃イト feat. 重音テト | `7b4M8utvFb8` | 51구절 | 120자 | 정상 등록 (ID: `yukino-overlay-world`) |
| 21 | **25時の情熱 (25-ji no Jounetsu)** | カンザキイオリ feat. VOCALOIDS | `RifILHUOV_w` | 31구절 | 72자 | 정상 등록 (ID: `kanzaki-25ji-no-jounetsu`) |
| 22 | **ミックスナッツ (Mixed Nuts)** | Official HIGE DANDism | `CbH2F0kXgTY` | 33구절 | 103자 | 정상 등록 (ID: `higedan-mixed-nuts`) |
| 23 | **スーツ (Suits)** | カンザキイオリ feat. 重音テト, 初音ミク | `DMEmRL5YGTM` | 54구절 | 115자 | 정상 등록 (ID: `kanzaki-suits`) |
| 24 | **僕らはなんにも悪くない！ (Nothing Wrong With Us!)** | 宮守文学 feat. 初音ミク | `WWD7qemSKyc` | 68구절 | 138자 | 정상 등록 (ID: `miyamori-warukunai`) |
| 25 | **水色侵略 (Mizuiro Shinryaku)** | ナユタン星人 feat. 初音ミク | `Mksf3xakH8s` | 60구절 | 75자 | 정상 등록 (ID: `nayutan-mizuiro-shinryaku`) |
| 26 | **コバルトメモリーズ (Cobalt Memories)** | はるまきごはん feat. 初音ミク | `0X_pI_SCDK8` | 55구절 | 102자 | 정상 등록 (ID: `harumaki-cobalt-memories`) |
| 27 | **クローンクローン (Clone Clone)** | Atena feat. GUMI, 鏡音リン | `bmbAm-fKnbQ` | 56구절 | 65자 | 정상 등록 (ID: `atena-clone-clone`) |
| 28 | **アタマモミ (Atamamomi)** | はるまきごはん feat. 初音ミク, ナースロボ_タイプT | `WPXDz834NEo` | 60구절 | 70자 | 정상 등록 (ID: `harumaki-atamamomi`) |
| 29 | **Ribbon** | sabio feat. 重音テト | `_a-eNWjvw1g` | 39구절 | 75자 | 정상 등록 (ID: `sabio-ribbon`) |
| 30 | **グルグル (Guruguru)** | Omi feat. 重音テト | `Hn6SpfEu2MA` | 52구절 | 87자 | 정상 등록 (ID: `omi-guruguru`) |
| 31 | **マジック・メイド (Magic Maid)** | MIMI feat. 重音テトSV | `TC80uw4HgCw` | 48구절 | 65자 | 정상 등록 (ID: `mimi-magic-maid`) |
| 32 | **星降る海 (Hoshi Furu Umi)** | Aqu3ra feat. 月見ヤチヨ (cv. 早見沙織) | `h5XQqKuek5A` | 40구절 | 95자 | 정상 등록 (ID: `aqu3ra-hoshi-furu-umi`) |
| 33 | **アンドゥ (Undo)** | 宮守文学 feat. 鏡音レン, 鏡音リン | `Nen743brrNA` | 88구절 | 143자 | 정상 등록 (ID: `miyamori-undo`) |
| 34 | **密かなる交信曲 (Hisokanaru Koushinkyoku)** | 濁茶 feat. 初音ミク | `Ch4RQPG1Tmo` | 30구절 | 107자 | 정상 등록 (ID: `dakucha-hisokanaru-koushinkyoku`) |
| 35 | **UNIVERCE** | あたたかい水族館 feat. 初音ミク, 音街ウナ | `Q2n-G_SMAEw` | 39구절 | 78자 | 정상 등록 (ID: `atatakai-suizokukan-univerce`) |
| 36 | **テレパシ (Telepathy)** | DECO*27 feat. 初音ミク | `c56TpxfO9q0` | 53구절 | 75자 | 정상 등록 (ID: `deco27-telepathy`) |
| 37 | **溶けちゃいそう (Tokechaisou)** | なみぐる feat. AiSuu | `Q3FjTt2bzoQ` | 41구절 | 56자 | 정상 등록 (ID: `namigroove-tokechaisou`) |
| 38 | **贅沢と君とカプチーノ (Zeitaku to Kimi to Cappuccino)** | shikisai feat. 初音ミク, 鏡音リン | `LPci3mEA5AA` | 67구절 | 105자 | 정상 등록 (ID: `shikisai-zeitaku-to-kimi-to-cappuccino`) |
| 39 | **アンコールダンス (Encore Dance)** | MIMI feat. 重音テトSV | `5hgSET4bpbk` | 27구절 | 52자 | 정상 등록 (ID: `mimi-encore-dance`) |
| 40 | **お水見ずにいる (Omizu Mizu ni Iru)** | 濁茶 feat. 知声, りむる | `UtVS0YEdOes` | 18구절 | 88자 | 정상 등록 (ID: `dakucha-omizu-mizu-ni-iru`) |
| 41 | **お返事まだカナ💦❓おじさん構文😁❗️ (Ohenji Mada Kana? Ojisan Koubun!)** | 雨衣 | `8E8aWeY-pAc` | 84구절 | 91자 | 정상 등록 (ID: `yoshimoto-ojisan-koubun`) |
| 42 | **ゔるとぅーむ (Vulthoom)** | 藤原ハガネ feat. flower, 重音テトSV | `4peROn0bCAQ` | 33구절 | 120자 | 정상 등록 (ID: `fujiwara-vulthoom`) |
| 43 | **夏に透明 (Natsu ni Toumei)** | Twinfield feat. 初音ミク | `d8tp0hbDQBM` | 32구절 | 74자 | 정상 등록 (ID: `twinfield-natsu-ni-toumei`) |
| 44 | **どりーむもーど (Dream Mode)** | Atena feat. 音街ウナ, 歌愛ユキ | `7Ucwpeg9iXM` | 76구절 | 89자 | 정상 등록 (ID: `atena-dream-mode`) |
| 45 | **ちゅきちゅきポコポコポン (Chukichuki Pokopokopon)** | TAK feat. 初音ミク | `pHakQLbGjaU` | 52구절 | 15자 | 정상 등록 (ID: `tak-chukichuki-pokopokopon`) |
| 46 | **ブレインロット (Brain rot)** | 東京真中 feat. 重音テト | `UsjsYMo3O1Q` | 24구절 | 24자 | 정상 등록 (ID: `tokyomanaka-brainrot`) |
| 47 | **てんしかあくまか (Tenshi ka Akuma ka)** | WONDERFUL★OPPORTUNITY! feat. 雨衣 | `YC6DLCKhlkY` | 64구절 | 61자 | 정상 등록 (ID: `wanopo-tenshi-ka-akuma-ka`) |
| 48 | **ドゥーマー (Doomer)** | 東京真中 feat. 重音テト | `YcO-MxPf_Vg` | 44구절 | 31자 | 정상 등록 (ID: `tokyomanaka-doomer`) |
| 49 | **我ら！ゴミ分別団 (Garbage Sorting Squad)** | かてらざわ feat. 重音テト, ずんだもん | `OreUrf87EUE` | 51구절 | 79자 | 정상 등록 (ID: `katerazawa-gomi-funbetsudan`) |
| 50 | **ヒロインRE♡クエスト (Heroine RE♡Request)** | 삼사 feat. 重音テト, 足立レイ | `VXA0PEjkIGU` | 73구절 | 76자 | 정상 등록 (ID: `samsa-heroine-request`) |
| 51 | **いえない (Ienai)** | ひらぎ feat. 初音ミク | `SuP_gK4q2a8` | 26구절 | 82자 | 정상 등록 (ID: `hiragi-ienai`) |
| 52 | **Phonky Donky Crazy** | Chenomio feat. 重音テト | `nzMKs_Xh1Co` | 42구절 | 71자 | 정상 등록 (ID: `chenomio-phonky-donky-crazy`) |
| 53 | **アダチ・レイ (Adachi Rei)** | 佐藤ちなみに feat. 足立レイ, 重音テト | `cRnjetMobw8` | 38구절 | 88자 | 정상 등록 (ID: `chinamini-adachi-rei`) |
| 54 | **39** | d0tc0mmie feat. 初音ミク, 重音テトSV | `ZhOyrxdK3Hs` | 19구절 | 0자 | 정상 등록 (순수 히라가나 곡) |
| 55 | **無宗教クラブ (Gray Zone)** | Parang feat. 初音ミク | `hU7hcBcLLUY` | 51구절 | 22자 | 정상 등록 (ID: `parang-gray-zone`) |
| 56 | **ディスコティックナイト (Discotic Night)** | NEKOZUME feat. 雨衣, 重音テト | `CrfRliqxuYc` | 41구절 | 47자 | 정상 등록 (ID: `nekozume-discotic-night`) |
| 57 | **拝啓、少年よ (Haikei, Shounen yo)** | Hump Back | `d6i4AtCxrDo` | 29구절 | 42자 | 정상 등록 (ID: `hump-back-haikei-shounen-yo`) |
| 58 | **カンケーガール (Kankee Girl)** | マサラダ feat. 重音テト | `5lK9z88taP8` | 56구절 | 76자 | 정상 등록 (ID: `masarada-kankee-girl`) |
| 59 | **フィクションです。 (Fiction Desu)** | Chenomio feat. 重音テト | `LxVv4QneUuU` | 57구절 | 69자 | 정상 등록 (ID: `chenomio-fiction-desu`) |
| 60 | **ミスエラア (Miss Error)** | Vell feat. 初音ミク | `sRnx3XjcDFs` | 42구절 | 86자 | 정상 등록 (ID: `vell-miss-error`) |
| 61 | **マギアート (Magiato)** | 煮ル果実 feat. v flower | `IMJVU4ztJI0` | 56구절 | 149자 | 정상 등록 (ID: `nilfruits-magiato`) |
| 62 | **キャラクターT (Character T)** | Atena feat. 重音テト, 重音テトSV | `YSBZFVSvqL0` | 83구절 | 102자 | 정상 등록 (ID: `atena-character-t`) |
| 63 | **アンタに言ってんの！！！ (Anta ni Itten no!!!)** | ぴーなた feat. 重音テト | `V4elF7---KQ` | 44구절 | 69자 | 정상 등록 (ID: `peenata-anta-ni-itten-no`) |
| 64 | **承認してくださいジーニーさん！ (Approve, Please! Genie)** | TRAP CHICK feat. 重音テト, 音街ウナ | `XKZIQlqVjjk` | 88구절 | 105자 | 정상 등록 (ID: `trap-chick-shounin-shite-kudasai-jiinii-san`) |
| 65 | **Take me out** | Omi feat. 重音テト | `L6e6fjlQiL8` | 33구절 | 46자 | 정상 등록 (ID: `omi-takemeout`) |
| 66 | **子供になっちゃえよ (Kodomo ni Natchae yo)** | 栗山夕璃 feat. flower, 重音テトSV | `JucbynqMPvc` | 34구절 | 49자 | 정상 등록 (ID: `kuriyama-kodomo`) |
| 67 | **ライフリワード (Life Reward)** | 栗山夕璃 feat. 重音テトSV | `81jeVW4JLXs` | 35구절 | 83자 | 정상 등록 (ID: `kuriyama-lifereward`) |
| 68 | **ポッペンキュート (Poppen Cute)** | 東京真中 feat. 重音テト | `XYYq-uSeVwY` | 41구절 | 62자 | 정상 등록 (ID: `tokyomanaka-poppencute`) |
| 69 | **プラネテス (Planetes)** | seiza feat. 初音ミク | `KcCNaBP06dM` | 20구절 | 73자 | 정상 등록 (ID: `seiza-planetes`) |
| 70 | **ヤラララ (YARARARA)** | ABM feat. 重音テト | `T24rF_x0TmQ` | 57구절 | 52자 | 정상 등록 (ID: `abm-yararara`) |
| 71 | **しらないプラネット (Shiranai Planet)** | shikisai feat. 初音ミク, 鏡音リン | `TqTmTqIxcGQ` | 38구절 | 48자 | 정상 등록 (ID: `shikisai-shiranai-planet`) |
| 72 | **海底の彗星 (Kaitei no Suisei)** | まきゃヴぇり feat. 鏡音リン, 鏡音レン | `s-qMpqq791M` | 67구절 | 95자 | 정상 등록 (ID: `machiavelli-kaitei-no-suisei`) |
| 73 | **アクマバライ (Akumabarai / Exorcist)** | うちのボカロは様子がおかしい feat. 雨衣, Gemini, 初音ミク | `TzH5BsJj81Y` | 37구절 | 61자 | 정상 등록 (ID: `uchinobokaro-akuma-barai`) |
| 74 | **スパイラル・メロディーズ (Spiral Melodies)** | Omoi feat. 初音ミク with メロエッタ | `yNw89sQOKas` | 40구절 | 48자 | 정상 등록 (ID: `omoi-spiral-melodies`) |
| 75 | **君のココロをハッキング (Kimi no Kokoro o Hacking)** | ki-you feat. りむる | `-pIGv9GlhEU` | 41구절 | 66자 | 정상 등록 (ID: `kiyou-kimi-no-kokoro-o-hacking`) |
| 76 | **最高のMVの作りかた (Saikou no MV no Tsukurikata)** | 阿修 feat. 初音ミク | `fcVC8FN_Qx8` | 55구절 | 144자 | 정상 등록 (ID: `ashu-saikou-no-mv-no-tsukurikata`) |
| 77 | **マイルストーン (Milestone)** | しゃいと feat. 音街ウナ | `s5Jj3aE9GAk` | 59구절 | 70자 | 정상 등록 (ID: `shaito-milestone`) |
| 78 | **オイメアルシー (oimearcy)** | 88 / nihachi feat. 知声 | `9v_0TZ4XMuw` | 29구절 | 41자 | 정상 등록 (ID: `nihachi-oimearcy`) |
| 79 | **あなたのアーカイブ (Anata no Archive)** | 真島ゆろ feat. 初音ミク | `75KQXOArrTE` | 56구절 | 91자 | 정상 등록 (ID: `mashimayuro-anata-no-archive`) |
| 80 | **connecting the dots** | 蒼天のラピスラズリ feat. 初音ミク, IA | `Kz9hfvwfFXk` | 36구절 | 39자 | 정상 등록 (ID: `souten-connecting-the-dots`) |
| 81 | **こころこぼれ (Kokoro Kobore)** | Omi feat. 重音テト | `Xtc5GiharaE` | 35구절 | 98자 | 정상 등록 (ID: `omi-kokoro-kobore`) |
| 82 | **ウタカタナ (Utakatana)** | halyosy feat. KAITO, MEIKO, 巡音ルカ | `9RgvGM33aSM` | 83구절 | 186자 | 정상 등록 (ID: `halyosy-utakatana`) |
| 83 | **時間厳守！どんびーれいと！ (Jikan Genshu! Don't Be Late!)** | いずん≒ feat. 音街ウナ | `odGELwGS2Ko` | 40구절 | 100자 | 정상 등록 (ID: `izun-dont-be-late`) |
| 84 | **パカパカバカリ (Pakapaka Bakari)** | ぼっちぼろまる | `HGaXGRQrKsY` | 54구절 | 68자 | 정상 등록 (ID: `botchi-pakapaka-bakari`) |
| 85 | **ハオ (Hao)** | DECO*27 feat. 初音ミク | `3GzRDW3hZ1k` | 46구절 | 82자 | 정상 등록 (ID: `deco27-hao`) |
| 86 | **愛属性 (Ai Zokusei)** | ピノキオピー feat. 初音ミク | `Xx1TnVObQ0k` | 78구절 | 130자 | 정상 등록 (ID: `pinocchiop-ai-zokusei`) |
| 87 | **完璧超人だ！ (Kanpeki Choujin da!)** | かてらざわ feat. ずんだもん, Yi Xi | `ql-DCZqjLNk` | 60구절 | 107자 | 정상 등록 (ID: `katerazawa-kanpeki-choujin-da`) |
| 88 | **惑星ウェブスター (Wakusei Webster)** | Atena feat. 蒼姫ラピス, メルリ | `UlhFuCzxNbk` | 61구절 | 80자 | 정상 등록 (ID: `atena-wakusei-webster`) |
| 89 | **はしる! とおく! とどく!** | 薄塩指数 feat. 重音テトSV | `b6ndcYxpX24` | 49구절 | 59자 | 정상 등록 (ID: `hashiru-tooku-todoku`) |
| 90 | **異種 (Ishu / Alien)** | GESO feat. 歌愛ユキ, GUMI, 鳴花ヒメ | `rc9MrU98Eco` | 26구절 | 41자 | 정상 등록 (ID: `geso-ishu`) |
| 91 | **冴ゆる青 (Sayuru Ao / Feel sky blue)** | 瀬名航 feat. 初音ミク | `EesNkIVrbR4` | 42구절 | 92자 | 정상 등록 (ID: `senawataru-sayuru-ao`) |
| 92 | **ベラドンナ (Belladonna)** | nyanyannya（大天才P）- SynthV Yuma | `VSGEpqi48dQ` | 45구절 | 140자 | 정상 등록 (ID: `nyanyannya-belladonna`) |
| 93 | **スノーマン (Snowman) - Rerec** | halyosy ft. KAITO | `SUXQ7L1D2Dw` | 47구절 | 100자 | 정상 등록 (ID: `halyosy-snowman`) |
| 94 | **モミアゲヲシャカアゲヲ** | ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ | `cirDXY3CkSk` | 85구절 | 74자 | 정상 등록 (ID: `momiagewo-shakaagewo`) |
| 95 | **サイエンス** | MIMI feat. 重音テトSV | `m-bvW4pKT68` | 57구절 | 101자 | 정상 등록 (ID: `mimi-science`) |
| 96 | **はいよろこんで** | こっちのけんと | `jzi6RNVEOtA` | 48구절 | 51자 | 정상 등록 (ID: `hai-yorokonde`) |
| 97 | **携帯恋話 (Keitai Renwa) - 鏡音リン & 鏡音レン** | まふまふ (cover by Earthy X6) | `HdlJxpetUvc` | 47구절 | 78자 | 정상 등록 (ID: `mafumafu-keitai-renwa`) |
| 98 | **死神は瞑目、月明かりこそがハイライト。** | Project Lumina feat. v_flower | `W-BlSr5jE9g` | 87구절 | 137자 | 정상 등록 (ID: `shinigami-wa-meimoku`) |
| 99 | **神様じゃなくてごめんね** | Aliey:S feat. 初音ミク | `OZ8qQ6GKnFE` | 49구절 | 95자 | 정상 등록 (ID: `kamisama-janakute-gomen-ne`) |
| 100 | **夕立ちゃん** | 雨の介 feat. flower | `uCR3no1sKpI` | 43구절 | 78자 | 정상 등록 (ID: `yuudachi-chan`) |
| 101 | **ロウワー (Lower)** | ぬゆり feat. 重音テトSV (cover by takaokamizuki) | `vB0edMo1kX8` | 43구절 | 118자 | 정상 등록 (ID: `takaoka-lower`) |
| 102 | **あの春を返して (Ano Haru wo Kaeshite)** | カンザキイオリ feat. 鏡音リン | `33eTF7Fa0IA` | 104구절 | 166자 | 정상 등록 (ID: `kanzaki-ano-haru-wo-kaeshite`) |
| 103 | **ハローセカイ (Hello Sekai)** | DECO*27 feat. 初音ミク | `t5U0rrj0dio` | 29구절 | 49자 | 정상 등록 (ID: `deco27-hello-sekai`) |
| 104 | **mochimochi** | TAK feat. 初音ミク | `tQM8pfwmcU0` | 69구절 | 29자 | 정상 등록 (ID: `tak-mochimochi`) |
| 105 | **レシートラスト (Receipt Last)** | いえぬ feat. 重音テト | `QVtOjH3G24U` | 67구절 | 135자 | 정상 등록 (ID: `ienu-receipt-last`) |
| 106 | **ヘリアンサス** | Aliey:S feat. 初音ミク | `K64aaWn17jk` | 57구절 | 81자 | 정상 등록 (ID: `helianthus`) |
| 107 | **ギビュリタ (Gibyurita)** | Vell feat. GUMI | `2YjKVSjdDVM` | 46구절 | 108자 | 정상 등록 (ID: `vell-gibyurita`) |
| 108 | **僕なんかいなくても (With or Without Me)** | ピノキオピー feat. 初音ミク | `A1XqqVWyUl4` | 61구절 | 119자 | 정상 등록 (ID: `pinocchiop-with-or-without-me`) |
| 109 | **ODDS & ENDS** | ryo (supercell) covered by kyaami feat. 重音テト | `R8fuPgbOhTM` | 62구절 | 121자 | 정상 등록 (ID: `kyaami-odds-and-ends-kasane-teto`) |
| 110 | **あなたのいないデスクトップ (Anata no Inai Desktop)** | 豆カカオ feat. 初音ミク | `8zpxkCgJZSk` | 50구절 | 95자 | 정상 등록 (ID: `mamekacao-desktop`) |
| 111 | **ブランディングができない** | Chinozo feat. KafU | `5qunwwaPvN8` | 38구절 | 59자 | 정상 등록 (ID: `branding-ga-dekinai`) |
| 112 | **罪と罰 (Reloaded) (Tsumi to Batsu)** | DECO*27 feat. 初音ミク | `iD3oF5HkPms` | 34구절 | 40자 | 정상 등록 (ID: `deco27-tsumi-to-batsu-reloaded`) |
| 113 | **オブソミート** | 32ki feat. 初音ミク・重音テトSV | `L2hzsXOT0Nc` | 68구절 | 191자 | 정상 등록 (ID: `obsolete-meat`) |
| 114 | **Leisure** | wotaku feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `aJBbfxlic64` | 48구절 | 53자 | 정상 등록 (ID: `wotaku-leisure`) |
| 115 | **君恋クエスト (Kimikoi Quest)** | irucaice × 市瀬るぽ feat. 初音ミク | `h3djT-YfSDQ` | 48구절 | 91자 | 정상 등록 (ID: `irucaice-rupo-kimikoi-quest`) |
| 116 | **『天使の涙』 / feat.初音ミク** | MIMI | `mCYjEWWsqZ8` | 38구절 | 61자 | 정상 등록 (ID: `mimi-tenshi-no-namida`) |
| 117 | **こたえあわせ** | TANT feat. 鏡音リン・レン | `Hfpzhlc7fdk` | 43구절 | 106자 | 정상 등록 (ID: `kotaeawase`) |
| 118 | **ユーチューバー (UTuber)** | ピノキオピー feat. 初音ミク | `lTUVw7wd5qY` | 61구절 | 71자 | 정상 등록 (ID: `pinocchiop-utuber`) |
| 119 | **ムーンガイズ (Moonguys)** | 煮ル果実 feat. 初音ミク | `dmA_M1xxo9E` | 64구절 | 117자 | 정상 등록 (ID: `nilfruits-moonguys`) |
| 120 | **WOLF** | バルーン × ヒトリエ feat. flower | `CvEvfA45nVA` | 37구절 | 56자 | 정상 등록 (ID: `balloon-hitorie-wolf`) |
| 121 | **ムウ (MW)** | 煮ル果実 feat. flower | `so8TeLqLWps` | 64구절 | 144자 | 정상 등록 (ID: `nilfruits-mw`) |
| 122 | **大人にはなれない** | Aliey:S feat. 重音テトSV | `cANncTf97w8` | 65구절 | 106자 | 정상 등록 (ID: `otona-ni-wa-narenai`) |
| 123 | **超主人公 (Super Superhero)** | ピノキオピー feat. 初音ミク | `thmR2SmkeDU` | 65구절 | 88자 | 정상 등록 (ID: `pinocchiop-super-superhero`) |
| 124 | **からっぽの久遠** | Aliey:S feat. 初音ミク | `IoAq-sqLPhg` | 70구절 | 86자 | 정상 등록 (ID: `karappo-no-kuon`) |
| 125 | **花弁、それにまつわる音声 (Kaben, Sore ni Matsuwaru Onsei)** | あばらや feat. 初音ミク | `LW1KBCgvEPQ` | 39구절 | 94자 | 정상 등록 (ID: `avaraya-kaben`) |
| 126 | **ダイダイダイダイダイキライ** | 雨良 Amala feat. 初音ミク VS 重音テト | `klIxS5o65C4` | 68구절 | 127자 | 정상 등록 (ID: `daidaidaidaidaikirai`) |
| 127 | **ファンファーレ (Fanfare)** | sumika | `7N8oan7fwfk` | 37구절 | 69자 | 정상 등록 (ID: `sumika-fanfare`) |
| 128 | **萬屋レストラン (Yorozuya Restaurant)** | 暖炉P feat. 鏡音リン, 鏡音レン, 初音ミク | `7gv4MLe1ZRg` | 39구절 | 53자 | 정상 등록 (ID: `danlop-yorozuya-restaurant`) |
| 129 | **D/N/A** | Azari feat. 重音テト, flower | `j9RGt9Z_UeE` | 39구절 | 54자 | 정상 등록 (ID: `azari-dna`) |
| 130 | **インテグラル (Integral)** | *Luna feat. 初音ミク | `gjLYd3iyPKM` | 67구절 | 98자 | 정상 등록 (ID: `luna-integral`) |
| 131 | **化けの花 (Bake no Hana)** | なきそ feat. 初音ミク | `jaSJ4t2ITW8` | 34구절 | 35자 | 정상 등록 (ID: `nakiso-bake-no-hana`) |
| 132 | **ニャルラト (Nyarlathotep)** | 藤原ハガネ feat. 重音テトSV, 初音ミク | `z1imm_yPUHI` | 40구절 | 151자 | 정상 등록 (ID: `fujiwara-nyarurato`) |
| 133 | **わたしまだBABY (Watashi Mada BABY)** | MIMI feat. 狐子 | `q8Ap-1MUTew` | 34구절 | 52자 | 정상 등록 (ID: `mimi-watashi-mada-baby`) |
| 134 | **冬晴れステップ (Fuyubare Step)** | きさら feat. 初音ミク | `BupJ_OLUBMw` | 32구절 | 62자 | 정상 등록 (ID: `kisara-fuyubare-step`) |
| 135 | **少女A (Young Girl A)** | 椎名もた feat. 鏡音リン | `AqI97zHMoQw` | 29구절 | 65자 | 정상 등록 (ID: `siinamota-young-girl-a`) |
| 136 | **Time Traveler** | EMIRI feat. 初音ミク | `MhPXMcL9PBU` | 46구절 | 62자 | 정상 등록 (ID: `emiri-time-traveler`) |
| 137 | **SHOOTING STARS** | めろくる feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `EA1H2wHa7iU` | 72구절 | 80자 | 정상 등록 (ID: `mellowcle-shooting-stars`) |
| 138 | **微熱のリリック (Binetsu no Lyric)** | MIMI feat. 重音テトSV | `qXvVt75kNmE` | 41구절 | 67자 | 정상 등록 (ID: `mimi-binetsu-no-lyric`) |
| 139 | **聖人君子でありたい** | しゃいと feat. 重音テトSV | `hrBjKBPNi1c` | 51구절 | 109자 | 정상 등록 (ID: `seijin-kunshi`) |
| 140 | **T氏の話を信じるな (Don’t Believe in T)** | ピノキオピー feat. 初音ミク・重音テト | `Jtm6ikBIl0g` | 70구절 | 92자 | 정상 등록 (ID: `pinocchiop-dont-believe-in-t`) |
| 141 | **弱虫モンブラン (Reloaded) (Yowamushi Montblanc)** | DECO*27 feat. 初音ミク | `euRzG6zmEb8` | 25구절 | 53자 | 정상 등록 (ID: `deco27-yowamushi-montblanc-reloaded`) |
| 142 | **チェリーポップ** | DECO*27 feat. 初音ミク | `BI9Ue6JwJic` | 69구절 | 48자 | 정상 등록 (ID: `cherry_pop`) |
| 143 | **イレギュラーマン** | マサラダ feat. 重音テトSV | `KOcReuSy67Y` | 60구절 | 99자 | 정상 등록 (ID: `irregular-man`) |
| 144 | **いますぐ輪廻** | なきそ feat. 初音ミク | `3iUgKH8c7p4` | 42구절 | 60자 | 정상 등록 (ID: `imasugu-rinne`) |
| 145 | **ストリートライト** | Negi Shower P feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `NPOhKU5VTrQ` | 55구절 | 110자 | 정상 등록 (ID: `negishower_streetlight`) |
| 146 | **散り散り** | 読谷あかね feat. 重音テト | `Xn-JobZlsQo` | 20구절 | 108자 | 정상 등록 (ID: `chilly`) |
| 147 | **ミカンセイニンゲン** | ミ瑞 | `P5nKiqaRo1M` | 76구절 | 77자 | 정상 등록 (ID: `mikansei-ningen`) |
| 148 | **デロデロデロデ** | cosMo＠暴走P feat. 初音ミク | `gX_EUiEdur8` | 54구절 | 73자 | 정상 등록 (ID: `deroderoderode`) |
| 149 | **アベリア** | Aliey:S | `wYlH_sR-8cA` | 86구절 | 83자 | 정상 등록 (ID: `abelia`) |
| 150 | **天天天国地獄国** | covered by 初音ミクV4X & 重音テトSV | `xSfIAqxG1OM` | 62구절 | 85자 | 정상 등록 (ID: `tentengoku`) |
| 151 | **エンパープル** | はるまきごはん | `InZ7GOU-CQ8` | 42구절 | 82자 | 정상 등록 (ID: `empurple`) |
| 152 | **成れなｲ** | 雨曇 feat. 重音テトSV, 重音テト | `7OqQ0HYPJVY` | 43구절 | 71자 | 정상 등록 (ID: `amagumori_narenai`) |
| 153 | **ルサンチマン** | Aliey:S | `vfk8bohEreg` | 56구절 | 62자 | 정상 등록 (ID: `ressentiment`) |
| 154 | **Spoken For** | FLAVOR FOLEY ft. 重音テト | `LvYL8u4p-aM` | 71구절 | 128자 | 정상 등록 (ID: `spoken_for`) |
| 155 | **エターナルアリア** | Adeliae feat. 初音ミク | `GHzCL_6v87Y` | 41구절 | 101자 | 정상 등록 (ID: `adeliae_eternal_aria`) |
| 156 | **きおくをみたの** | まかろり | `DNltbDXaKw8` | 46구절 | 90자 | 정상 등록 (ID: `kioku-o-mita-no`) |
| 157 | **DECO*27 - モニタリング (Best Friend Remix) feat. 初音ミク** | DECO*27 | `C-CYwNz3z8w` | 48구절 | 82자 | 정상 등록 (ID: `monitoring_remix`) |
| 158 | **ハピフルエンサー！ / irucaice × 市瀬るぽ × Ponchi♪ feat. 初音ミク** | irucaice / いるかアイス | `WGNLYKPuIUQ` | 56구절 | 90자 | 정상 등록 (ID: `happyfulencer`) |
| 159 | **成長痛/梵そよぎ** | Iori Kanzaki | `RXuoTY1neiU` | 63구절 | 104자 | 정상 등록 (ID: `seichoutsuu`) |
| 160 | **Écho ｢ミロワール｣ feat.初音ミク** | Écho / エコー・エトワール -Pleiades Éclat- | `un4S1RoQo7A` | 25구절 | 52자 | 정상 등록 (ID: `echo_miroir`) |
| 161 | **怪獣になりたい / Sakuzyo feat. 初音ミク** | Sakuzyo Official | `TbakFPc4ZTw` | 31구절 | 47자 | 정상 등록 (ID: `kaijuu_ni_naritai`) |
| 162 | **さざめき、とどめき、大百鬼夜行！** | netuki feat. 初音ミク | `7V8L9otIYMg` | 46구절 | 141자 | 정상 등록 (ID: `netuki_hyakkiyakou`) |
| 163 | **オデッセイ / 星界** | 織井辺コフィ / Kofi Oribe | `KjJL_8x43OA` | 49구절 | 117자 | 정상 등록 (ID: `oribe_odyssey`) |
| 164 | **超限界バスター** | ¿? feat.重音テト | `PKXJWt0Pcfs` | 59구절 | 54자 | 정상 등록 (ID: `chougenkai_buster`) |
| 165 | **スマート???** | まらしぃ feat.鏡音リン | `xDuxw1rsNWo` | 59구절 | 86자 | 정상 등록 (ID: `marasy_smart`) |
| 166 | **全部夢だった！** | 黒うさぎ feat.重音テトSV | `z13hzDHruo8` | 32구절 | 50자 | 정상 등록 (ID: `zenbu_yume_datta`) |
| 167 | **初音ミクシンフォニー10thテーマ曲『プレイオン』** | Mitchie M feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `CXkY-vWeuRI` | 60구절 | 119자 | 정상 등록 (ID: `mitchie_m_playon`) |
| 168 | **彗星ノ銀河** | マツシタレオ feat. 初音ミク | `HDwPGObRmXE` | 31구절 | 77자 | 정상 등록 (ID: `suisei_no_ginga`) |
| 169 | **ネバーランド** | DECO*27 feat. 初音ミク | `48Csilkjev0` | 55구절 | 66자 | 정상 등록 (ID: `deco27_neverland`) |
| 170 | **ドクヘビ** | かめりあ feat. 初音ミク | `n1q-R6iNxRE` | 70구절 | 134자 | 정상 등록 (ID: `camellia_dokuhebi`) |
| 171 | **アイアイ傘** | ハム feat. 雨衣 | `e5_XSeN9Y4k` | 35구절 | 65자 | 정상 등록 (ID: `ham_aiaigasa`) |
| 172 | **Vermillion** | sumika | `Epd7n5fqoNw` | 53구절 | 95자 | 정상 등록 (ID: `sumika_vermillion`) |
| 173 | **あんたは死んだ** | カンザキイオリ feat. 重音テトSV | `bKA5FxTBujA` | 67구절 | 100자 | 정상 등록 (ID: `kanzaki_anta_wa_shinda`) |
| 174 | **不死身ごっこ** | ピノキオピー feat. 初音ミク | `hCc0iI8jdQU` | 81구절 | 90자 | 정상 등록 (ID: `pinocchiop_fujimi_gokko`) |
| 175 | **HoYoHoYoにしてあげる♪** | 初音ミク × 銀狼 | `A7KbelltKEM` | 30구절 | 33자 | 정상 등록 (ID: `miku_silverwolf_hoyohoyo`) |
| 176 | **Silent Glory** | スペクタクルP feat. VY1 | `ZD7e1uwWlXY` | 50구절 | 115자 | 정상 등록 (ID: `spectaclep_silent_glory`) |
| 177 | **愛言葉V** | DECO*27 feat. 初音ミク | `hK82hfN_ymQ` | 57구절 | 53자 | 정상 등록 (ID: `deco27_aikotoba_v`) |
| 178 | **，星** | マキシウキョウ feat. 重音テトSV | `ccPSQVPk1P4` | 34구절 | 46자 | 정상 등록 (ID: `makishiukyou_hoshi`) |
| 179 | **Romantic** | SEKAI NO OWARI | `iUUZPdV_fto` | 39구절 | 80자 | 정상 등록 (ID: `sekai_no_owari_romantic`) |
| 180 | **リリィアラート** | 雄之助 feat. 初音ミク | `QeXz9WqRED4` | 49구절 | 129자 | 정상 등록 (ID: `yunosuke_lily_alert`) |
| 181 | **ダンロウグモ** | halyosy ft. KAITO, 鏡音レン | `7qAAg5WeB20` | 64구절 | 150자 | 정상 등록 (ID: `halyosy_danrougumo`) |
| 182 | **マシュマロ** | DECO*27 feat. 初音ミク | `ZIzEnTdR368` | 54구절 | 74자 | 정상 등록 (ID: `deco27_marshmallow`) |
| 183 | **タイムイズマイン** | 真島ゆろ feat. 重音テト | `NxXIm8IbeVk` | 151구절 | 93자 | 정상 등록 (ID: `majima_yuro_time_is_mine`) |
| 184 | **tig-hug** | sasakure.UK feat. GUMI | `AO81V78Dtwo` | 52구절 | 74자 | 정상 등록 (ID: `sasakure_tig_hug`) |
| 185 | **Leucocoryne** | ryuryu feat. 初音ミク | `fFitoGwCITo` | 28구절 | 75자 | 정상 등록 (ID: `leucocoryne`) |
| 186 | **パレードレコード (Parade Record)** | きさら feat. 初音ミク | `z7UF260NtyU` | 72구절 | 110자 | 정상 등록 (ID: `kisara_parade_record`) |
| 187 | **バカみたいじゃん (Baka Mitai jan)** | あくたり (Aktari) feat. 重音テトSV | `2CnLNnY5QME` | 39구절 | 55자 | 정상 등록 (ID: `aktari_baka_mitai_jan`) |
| 188 | **Blusher (臙脂)** | om feat. 重音テト | `9HUMT9F7baM` | 48구절 | 80자 | 정상 등록 (ID: `om_blusher`) |
| 189 | **星降るココロ (Hoshifuru Kokoro)** | MIMI feat. 初音ミク | `Mb9TWJm_5L4` | 21구절 | 51자 | 정상 등록 (ID: `mimi_hoshifuru_kokoro`) |
| 190 | **Pain** | めろくる (Mellowcle) feat. 初音ミク | `X2CFrEDiDyY` | 53구절 | 70자 | 정상 등록 (ID: `mellowcle_pain`) |
| 191 | **シスターシスター** | せきこみごはん feat. 初音ミク | `AvctZU1E_7Q` | 38구절 | 83자 | 정상 등록 (ID: `sekikomigohan_sister_sister`) |
| 192 | **回生** | ゆくえわっと feat. 健音テイ, 暗鳴ニュイ, 湯鬱声からす | `U0YMFCYVzCI` | 41구절 | 83자 | 정상 등록 (ID: `yukuewat_kaisei`) |
| 193 | **あたしの廃園** | 溝野あわ feat. 重音テトSV | `xYJkF7EMyP8` | 35구절 | 47자 | 정상 등록 (ID: `mizonoawa_atashi_no_haien`) |
| 194 | **マジカル☆ミラクル☆メタギャルフォーゼ** | ふるーり feat. 重音テトSV | `WYTSF1soBZs` | 60구절 | 108자 | 정상 등록 (ID: `fururi_metagalpose`) |
| 195 | **ジェヘナ (Gehenna)** | Earthy X6 (Cover) [wotaku feat. 巡音ルカ, MEIKO, KAITO] | `seXI1A6tMmA` | 54구절 | 121자 | 정상 등록 (ID: `earthy_x6_gehenna`) |
| 196 | **Boo!Boo!エトランゼ** | きさら feat. v flower & Ci flower | `VHmrMK5K2aY` | 51구절 | 65자 | 정상 등록 (ID: `kisara_booboo_etranger`) |
| 197 | **トレジャーガーデン (Treasure Garden)** | Ponchi♪ feat. 初音ミク | `RIpHyjsv_84` | 47구절 | 44자 | 정상 등록 (ID: `ponchi_treasure_garden`) |
| 198 | **MEGANE GIRL MEGANE BOY** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン・鏡音レン | `la6_f-oUFHE` | 58구절 | 78자 | 정상 등록 (ID: `wanopo_megane_girl_megane_boy`) |
| 199 | **ポリビュー (polyview)** | いえぬ feat. 初音ミク | `6HSKCce8abM` | 35구절 | 73자 | 정상 등록 (ID: `ienu_polyview`) |
| 200 | **空奏ジャンプ** | ナナホシ管弦楽団 feat. 初音ミク | `5qMb-ZGmT1w` | 47구절 | 84자 | 정상 등록 (ID: `nanahoshi_kuusou_jump`) |
| 201 | **にゅー！支配者のキャロル** | 藤原ハガネ feat. 里石ユカ | `UnlgVoWd7hI` | 45구절 | 121자 | 정상 등록 (ID: `fujiwara_carol`) |
| 202 | **まだ知らない君がいる！** | 椎乃味醂 feat. 初音ミク･重音テト | `gSPhL4esZMM` | 55구절 | 89자 | 정상 등록 (ID: `sheeno_mada_shiranai_kimi_ga_iru`) |
| 203 | **だまってちゃん** | Chinozo feat. 重音テト | `uOeOZQ5eCZ0` | 48구절 | 68자 | 정상 등록 (ID: `chinozo_damatte_chan`) |
| 204 | **ファイアঌフライ** | 煮ル果実 × いよわ feat. v flower | `c8cjlEivOuA` | 67구절 | 135자 | 정상 등록 (ID: `nilfruits_iyowa_firefly`) |
| 205 | **TWINKLE** | めろくる feat. MEIKO, 巡音ルカ | `4KdnNMqDPj8` | 63구절 | 64자 | 정상 등록 (ID: `mellowcle_twinkle`) |
| 206 | **ドラゴンブレイン** | Chenomio feat. 重音テト | `mjWqXU6z2vM` | 35구절 | 91자 | 정상 등록 (ID: `chenomio_dragon_brain`) |
| 207 | **死別** | シャノン feat. GUMI | `6Fm-wW_57FY` | 31구절 | 41자 | 정상 등록 (ID: `shannon_shibetsu`) |
| 208 | **お呪い** | なきそ feat. 花隈千冬 | `zxYdPypVQvQ` | 42구절 | 27자 | 정상 등록 (ID: `nakiso_omajinai`) |
| 209 | **夜明けと蛍** | n-buna feat. IA | `3Hh2XpL1P0Q` | 32구절 | 70자 | 정상 등록 (ID: `nbuna_yoake_to_hotaru`) |
| 210 | **わんぬ** | なみぐる feat. 夏色花梨, ずんだもん | `ukb5OpLHX8Q` | 72구절 | 68자 | 정상 등록 (ID: `namigroove_wannu`) |
| 211 | **求＆影(Q&A)** | ぴーなた feat. 重音テト | `M40MIxGK3is` | 99구절 | 163자 | 정상 등록 (ID: `pinata_q_and_a`) |
| 212 | **ワイプ・アウターズ** | Negi Shower P / ネギシャワーP feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `lgn3lZRq8oI` | 46구절 | 119자 | 정상 등록 (ID: `negishowerp_wipe_outers`) |
| 213 | **ZOMBIEEEEE!!!** | ふるーり feat. 初音ミク & 重音テトSV | `MjHSh-nJBl0` | 80구절 | 109자 | 정상 등록 (ID: `fleuri_zombieeeee`) |
| 214 | **UNFADING** | MIMI feat. 初音ミク | `uUB2qgVBBjY` | 63구절 | 111자 | 정상 등록 (ID: `mimi_unfading`) |
| 215 | **君の数十センチ下の世界** | Adeliae feat. 可不 | `fFuj6p2tcIs` | 42구절 | 77자 | 정상 등록 (ID: `adeliae_kimi_no_suujyuu_cm`) |
| 216 | **ノマドワーカー** | Adeliae feat. 初音ミク・可不・雨衣・重音テト | `97YEaK5uxak` | 51구절 | 130자 | 정상 등록 (ID: `adeliae_nomad_worker`) |
| 217 | **茜の鼓動** | MIMI feat. 初音ミク | `dgkP8RQw-sQ` | 42구절 | 107자 | 정상 등록 (ID: `mimi_akane_no_kodou`) |
| 218 | **Beautiful** | めろくる feat. 巡音ルカ | `wGTy_Ly9Msk` | 56구절 | 57자 | 정상 등록 (ID: `mellowcle_beautiful`) |
| 219 | **ファニー・インシピッド・キャンディ・ベンダー** | 煮ル果実 feat. flower | `izZiAkwMP2M` | 72구절 | 200자 | 정상 등록 (ID: `nilfruits_funny_insipid_candy_vendor`) |
| 220 | **愛し愛** | MIMI feat. 初音ミク ・ 可不 | `xQYp4-Ett6A` | 66구절 | 68자 | 정상 등록 (ID: `mimi_aishi_ai`) |
| 221 | **わたしマニュアル** | MIMI feat. 可不 | `hupkoU8e1is` | 37구절 | 42자 | 정상 등록 (ID: `mimi_watashi_manual`) |
| 222 | **Snow Flakes** | めろくる feat. 巡音ルカ&KAITO | `YIACdHQ5BW8` | 47구절 | 81자 | 정상 등록 (ID: `mellowcle_snow_flakes`) |
| 223 | **アワーオース** | Chinozo feat. FloweR, KafU | `g_COlOBAV7I` | 30구절 | 66자 | 정상 등록 (ID: `chinozo_our_oath`) |
| 224 | **ダダダダダル (Dadadadadaru)** | 雨良 feat. 初音ミクVS重音テト | `CgxOQjYBmss` | 72구절 | 125자 | 정상 등록 (ID: `amala_dadadadadaru`) |
| 225 | **ド七五サンバ** | なみぐる feat. 重音テトSV | `-6WgX8_iyR0` | 102구절 | 22자 | 정상 등록 (ID: `namigroove_doshichigo_samba`) |
| 226 | **はちゃめちゃカーニバル (Hachamecha Carnival)** | Tonbi feat. 鏡音リン・レン | `qVjQ8qMTsTs` | 59구절 | 86자 | 정상 등록 (ID: `tonbi_hachamecha_carnival`) |
| 227 | **ミルキースター (Milky Star)** | もちゆ feat. 初音ミク | `JpQoU81MbWQ` | 66구절 | 104자 | 정상 등록 (ID: `mochiyu_milky_star`) |
| 228 | **ブラフマン (Bluffman)** | 煮ル果実 with 梵そよぎ | `Iz5_kFY0pi8` | 53구절 | 115자 | 정상 등록 (ID: `nilfruits_bluffman`) |
| 229 | **天国 (Heaven - long ver.)** | ひらぎ feat. 初音ミク | `245PLOBDZBM` | 42구절 | 98자 | 정상 등록 (ID: `hiragi_tengoku`) |
| 230 | **終身恋用契約 (Lifetime Loveployment Contract)** | めろくる feat. 夏色花梨 | `gym49-mEvHI` | 74구절 | 106자 | 정상 등록 (ID: `mellowcle_shuushin_renyou_keiyaku`) |
| 231 | **ラプス (Lapse)** | kr-KuuRa feat. 初音ミク | `v0JcLyWZxXc` | 34구절 | 66자 | 정상 등록 (ID: `kuura_lapse`) |
| 232 | **コムギノフネ (The Wheat Ship)** | いえぬ / ienu feat. 初音ミク | `dwKxDNyE524` | 51구절 | 84자 | 정상 등록 (ID: `ienu_komuginofune`) |
| 233 | **クラックラッカ (Cracklucka)** | きさら - KISARA feat. 初音ミク | `CYWn8M6u-6E` | 85구절 | 114자 | 정상 등록 (ID: `kisara_cracklucka`) |
| 234 | **星界ちゃんの角瓶ガブ飲み暴騒曲** | 南ノ南 feat. 星界 | `wfYxIaOuK6k` | 90구절 | 24자 | 정상 등록 (ID: `minaminominami_seikaichan_kakubin`) |
| 235 | **ミクちゃんのはぴはぴふぃーばー祭囃曲** | 南ノ南 feat. 初音ミク | `CqHEQbdy-XQ` | 42구절 | 55자 | 정상 등록 (ID: `minaminominami_mikuchan_hapihapi`) |
| 236 | **天球の旅人** | 木瀬のん feat. 音街ウナ | `vaDlwX1eRD4` | 39구절 | 85자 | 정상 등록 (ID: `kisenon_tenkyuu_no_tabibito`) |
| 237 | **MR.DANCE** | めろくる feat. 初音ミク＆鏡音リン | `5OfsQZflhz0` | 54구절 | 48자 | 정상 등록 (ID: `mellowcle_mr_dance`) |
| 238 | **Do not tap** | Shü feat. 重音テトSV・音街ウナSV | `rMlC5UQM9qI` | 40구절 | 103자 | 정상 등록 (ID: `do-not-tap`) |
| 239 | **ウニ** | Adeliae feat. 雨衣 | `fi3YjlKlpRU` | 38구절 | 77자 | 정상 등록 (ID: `adeliae-uni`) |
| 240 | **目撃！テト31世** | はろける feat. 雨衣・重音テト | `uWMr16O_Aso` | 56구절 | 43자 | 정상 등록 (ID: `mokugeki-teto-31-sei`) |
| 241 | **カートゥーンガール** | Kanaria feat. GUMI | `BY7CnLX5Mk0` | 24구절 | 22자 | 정상 등록 (ID: `cartoon-girl`) |
| 242 | **だれかぬいてくれ** | ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ feat. 音街ウナSV & タカハシアマト | `VgLNfVougpI` | 61구절 | 42자 | 정상 등록 (ID: `dareka-nuite-kure`) |
| 243 | **キネティックタウン** | 晴いちばん feat. 初音ミク | `AdT_lmdC39g` | 29구절 | 73자 | 정상 등록 (ID: `kinetic-town`) |
| 244 | **死神は瞑目、月明かりこそがハイライト。 (Aliey:S Remix)** | Project Lumina - Aliey:S Remix feat. 初音ミク | `DOai_KjDGh0` | 88구절 | 137자 | 정상 등록 (ID: `shinigami-wa-meimoku-remix`) |
| 245 | **ぐるぐる** | OLDUCT feat. 歌愛ユキ & 初音ミク | `ympFwEAUqc0` | 65구절 | 23자 | 정상 등록 (ID: `olduct-guruguru`) |
| 246 | **けっかおーらい** | こっちのけんと | `Ug0N4qGRp_w` | 70구절 | 86자 | 정상 등록 (ID: `kocchi-kekka-orai`) |
| 247 | **やる気が出ない歌** | えいぷ feat. 初音ミク・重音テト | `xAwnI9AraXs` | 85구절 | 119자 | 정상 등록 (ID: `eipu-yaruki-ga-denai-uta`) |
| 248 | **ずんだタコヤーキ** | なみぐる feat. ずんだもん・琴葉茜 | `pbb7EQx-7tA` | 71구절 | 40자 | 정상 등록 (ID: `namigroove-zunda-takoyaaki`) |
| 249 | **メルトアイスクリーム** | TRAP CHICK feat. 初音ミク・重音テト | `aDA1B_We5w8` | 51구절 | 81자 | 정상 등록 (ID: `trapchick-melt-ice-cream`) |
| 250 | **Pretender** | Official髭男dism | `TQ8WlA2GXbk` | 52구절 | 96자 | 정상 등록 (ID: `higedan-pretender`) |
| 251 | **スプリットダンス** | えいぷ feat. 初音ミク・重音テト | `R401j1QAvEg` | 58구절 | 116자 | 정상 등록 (ID: `eipu-split-dance`) |
| 252 | **地獄行きの列車に乗ってさらば！** | Aliey:S feat. 初音ミク | `oz-NYTQXA9o` | 95구절 | 106자 | 정상 등록 (ID: `alieys-jigoku-yuki-no-ressha`) |
| 253 | **次元通信 (Signaling)** | AnythingBecomeMoe feat. 初音ミク・重音テト | `PqpCRSOUuIE` | 56구절 | 103자 | 정상 등록 (ID: `abm-signaling`) |
| 254 | **杏仁dope** | なみぐる feat. 可不 | `fFL9NeOF7XM` | 83구절 | 75자 | 정상 등록 (ID: `namigroove-annin-dope`) |
| 255 | **バゥムクゥヘン・エンドロゥル** | 雨良 feat. 初音ミクVS重音テトVS亞北ネル | `Dz5rALpx06M` | 51구절 | 114자 | 정상 등록 (ID: `amala-baumkuchen-end-roll`) |
| 256 | **ループザルーム** | ルシノ feat. 初音ミク | `icBDYkfxpMs` | 42구절 | 48자 | 정상 등록 (ID: `rusino-loop-the-room`) |
| 257 | **桜日和とタイムマシン with 初音ミク** | Ado with 初音ミク | `nIWZfhpnq6M` | 35구절 | 76자 | 정상 등록 (ID: `ado-sakurabiyori-to-time-machine`) |
| 258 | **妄想アスパルテーム** | picco feat. 初音ミク | `36LsS8T5RHE` | 53구절 | 65자 | 정상 등록 (ID: `picco-mousou-aspartame`) |
| 259 | **トリックハート** | MIMI feat. 重音テトSV | `uoYegcqyfxE` | 40구절 | 67자 | 정상 등록 (ID: `mimi-trick-heart`) |
| 260 | **弱者のマーチ** | えいぷ feat. 重音テト | `IxSvgPhdc8c` | 62구절 | 144자 | 정상 등록 (ID: `eipu-jakusha-no-march`) |
| 261 | **とろいめもりー** | 豆カカオ feat. 初音ミク | `92gM1Kqm8n8` | 57구절 | 130자 | 정상 등록 (ID: `mamekakao-trois-memory`) |
| 262 | **それもいいね** | こっちのけんと | `URHwwFNdJ5Y` | 36구절 | 39자 | 정상 등록 (ID: `kocchinokento-sore-mo-ii-ne`) |
| 263 | **どこにもいかない** | マサラダ feat. 雨衣 | `xJULqAHbst0` | 29구절 | 32자 | 정상 등록 (ID: `masarada-dokonimo-ikanai`) |
| 264 | **ぼくはそれで委員会!** | 薄塩指数 ft. 重音テトSV | `fReNcRnVnS8` | 36구절 | 54자 | 정상 등록 (ID: `usushioshisuu-boku-wa-sore-de-iinkai`) |
| 265 | **命辛辛** | 煮ル果実 feat. v flower | `QTxvUA4l0Vs` | 53구절 | 145자 | 정상 등록 (ID: `nilfruits-inochigaragara`) |
| 266 | **花びら哀歌** | MIMI feat. 重音テトSV | `IxVFW1XIW7Q` | 27구절 | 53자 | 정상 등록 (ID: `mimi-hanabira-aika`) |
| 267 | **流季想** | Project Lumina feat. 初音ミク | `Z0iDS-m2uW4` | 61구절 | 66자 | 정상 등록 (ID: `project-lumina-ryukisou`) |
| 268 | **だ・し・て** | はろける feat. 初音ミク & 重音テトSV | `c4UFhgGrRCk` | 57구절 | 69자 | 정상 등록 (ID: `harokeru-da-shi-te`) |
| 269 | **アンチドリームロマンチスト** | テンタクル忍者 feat. 初音ミク | `kRTcFyjvUtE` | 72구절 | 82자 | 정상 등록 (ID: `tentacle-ninja-anti-dream-romanticist`) |
| 270 | **廾冫├″/ヽ″ッ勹″ (サンドバッグ)** | dada feat. 音街ウナ, 重音テト | `eN8v1mDWwYM` | 39구절 | 64자 | 정상 등록 (ID: `dada-sandbag`) |
| 271 | **奇怪な踊りをしたせいで…** | かてらざわ feat. 重音テト & ずんだもん | `K_7PFyNDa6A` | 52구절 | 95자 | 정상 등록 (ID: `katerazawa-kikaina-odori-wo-shita-seide`) |
| 272 | **潜水花** | ねじ式 feat. 初音ミク | `r-Hrngs7Skw` | 33구절 | 82자 | 정상 등록 (ID: `nejishiki-sensuika`) |
| 273 | **はやくにげなきゃ** | 佐藤ちなみに feat. 初音ミク・雨衣 | `Xl9ygHR9MxM` | 40구절 | 78자 | 정상 등록 (ID: `sato-chinamini-hayaku-nigenakya`) |
| 274 | **死について** | シャノン feat. GUMI | `3rN0hgnuKig` | 37구절 | 55자 | 정상 등록 (ID: `shannon-shi-ni-tsuite`) |
| 275 | **メルト CPK! Remix (初音ミク ver.)** | ryo (supercell) feat. 初音ミク | `XRymkHlMB-k` | 34구절 | 64자 | 정상 등록 (ID: `ryo-supercell-melt-cpk-remix`) |
| 276 | **あの子みたいに** | 柏木カレキ feat. 重音テト＆知声 | `uUreb0bRlTY` | 27구절 | 45자 | 정상 등록 (ID: `kareki-kashiwagi-ano-ko-mitai-ni`) |
| 277 | **『ぴょん』** | MIMI feat. 初音ミク＆重音テトSV | `1EevjGF2nuU` | 60구절 | 57자 | 정상 등록 (ID: `mimi-pyon`) |
| 278 | **でぃすこみゅーたんと！** | ナユタン星人 feat. 初音ミク | `xAEuACHA_QU` | 85구절 | 87자 | 정상 등록 (ID: `nayutalien-discomutant`) |
| 279 | **特別救済委員会** | サツキ (32ki) feat. 初音ミク・GUMI・IA・Flower・可不・重音テトSV | `qbm1nn9yoSc` | 71구절 | 171자 | 정상 등록 (ID: `satsuki-tokubetsu-kyuusai-iinkai`) |
| 280 | **ゆめみしんごうき** | ミ瑞 feat. 初音ミク | `MDa9rG2Ly8I` | 41구절 | 63자 | 정상 등록 (ID: `mimizu-yumemi-shingouki`) |
| 281 | **こわれちゃった！！** | タケノコ少年 feat. 初音ミク | `XEvoptb8x8U` | 43구절 | 65자 | 정상 등록 (ID: `takenoko-shounen-kowarechatta`) |
| 282 | **『 柔く、ほどいて 』** | MIMI feat. 初音ミク＆重音テトSV | `-2FCAZLhh-Y` | 41구절 | 84자 | 정상 등록 (ID: `mimi-yawaraku-hodoite`) |
| 283 | **ミィハー** | Chinozo feat.Tet0 | `oePX92KTE_M` | 44구절 | 58자 | 정상 등록 (ID: `chinozo_miihaa`) |
| 284 | **愛迷エレジー (Reloaded)** | DECO*27 feat. 初音ミク | `ZTlH8A79xFg` | 23구절 | 76자 | 정상 등록 (ID: `deco27_aimai_elegy`) |
| 285 | **B.B.M.** | PAS TASTA ft. ピノキオピー | `ZpsLVASQ3yQ` | 55구절 | 94자 | 정상 등록 (ID: `pas_tasta_bbm`) |
| 286 | **サマフェスタ** | あくたり (Aktari) feat. 初音ミク | `FBecwwAOojs` | 35구절 | 50자 | 정상 등록 (ID: `aktari_summer_festa`) |
| 287 | **ボクラノ色で駆けて征け！** | Sounds Color Orchestra feat. 蒼い鍵盤 | `m81AD20Y_w4` | 73구절 | 85자 | 정상 등록 (ID: `blue_keyboard_bokurano_iro_de`) |
| 288 | **歌姫失格** | ピノキオピー feat. 初音ミク | `adE8jVLoLPo` | 88구절 | 112자 | 정상 등록 (ID: `pinocchiop_rejected_diva`) |
| 289 | **ミルコメダ** | まらしぃ (marasy) feat. 初音ミク | `dJR7qnqEIuU` | 44구절 | 75자 | 정상 등록 (ID: `marasy_milkomeda`) |
| 290 | **Star Crew** | dezzy(一億円P) feat. IA | `s5GARyATYus` | 33구절 | 70자 | 정상 등록 (ID: `dezzy_star_crew`) |
| 291 | **ラブパラ feat. 初音ミク** | DECO*27 | `RgVLBtRLX9k` | 52구절 | 57자 | 정상 등록 (ID: `deco27_love_para`) |
| 292 | **ストリーミングダンサー / 梵そよぎ** | Iori Kanzaki | `RpsbehcPU3w` | 78구절 | 81자 | 정상 등록 (ID: `kanzaki_streaming_dancer`) |
| 293 | **吸血鬼/重音テトSV&GUMI** | Iori Kanzaki | `jZkDWFzLNxE` | 57구절 | 117자 | 정상 등록 (ID: `kanzaki_kyuuketsuki`) |
| 294 | **怪盗ハッチさん / 巡音ルカ** | 謎J | `lXWsJEoBHPU` | 88구절 | 177자 | 정상 등록 (ID: `nazoj_kaito_hatchi_san`) |
| 295 | **一人脳内反省会 / 重音テト** | 真島ゆろ | `BH3RXq2MTPM` | 44구절 | 104자 | 정상 등록 (ID: `majima_yuro_hitori_nounai_hanseikai`) |
| 296 | **FANTASY★DiSCO NIGHT ft. Miku Hatsune** | SAWTOWNE | `_t3XkHDrH-o` | 70구절 | 62자 | 정상 등록 (ID: `sawtowne_fantasy_disco_night`) |
| 297 | **Side Quest King (KISAI remix) feat. 初音ミク【崩壊：スターレイル 3周年テーマソング】** | Hatsune Miku | `WSDSWdIt3jY` | 45구절 | 81자 | 정상 등록 (ID: `miku_side_quest_king`) |
| 298 | **dezzy(一億円P)  - エバーグリーン feat.IA** | dezzy(一億円P) | `zGVxMbny1Dw` | 52구절 | 73자 | 정상 등록 (ID: `dezzy_evergreen`) |
| 299 | **バースデイ / 可不** | 内緒のピアス feat. 可不 | `mA5cl5tYHaQ` | 56구절 | 51자 | 정상 등록 (ID: `02-vocaloid-baasudei-ka-fu`) |
| 300 | **カニカーニバル！ / MendoZID feat.初音ミク x 音街ウナ x ずんだもん** | MendoZID / ジッドP | `GYWJlo6ILX4` | 56구절 | 65자 | 정상 등록 (ID: `03-mendozid-kanikaanibaru-mendozid-hatsune-miku`) |
| 301 | **踊っチャイナ / 初音ミク, 重音テトSV** | Atena | `3-kI9rDwQ8E` | 58구절 | 107자 | 정상 등록 (ID: `04-atena-odotsu-chaina-hatsune-miku`) |
| 302 | **スパイシーウィッチクラフト / 初音ミク** | しゃいと | `lDaNU5aKHSo` | 63구절 | 81자 | 정상 등록 (ID: `05-vocaloid-supaishiiuitchikurafuto-hatsune-miku`) |
| 303 | **九龍ストレイドッグ / 宮守文学 feat.鏡音リン, 鏡音レン** | Miyamori Bungaku Official | `l96zCG1LKE8` | 65구절 | 172자 | 정상 등록 (ID: `06-miyamori-bungaku-kyuuryuu-sutoreidoggu-miyamori-bu`) |
| 304 | **エス / 可不** | 内緒のピアス feat. 可不 | `XuVCgVWI7_k` | 56구절 | 55자 | 정상 등록 (ID: `07-vocaloid-esu-ka-fu`) |
| 305 | **[MV] TAK - ‘孤独サイコ (Psycho Mode)’ feat. 初音ミク** | TAK / DORIDORI | `xdNIO7WudEw` | 79구절 | 40자 | 정상 등록 (ID: `08-tak-doridori-tak-kodoku-saiko-psycho`) |
| 306 | **鬼の首／沫尾 feat. KAITO SP & 重音テト SV (Ogre's Head / Matsubi feat. KAITO SP & Kasane Teto SV)** | 沫尾 feat. KAITO | `_96tm3VPXCw` | 71구절 | 188자 | 정상 등록 (ID: `09-kaito-oni-no-kubi-matsu`) |
| 307 | **不器用な人 feat.可不・鏡音リン / エイハブ** | エイハブ / AHUB | `Y5Uu7V_zJ2g` | 55구절 | 86자 | 정상 등록 (ID: `10-ahub-bukiyou-na-nin-ka`) |
| 308 | **サバ！サマー！サンバ！ / MendoZID feat.初音ミク x 音街ウナ x ずんだもん** | MendoZID / ジッドP | `_V7exqRUGog` | 95구절 | 73자 | 정상 등록 (ID: `14-mendozid-saba-samaa-sanba-mendozid`) |
| 309 | **ドリーミング☆パレード / MendoZID feat.初音ミク** | MendoZID / ジッドP | `IAgP0E2bQ1I` | 57구절 | 75자 | 정상 등록 (ID: `15-mendozid-doriimingu-pareedo-mendozid-hatsune`) |
| 310 | **米津玄師  Kenshi Yonezu - IRIS OUT** | Kenshi Yonezu  米津玄師 | `LmZD-TU96q4` | 41구절 | 74자 | 정상 등록 (ID: `17-kenshi-yonezu-yonetsu-gen-shi-kenshi`) |
| 311 | **ZICO (지코), Lilas (YOASOBI’s ikura) ‘DUET’ Official MV** | HYBE LABELS | `sssoyDLFPWE` | 59구절 | 69자 | 정상 등록 (ID: `19-hybe-labels-zico-lilas-yoasobi-s`) |
| 312 | **レビテト / LOL feat. 重音テトSV** | PPP Sounds | `_J_hTrOT8LA` | 38구절 | 58자 | 정상 등록 (ID: `20-ppp-sounds-rebiteto-lol-juuon-teto`) |
| 313 | **처형박수 (Execution Clap) / 카사네 테토** | TRAP CHICK 트랩칙 | `YcxhmHEykPg` | 79구절 | 91자 | 정상 등록 (ID: `21-trap-chick-execution-clap`) |
| 314 | **月が綺麗ねと言われたい！／初音ミク** | カササギ | `B3IClmMbH6w` | 23구절 | 44자 | 정상 등록 (ID: `22-vocaloid-gatsu-ka-kirei-neto`) |
| 315 | **i think i think too much / 初音ミク** | Parang | `n3bh2zDN4zs` | 79구절 | 20자 | 정상 등록 (ID: `23-parang-i-think-i-think`) |
| 316 | **Chenomio - お願いドクター！ feat.重音テト** | Chenomio | `b5b49Vu-9SM` | 36구절 | 63자 | 정상 등록 (ID: `27-chenomio-chenomio-o-negai-dokutaa`) |
| 317 | **Creepy Nuts｢Bling-Bang-Bang-Born｣ × TV Anime｢マッシュル-MASHLE-｣ Collaboration Music Video #BBBBダンス** | Creepy Nuts | `mLW35YMzELE` | 65구절 | 135자 | 정상 등록 (ID: `28-creepy-nuts-creepy-nuts-creepy-nuts`) |
| 318 | **フレデリック「オドループ」Music Video &#124; Frederic "oddloop"** | FREDERIC official | `PCp2iXA1uLE` | 53구절 | 47자 | 정상 등록 (ID: `29-frederic-furederikku-odoruupu-music-video`) |
| 319 | **グルメサメ / MendoZID feat.重音テト x 足立レイ** | MendoZID / ジッドP | `Vs8zsIolbVw` | 53구절 | 75자 | 정상 등록 (ID: `30-mendozid-gurumesame-mendozid-juuon-teto`) |
| 320 | **Azari - Sell a Friend / 重音テト** | Azari | `yJ1hNjuAKtM` | 49구절 | 43자 | 정상 등록 (ID: `31-azari-azari-sell-a-friend`) |
| 321 | **全部壊しちゃえ！ - 柏木カレキ feat. 重音テト＆知声 / Break It All - Kareki Kashiwagi feat. Teto&Chis-A** | 柏木カレキ / Kareki Kashiwagi | `ZECBBJi3s6I` | 20구절 | 42자 | 정상 등록 (ID: `32-kareki-kashiwagi-zenbu-kowashi-chae-kashiwagi`) |
| 322 | **Mrs. GREEN APPLE - インフェルノ（Inferno）** | Mrs. GREEN APPLE | `wfCcs0vLysk` | 43구절 | 101자 | 정상 등록 (ID: `33-mrs-green-mrs-green-apple-inferuno`) |
| 323 | **Unlucky Dream by Parang (Official MV)** | Parang | `LXUnrMLrXKU` | 76구절 | 74자 | 정상 등록 (ID: `34-parang-unlucky-dream-by-parang`) |
| 324 | **クリーチャー / サツキ×大漠波新×吉田夜世 feat. 初音ミク・重音テトSV** | サツキ × 大漠波新 × 吉田夜世 feat. 初音ミク・重音テトSV | `dHo5bqtnJEI` | 54구절 | 163자 | 정상 등록 (ID: `35-32ki-kuriichaa-satsuki-x-taibaku`) |
| 325 | **マチアプリンセス / 雨衣・玉姫** | 吉本おじさん | `ngVPf_NMLkw` | 108구절 | 89자 | 정상 등록 (ID: `36-vocaloid-machiapurinsesu-amai-tamahime`) |
| 326 | **とびだせ！わんだぴょい / なみぐる feat.ずんだもん 鏡音リン** | namigroove | `Eb6iBq0zNZg` | 53구절 | 57자 | 정상 등록 (ID: `37-namigroove-tobidase-wandapyoi-namiguru-zundamon`) |
| 327 | **セーブアンドロード feat.初音ミク / save and load ft. Hatsune Miku** | rumaki | `Xeq3nRhIczs` | 43구절 | 87자 | 정상 등록 (ID: `38-rumaki-seebuandoroodo-hatsune-miku-save`) |
| 328 | **BOMB!! 熱熱 / 初音ミク** | Parang | `9q1owbmAJlM` | 73구절 | 49자 | 정상 등록 (ID: `39-parang-bomb-atsuatsu-hatsune-miku`) |
| 329 | **ボーカロイドボサノバメドレーⅡ/feat.初音ミク** | kahimi Official Channel | `v4LNEhYN82U` | 173구절 | 283자 | 정상 등록 (ID: `40-kahimi-channel-bookaroidobosanobamedoree-hatsune-m`) |
| 330 | **カオスホットポット！ / 初音ミク** | しゃいと | `qIQKzA5pW2Y` | 52구절 | 85자 | 정상 등록 (ID: `41-vocaloid-kaosuhottopotto-hatsune-miku`) |
| 331 | **[MV] TAK - ‘numb numb’ feat. 初音ミク、重音テト** | TAK / DORIDORI | `ba7YbGO2aq4` | 65구절 | 35자 | 정상 등록 (ID: `42-tak-doridori-tak-numb-numb-hatsune`) |
| 332 | **ヨルシカ - 千鳥（OFFICIAL VIDEO）** | ヨルシカ / n-buna Official | `t75qlQPXJGw` | 38구절 | 58자 | 정상 등록 (ID: `43-n-buna-yorushika-chidori-video`) |
| 333 | **[MV] 足立レイ 「おべんきょうたいむ」 / litmus* #FEATコンテスト2024参加曲** | litmus* music | `rHfoRybqiRg` | 79구절 | 56자 | 정상 등록 (ID: `44-litmus-adachi-rei-obenkyoutaimu-litmus`) |
| 334 | **Sexy Minus / LOL feat.初音ミク,重音テト** | PPP Sounds | `hP9os_Na-eg` | 44구절 | 65자 | 정상 등록 (ID: `45-ppp-sounds-sexy-minus-lol-hatsune`) |
| 335 | **生存適性欠乏症/鏡音リン・鏡音レン/第35回プロセカNEXT応募楽曲** | まきゃヴぇり / 青の隣 | `VzM6z3BUVwk` | 81구절 | 126자 | 정상 등록 (ID: `46-vocaloid-seizon-tekisei-ketsuboushou-kagamine`) |
| 336 | **ミクだし/ 初音ミク→ 初音ミク→ 初音ミク** | hya | `G7DTmvaLD1Q` | 106구절 | 78자 | 정상 등록 (ID: `47-hya-miku-dashi-hatsune-miku`) |
| 337 | **フェイクダンス／雨衣＆重音テト(Fake Dance／Ui＆Kasane Teto)** | NEKOZUME | `2HRW4aNgx6U` | 59구절 | 80자 | 정상 등록 (ID: `48-nekozume-feikudansu-amai-juuon-teto`) |
| 338 | **花が落ちたので、／一二三 feat.初音ミク** | Hifumi | `35iPH7jJLH0` | 66구절 | 112자 | 정상 등록 (ID: `50-hifumi-hana-ga-ochi-tanode`) |
| 339 | **東京茶会事件（Tokyo Tea Party）/ 宮守文学 feat.初音ミク, 鏡音リン** | Miyamori Bungaku Official | `NotWAFUKX_M` | 77구절 | 172자 | 정상 등록 (ID: `51-miyamori-bungaku-toukyou-chakai-jiken-tokyo`) |
| 340 | **DYES IWASAKI × zensen "ラッキー・シアター feat.重音テト" MV** | DYES IWASAKI (from FAKE TYPE.) | `LZWrDrqK9XA` | 41구절 | 77자 | 정상 등록 (ID: `52-dyes-iwasaki-dyes-iwasaki-x-zensen`) |
| 341 | **レクレスリィ** | Aliey:S feat. 初音ミク | `ax3Se4S973A` | 63구절 | 119자 | 정상 등록 (ID: `alieys-recklessly`) |
| 342 | **Fairytale, [reunion]** | buzzG feat. GUMI | `IW6sjlMp2o0` | 32구절 | 93자 | 정상 등록 (ID: `buzzg-fairytale-reunion`) |
| 343 | **クイン (Quinn)** | dada feat. 奕曦 (Yi Xi) | `S-oufS0aFAE` | 45구절 | 113자 | 정상 등록 (ID: `dada-quinn`) |
| 344 | **車窓 (Window View)** | Farewell225 feat. 重音テトSV | `0EnAPvoIoXM` | 44구절 | 74자 | 정상 등록 (ID: `farewell225-shasou`) |
| 345 | **Route** | imie feat. 初音ミク | `zYuj_NgJSlo` | 28구절 | 58자 | 정상 등록 (ID: `imie-route`) |
| 346 | **女神大会 (Megami Taikai)** | じょるじん feat. 鏡音リン | `0oSwvUZs4ks` | 78구절 | 106자 | 정상 등록 (ID: `joruzin-megami-taikai`) |
| 347 | **君に贈る未来** | 木瀬のん feat. 初音ミク・鏡音リン | `-i6afoRjlO4` | 43구절 | 78자 | 정상 등록 (ID: `kisenon-kimi-ni-okuru-mirai`) |
| 348 | **『QUIET』** | MIMI feat. 重音テト＆可不＆雨衣 | `cqssJAipBvw` | 31구절 | 57자 | 정상 등록 (ID: `mimi-quiet`) |
| 349 | **わたしのふるさと** | Something's off with my Vocaloid feat. 初音ミク, 重音テト, 雨衣 | `CgRmvHdNbM8` | 32구절 | 64자 | 정상 등록 (ID: `somethings-off-watashi-no-furusato`) |
| - | ~~時よ (Toki yo / 시간이여)~~ | 星野源 (Gen Hoshino) | `LGG8grKZhxY` | - | - | **사용자 요청으로 영구 삭제 (영상 후반 앨범 광고로 삭제, `deletedIds`)** |
| - | ~~君が死んでも許してあげるよ~~ | Kikuo | `ThOViq2fHqg` | - | - | **한국어 전용 18번 영구 스킵 (제작 불필요, `deletedIds`)** |
| - | ~~集光 / 初音ミク~~ | OLDUCT | `sJt2mcriEqQ` | - | - | **일본어 전용 14번 영구 제외 (연주곡/학습 부적합)** |
| - | ~~【시유/유니】 호가호위 [Original]~~ | 50mang쏘망 | `yzOfja7N4eQ` | - | - | **기타언어 55번 영구 제외 (한국어 원곡)** |

---

## ⚡ 4. 다른 세션 시작 시 체크리스트 (Quick Startup Checklist)

1. [ ] `git status` 확인 (`docs/`, `references/` 구조 유지) (작업 트리 깨끗한지 확인)
2. [ ] `src/services/songStorage.ts`의 `loadDiskSongs()`, `deduplicateSongs()`, `getDeletedSongIds()` 구조가 보존되어 있는지 확인
3. [ ] 신규 곡 작업 시 `scratch/` 디렉토리에 파싱 및 빌드 스크립트를 작성하여 테스트 후 `src/data/songs/`에 배포
4. [ ] `.gitignore`, `README.md` 및 `docs/SONG_ADD_GUIDE.md` 목록 업데이트
5. [ ] `npm run build`로 타입 및 번들링 에러 없는지 검증
