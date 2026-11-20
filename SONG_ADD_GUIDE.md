# 🎵 UtaStudy 신규 곡 추가 및 개발 가이드 (Next Session Handover)

이 문서는 다른 AI 세션 또는 개발자가 본 프로젝트에서 **새로운 노래를 추가**하거나 **데이터 및 스토리지를 관리**할 때 반드시 숙지해야 할 작업 절차와 핵심 주의사항을 정리한 인수인계 가이드입니다.

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
* ❌ 잘못된 예: `きっと今日[きょう]` (앞의 히라가나까지 루비에 포함되면 위치가 어긋남)
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
   `## 🎼 수록곡 목록 (Current Song List)` 테이블에 행 추가.

---

### Step 6. 빌드 및 린트 검증 (필수)
새 파일을 추가한 후 아래 명령을 반드시 실행하여 에러가 없는지 확인합니다:
```bash
npm run build   # tsc -b && vite build 정상 완료 확인
npm run lint    # oxlint 통과 확인
```

---

## 📋 3. 현재 등록된 곡 현황 (Current Catalog)

| 번호 | 곡명 (Title) | 아티스트 (Artist) | YouTube ID | 구절 수 | 한자 수 | 상태 |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | **フィクション (Fiction)** | sumika | `IKHGAuNaGuA` | 41구절 | 76자 | 정상 등록 |
| 2 | **Ours** | *Luna feat. 初音ミク | `QcpjV43ALCA` | 39구절 | 62자 | 정상 등록 |
| 3 | **あっぷりケ (Applique)** | 真島ゆろ feat. 可不 | `TpkZqCopUDA` | 59구절 | 97자 | 정상 등록 |
| 4 | **アイムマイン (I'm Mine)** | halyosy ft. VOCALOIDS | `yVMHWv7hKTE` | 83구절 | 203자 | 정상 등록 (중복 제거 완료) |
| 5 | **パリィ (Parry)** | 宮守文学 feat. 鏡音レン, 鏡音リン | `p9F__9fciRo` | 96구절 | 128자 | 정상 등록 |
| 6 | **エメラルド (Emerald)** | キタニタツヤ feat. 初音ミク | `kM8HEzBGU-0` | 42구절 | 58자 | 기본 Fallback 곡 |
| 7 | **小さな私 (Chiisana Watashi)** | 傘村トータ | `qZtT09mQcRk` | 35구절 | 45자 | 정상 등록 |
| 8 | **出任せシンフォニー** | ナ유탄星人 | `w_b8qJkYl2I` | 52구절 | 89자 | 정상 등록 |
| 9 | **EGO** | sasakure.UK | `b3z8K1vK0rU` | 48구절 | 72자 | 정상 등록 |
| 10 | **ギャンブルショット** | すりぃ | `k9nL3b7w_4U` | 64구절 | 94자 | 정상 등록 |
| 11 | **ハローソロウ (Hello Sorrow)** | 傘村トータ | `7w_p1Y8Lm9I` | 50구절 | 81자 | 정상 등록 |
| 12 | **一輪の詩 (Ichirin no Uta)** | Project Lumina feat. 星界 | `_zhfi_RyF1U` | 65구절 | 92자 | 정상 등록 |
| 13 | **ライアーダンサー** | マサラダ | `qM73_7t3l7I` | 58구절 | 88자 | 정상 등록 |
| 14 | **ウルトラトレイラー** | マサラダ | `t4q0-u9P1wY` | 62구절 | 96자 | 정상 등록 |
| 15 | **運命 (Unmei)** | sumika | `1v9v8U-7u9U` | 55구절 | 78자 | 정상 등록 |
| 16 | **ゼロトーキング** | はるまきごはん | `2INYgH-Gcjk` | 61구절 | 82자 | 정상 등록 |
| 17 | **にっこり^^調査隊のテーマ** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン, 鏡音レン | `C_Fc1x_aeFQ` | 85구절 | 118자 | 정상 등록 |
| 18 | **ひゅ〜どろどろ** | 栗山夕璃 feat. 初音ミク, MEIKO | `8D_7-jNaErg` | 26구절 | 87자 | 정상 등록 |
| 19 | **オーバーレイ・ワールド** | 雪乃イト feat. 重音テト | `7b4M8utvFb8` | 51구절 | 120자 | 정상 등록 |
| 20 | **25時の情熱** | カンザキイオリ feat. VOCALOIDS | `RifILHUOV_w` | 31구절 | 72자 | 정상 등록 |
| 21 | **ミックスナッツ** | Official HIGE DANDism | `CbH2F0kXgTY` | 33구절 | 103자 | 정상 등록 |
| 22 | **スーツ** | カンザキイオリ feat. 重音テト, 初音ミク | `DMEmRL5YGTM` | 54구절 | 115자 | 정상 등록 |
| 23 | **僕らはなんにも悪くない！** | 宮守文学 feat. 初音ミク | `WWD7qemSKyc` | 68구절 | 138자 | 정상 등록 |
| 24 | **水色侵略** | ナユタン星人 feat. 初音ミク | `Mksf3xakH8s` | 60구절 | 75자 | 정상 등록 |
| 25 | **コバルトメモリーズ** | はるまきごはん feat. 初音ミク | `0X_pI_SCDK8` | 55구절 | 102자 | 정상 등록 |
| 26 | **クローンクローン** | Atena feat. GUMI, 鏡音リン | `bmbAm-fKnbQ` | 56구절 | 65자 | 정상 등록 |
| 27 | **アタマモミ** | はるまきごはん feat. 初音ミク, ナースロボ_タイプT | `WPXDz834NEo` | 60구절 | 70자 | 정상 등록 |
| 28 | **Ribbon** | sabio feat. 重音テト | `_a-eNWjvw1g` | 39구절 | 74자 | 정상 등록 |
| 29 | **グルグル** | Omi feat. 重音テト | `Hn6SpfEu2MA` | 52구절 | 86자 | 정상 등록 |
| 30 | **マジック・メイド** | MIMI feat. 重音テトSV | `TC80uw4HgCw` | 48구절 | 65자 | 정상 등록 |
| 31 | **星降る海** | Aqu3ra feat. 月見ヤチヨ (cv. 早見沙織) | `h5XQqKuek5A` | 40구절 | 95자 | 정상 등록 |
| 32 | **アンドゥ** | 宮守文学 feat. 鏡音レン, 鏡音リン | `Nen743brrNA` | 88구절 | 142자 | 정상 등록 |
| 33 | **密かなる交信曲** | 濁茶 feat. 初音ミク | `Ch4RQPG1Tmo` | 30구절 | 106자 | 정상 등록 |
| 34 | **UNIVERCE** | あたたかい水族館 feat. 初音ミク, 音街ウナ | `Q2n-G_SMAEw` | 39구절 | 78자 | 정상 등록 |
| 35 | **テレパシ** | DECO*27 feat. 初音ミク | `c56TpxfO9q0` | 53구절 | 75자 | 정상 등록 |
| 36 | **溶けちゃいそう** | なみぐる feat. AiSuu | `Q3FjTt2bzoQ` | 41구절 | 56자 | 정상 등록 |
| 37 | **贅沢と君とカプチーノ** | shikisai feat. 初音ミク, 鏡音リン | `LPci3mEA5AA` | 67구절 | 105자 | 정상 등록 |
| 38 | **アンコールダンス** | MIMI feat. 重音テトSV | `5hgSET4bpbk` | 27구절 | 52자 | 정상 등록 |
| 39 | **お水見ずにいる** | 濁茶 feat. 知声, りむる | `UtVS0YEdOes` | 18구절 | 88자 | 정상 등록 |
| 40 | **お返事まだカナ💦❓おじさん構文😁❗️** | 雨衣 | `8E8aWeY-pAc` | 84구절 | 91자 | 정상 등록 |
| 41 | **ゔるとぅーむ** | 藤原ハガネ feat. flower, 重音テトSV | `4peROn0bCAQ` | 33구절 | 120자 | 정상 등록 |
| 42 | **夏に透明** | Twinfield feat. 初音ミク | `d8tp0hbDQBM` | 32구절 | 74자 | 정상 등록 |
| 43 | **どりーむもーど** | Atena feat. 音街ウナ, 歌愛ユキ | `7Ucwpeg9iXM` | 76구절 | 89자 | 정상 등록 |
| 44 | **ちゅきちゅきポコポコポン** | TAK feat. 初音ミク | `pHakQLbGjaU` | 52구절 | 15자 | 정상 등록 |
| 45 | **ブレインロット** | 東京真中 feat. 重音テト | `UsjsYMo3O1Q` | 24구절 | 24자 | 정상 등록 |
| 46 | **てんしかあくまか** | WONDERFUL★OPPORTUNITY! feat. 雨衣 | `YC6DLCKhlkY` | 64구절 | 61자 | 정상 등록 |
| 47 | **ドゥーマー** | 東京真中 feat. 重音テト | `YcO-MxPf_Vg` | 44구절 | 31자 | 정상 등록 |
| 48 | **我ら！ゴミ分別団** | かてらざわ feat. 重音テト, ずんだもん | `OreUrf87EUE` | 51구절 | 79자 | 정상 등록 |
| 49 | **ヒロインRE♡クエスト** | 삼사 feat. 重音テト, 足立レイ | `VXA0PEjkIGU` | 73구절 | 76자 | 정상 등록 |
| 50 | **いえない** | ひらぎ feat. 初音ミク | `SuP_gK4q2a8` | 26구절 | 82자 | 정상 등록 |
| 51 | **Phonky Donky Crazy** | Chenomio feat. 重音テト | `nzMKs_Xh1Co` | 42구절 | 71자 | 정상 등록 |
| 52 | **アダチ・レイ** | 佐藤ちなみに feat. 足立レイ, 重音テト | `cRnjetMobw8` | 38구절 | 88자 | 정상 등록 |
| 53 | **39** | d0tc0mmie feat. 初音ミク, 重音テトSV | `ZhOyrxdK3Hs` | 19구절 | 0자 | 정상 등록 (순수 히라가나 곡) |
| 54 | **無宗教クラブ** | Parang feat. 初音ミク | `hU7hcBcLLUY` | 51구절 | 22자 | 정상 등록 |
| 55 | **ディスコティックナイト** | NEKOZUME feat. 雨衣, 重音テト | `CrfRliqxuYc` | 41구절 | 47자 | 정상 등록 |
| 56 | **拝啓、少年よ** | Hump Back | `d6i4AtCxrDo` | 29구절 | 42자 | 정상 등록 |
| 57 | **カンケーガール** | マサラダ feat. 重音テト | `5lK9z88taP8` | 56구절 | 76자 | 정상 등록 |
| 58 | **フィクションです。** | Chenomio feat. 重音テト | `LxVv4QneUuU` | 57구절 | 69자 | 정상 등록 |
| 59 | **ミスエラア** | Vell feat. 初音ミク | `sRnx3XjcDFs` | 42구절 | 86자 | 정상 등록 |
| 60 | **マギアート** | 煮ル果実 feat. v flower | `IMJVU4ztJI0` | 56구절 | 148자 | 정상 등록 |
| 61 | **キャラクターT** | Atena feat. 重音テト, 重音テトSV | `YSBZFVSvqL0` | 83구절 | 102자 | 정상 등록 |
| 62 | **アンタに言ってんの！！！** | ぴーなた feat. 重音テト | `V4elF7---KQ` | 44구절 | 69자 | 정상 등록 |
| 63 | **承認してくださいジーニーさん！** | TRAP CHICK feat. 重音テト, 音街ウナ | `XKZIQlqVjjk` | 88구절 | 104자 | 정상 등록 |
| 64 | **Take me out** | Omi feat. 重音テト | `L6e6fjlQiL8` | 33구절 | 46자 | 정상 등록 |
| 65 | **子供になっちゃえよ** | 栗山夕璃 feat. flower, 重音テトSV | `JucbynqMPvc` | 34구절 | 49자 | 정상 등록 |
| 66 | **ライフリワード** | 栗山夕璃 feat. 重音テトSV | `81jeVW4JLXs` | 35구절 | 83자 | 정상 등록 |
| 67 | **ポッペンキュート** | 東京真中 feat. 重音テト | `XYYq-uSeVwY` | 41구절 | 62자 | 정상 등록 |
| 68 | **プラネテス** | seiza feat. 初音ミク | `KcCNaBP06dM` | 20구절 | 73자 | 정상 등록 |
| 69 | **ヤラララ** | ABM feat. 重音テト | `T24rF_x0TmQ` | 57구절 | 52자 | 정상 등록 |
| 70 | **しらないプラネット** | shikisai feat. 初音ミク, 鏡音リン | `TqTmTqIxcGQ` | 38구절 | 48자 | 정상 등록 |
| 71 | **海底の彗星** | まきゃヴぇり feat. 鏡音リン, 鏡音レン | `s-qMpqq791M` | 67구절 | 95자 | 정상 등록 |
| 72 | **アクマバライ** | うちのボカロは様子がおかしい feat. 雨衣, Gemini, 初音ミク | `TzH5BsJj81Y` | 37구절 | 61자 | 정상 등록 |
| 73 | **スパイラル・メロディーズ** | Omoi feat. 初音ミク with メロエッタ | `yNw89sQOKas` | 40구절 | 48자 | 정상 등록 |
| 74 | **君のココロをハッキング** | ki-you feat. りむる | `-pIGv9GlhEU` | 41구절 | 66자 | 정상 등록 |
| 75 | **最高のMVの作りかた** | 阿修 feat. 初音ミク | `fcVC8FN_Qx8` | 55구절 | 144자 | 정상 등록 |
| 76 | **マイルストーン** | しゃいと feat. 音街ウナ | `s5Jj3aE9GAk` | 59구절 | 70자 | 정상 등록 |
| 77 | **オイメアルシー** | 88 / nihachi feat. 知声 | `9v_0TZ4XMuw` | 29구절 | 41자 | 정상 등록 |
| 78 | **あなたのアーカイブ** | 真島ゆろ feat. 初音ミク | `75KQXOArrTE` | 56구절 | 91자 | 정상 등록 |
| 79 | **connecting the dots** | 蒼天のラピスラズリ feat. 初音ミク, IA | `Kz9hfvwfFXk` | 36구절 | 39자 | 정상 등록 |
| 80 | **こころこぼれ** | Omi feat. 重音テト | `Xtc5GiharaE` | 35구절 | 98자 | 정상 등록 |
| 81 | **ウタカタナ** | halyosy feat. KAITO, MEIKO, 巡音ルカ | `9RgvGM33aSM` | 83구절 | 186자 | 정상 등록 |
| 82 | **時間厳守！どんびーれいと！** | いずん≒ feat. 音街ウナ | `odGELwGS2Ko` | 40구절 | 100자 | 정상 등록 |
| 83 | **パカパカバカリ** | ぼっちぼろまる | `HGaXGRQrKsY` | 54구절 | 68자 | 정상 등록 |
| 84 | **ハオ** | DECO*27 feat. 初音ミク | `3GzRDW3hZ1k` | 46구절 | 82자 | 정상 등록 |
| 85 | **愛属性** | ピノキオピー feat. 初音ミク | `Xx1TnVObQ0k` | 78구절 | 130자 | 정상 등록 |
| 86 | **完璧超人だ！** | かてらざわ feat. ずんだもん, Yi Xi | `ql-DCZqjLNk` | 60구절 | 107자 | 정상 등록 |
| 87 | **惑星ウェブスター** | Atena feat. 蒼姫ラピス, メルリ | `UlhFuCzxNbk` | 61구절 | 80자 | 정상 등록 |
| 88 | **はしる! とおく! とどく!** | 薄塩指数 feat. 重音テトSV | `b6ndcYxpX24` | 49구절 | 59자 | 정상 등록 |
| 89 | **異種 (Ishu)** | GESO feat. 歌愛ユキ, GUMI, 鳴花ヒメ | `rc9MrU98Eco` | 26구절 | 41자 | 정상 등록 |
| 90 | **冴ゆる青 (Sayuru Ao)** | 瀬名航 feat. 初音ミク | `EesNkIVrbR4` | 42구절 | 92자 | 정상 등록 |
| 91 | **ベラドンナ (Belladonna)** | nyanyannya（大天才P）- SynthV Yuma | `VSGEpqi48dQ` | 45구절 | 140자 | 정상 등록 |
| 90 | **スノーマン (Snowman) - Rerec** | halyosy ft. KAITO | `SUXQ7L1D2Dw` | 47구절 | 100자 | 정상 등록 (일본어 전용 1번) |
| 91 | **モミアゲヲシャカアゲヲ** | ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ | `cirDXY3CkSk` | 85구절 | 74자 | 정상 등록 (한국어 전용 2번) |
| 92 | **サイエンス (Science)** | MIMI feat. 重音テトSV | `m-bvW4pKT68` | 57구절 | 101자 | 정상 등록 (한국어 전용 3번) |
| 93 | **はいよろこんで (Hai Yorokonde)** | こっちのけんと | `jzi6RNVEOtA` | 48구절 | 50자 | 정상 등록 (한국어 전용 4번) |
| 94 | **携帯恋話 (Keitai Renwa)** | まふまふ (cover by Earthy X6) | `HdlJxpetUvc` | 47구절 | 78자 | 정상 등록 (일본어 전용 2번) |
| 95 | **死神は瞑目、月明かりこそがハイライト。** | Project Lumina feat. v_flower | `W-BlSr5jE9g` | 88구절 | 137자 | 정상 등록 (한국어 전용 5번) |
| 96 | **ロウワー (Lower)** | ぬゆり feat. 重音テトSV (cover by takaokamizuki) | `vB0edMo1kX8` | 43구절 | 118자 | 정상 등록 (일본어 전용 3번) |
| 97 | **神様じゃなくてごめんね** | Aliey:S feat. 初音ミク | `OZ8qQ6GKnFE` | 49구절 | 95자 | 정상 등록 (한국어 전용 6번) |
| 98 | **夕立ちゃん (Yuudachi-chan)** | 雨の介 feat. flower | `uCR3no1sKpI` | 43구절 | 78자 | 정상 등록 (한국어 전용 7번) |
| 99 | **あの春を返して (Ano Haru wo Kaeshite)** | カンザキイオリ feat. 鏡音リン | `33eTF7Fa0IA` | 104구절 | 166자 | 정상 등록 (일본어 전용 4번) |
| 100 | **ハローセカイ (Hello Sekai)** | DECO*27 feat. 初音ミク | `t5U0rrj0dio` | 29구절 | 49자 | 정상 등록 (일본어 전용 5번) |
| 101 | **mochimochi** | TAK feat. 初音ミク | `tQM8pfwmcU0` | 69구절 | 29자 | 정상 등록 (한국어 전용 8번) |
| 102 | **レシートラスト (Receipt Last)** | いえぬ feat. 重音テト | `QVtOjH3G24U` | 67구절 | 135자 | 정상 등록 (기타언어 전용 4번) |
| 103 | **ヘリアンサス (Helianthus)** | Aliey:S feat. 初音ミク | `K64aaWn17jk` | 57구절 | 81자 | 정상 등록 (한국어 전용 9번) |
| 104 | **ギビュリタ (Gibyurita)** | Vell feat. GUMI | `2YjKVSjdDVM` | 46구절 | 108자 | 정상 등록 (기타언어 전용 5번) |
| 105 | **僕なんかいなくても (With or Without Me)** | ピノキオピー feat. 初音ミク | `A1XqqVWyUl4` | 61구절 | 119자 | 정상 등록 (일본어 전용 6번) |
| 106 | **ODDS & ENDS** | ryo (supercell) covered by kyaami feat. 重音テト | `R8fuPgbOhTM` | 62구절 | 121자 | 정상 등록 (일본어 전용 7번) |
| 107 | **ブランディングができない (Branding ga Dekinai)** | Chinozo feat. KafU | `5qunwwaPvN8` | 38구절 | 59자 | 정상 등록 (한국어 전용 10번) |
| 108 | **あなたのいないデスクトップ (Anata no Inai Desktop)** | 豆カカオ feat. 初音ミク | `8zpxkCgJZSk` | 50구절 | 95자 | 정상 등록 (기타언어 전용 6번) |
| 109 | **罪と罰 (Reloaded) (Tsumi to Batsu)** | DECO*27 feat. 初音ミク | `iD3oF5HkPms` | 34구절 | 40자 | 정상 등록 (일본어 전용 8번) |
| 110 | **オブソミート (Obsolete Meat)** | 32ki feat. 初音ミク・重音テトSV | `L2hzsXOT0Nc` | 68구절 | 191자 | 정상 등록 (한국어 전용 11번) |
| 111 | **Leisure** | wotaku feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `aJBbfxlic64` | 48구절 | 53자 | 정상 등록 (기타언어 전용 7번) |
| 112 | **君恋クエスト (Kimikoi Quest)** | irucaice × 市瀬るぽ feat. 初音ミク | `h3djT-YfSDQ` | 48구절 | 91자 | 정상 등록 (일본어 전용 9번) |
| 113 | **天使の涙 (Tenshi no Namida)** | MIMI feat. 初音ミク | `mCYjEWWsqZ8` | 38구절 | 61자 | 정상 등록 (기타언어 전용 8번) |
| 114 | **こたえあわせ (Kotaeawase)** | TANT feat. 鏡音リン・レン | `Hfpzhlc7fdk` | 43구절 | 106자 | 정상 등록 (한국어 전용 12번) |
| 115 | **ユーチューバー (UTuber)** | ピノキオピー feat. 初音ミク | `lTUVw7wd5qY` | 61구절 | 71자 | 정상 등록 (일본어 전용 10번) |
| 116 | **ムーンガイズ (Moonguys)** | 煮ル果実 feat. 初音ミク | `dmA_M1xxo9E` | 64구절 | 116자 | 정상 등록 (기타언어 전용 9번) |
| 117 | **WOLF** | バルーン × ヒトリエ feat. flower | `CvEvfA45nVA` | 41구절 | 56자 | 정상 등록 (일본어 전용 11번) |
| 118 | **ムウ (MW)** | 煮ル果実 feat. flower | `so8TeLqLWps` | 64구절 | 144자 | 정상 등록 (기타언어 전용 10번) |
| 119 | **大人にはなれない (Otona ni wa Narenai)** | Aliey:S feat. 重音テトSV | `cANncTf97w8` | 65구절 | 106자 | 정상 등록 (한국어 전용 13번) |
| 120 | **超主人公 (Super Superhero)** | ピノキオピー feat. 初音ミク | `thmR2SmkeDU` | 65구절 | 88자 | 정상 등록 (일본어 전용 12번) |
| 121 | **からっぽの久遠 (Karappo no Kuon)** | Aliey:S feat. 初音ミク | `IoAq-sqLPhg` | 70구절 | 86자 | 정상 등록 (한국어 전용 14번) |
| 122 | **花弁、それにまつわる音声 (Kaben, Sore ni Matsuwaru Onsei)** | あばらや feat. 初音ミク | `LW1KBCgvEPQ` | 39구절 | 93자 | 정상 등록 (기타언어 전용 11번) |
| 123 | **ダイダイダイダイダイキライ (Daidaidaidaidaikirai)** | 雨良 Amala feat. 初音ミク VS 重音テト | `klIxS5o65C4` | 68구절 | 127자 | 정상 등록 (한국어 전용 15번) |
| 124 | **ファンファーレ (Fanfare)** | sumika | `7N8oan7fwfk` | 37구절 | 69자 | 정상 등록 (일본어 전용 13번) |
| 125 | **萬屋レストラン (Yorozuya Restaurant)** | 暖炉P feat. 鏡音リン, 鏡音レン, 初音ミク | `7gv4MLe1ZRg` | 39구절 | 53자 | 정상 등록 (기타언어 전용 12번) |
| 126 | **D/N/A** | Azari feat. 重音テト, flower | `j9RGt9Z_UeE` | 39구절 | 54자 | 정상 등록 (한국어 전용 16번) |
| 127 | **インテグラル (Integral)** | *Luna feat. 初音ミク | `gjLYd3iyPKM` | 67구절 | 98자 | 정상 등록 (기타언어 전용 13번) |
| 128 | **化けの花 (Bake no Hana)** | なきそ feat. 初音ミク | `jaSJ4t2ITW8` | 34구절 | 35자 | 정상 등록 (기타언어 전용 14번) |
| 129 | **ニャルラト (Nyarlathotep)** | 藤原ハガネ feat. 重音テトSV, 初音ミク | `z1imm_yPUHI` | 40구절 | 151자 | 정상 등록 (기타언어 전용 15번) |
| 130 | **わたしまだBABY (Watashi Mada BABY)** | MIMI feat. 狐子 | `q8Ap-1MUTew` | 34구절 | 52자 | 정상 등록 (기타언어 전용 16번) |
| 131 | **冬晴れステップ (Fuyubare Step)** | きさら feat. 初音ミク | `BupJ_OLUBMw` | 32구절 | 62자 | 정상 등록 (기타언어 전용 17번) |
| 132 | **少女A (Young Girl A)** | 椎名もた feat. 鏡音リン | `AqI97zHMoQw` | 29구절 | 65자 | 정상 등록 (기타언어 전용 18번) |
| 133 | **Time Traveler** | EMIRI feat. 初音ミク | `MhPXMcL9PBU` | 46구절 | 62자 | 정상 등록 (기타언어 전용 19번) |
| 134 | **SHOOTING STARS** | めろくる feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `EA1H2wHa7iU` | 72구절 | 80자 | 정상 등록 (기타언어 전용 20번) |
| 135 | **微熱のリリック (Binetsu no Lyric)** | MIMI feat. 重音テトSV | `qXvVt75kNmE` | 41구절 | 67자 | 정상 등록 (기타언어 전용 21번) |
| 135 | **聖人君子でありたい (Seijin Kunshi de Aritai)** | しゃいと feat. 重音テトSV | `hrBjKBPNi1c` | 51구절 | 109자 | 정상 등록 (한국어 전용 17번) |
| 136 | **イレギュラーマン (Irregular Man)** | マサラダ feat. 重音テトSV | `KOcReuSy67Y` | 60구절 | 99자 | 정상 등록 (한국어 전용 19번) |
| 136 | **T氏の話を信じるな (Don’t Believe in T)** | ピノキオピー feat. 初音ミク・重音テト | `Jtm6ikBIl0g` | 70구절 | 92자 | 정상 등록 (일본어 전용 15번) |
| 137 | **弱虫モンブラン (Reloaded) (Yowamushi Montblanc)** | DECO*27 feat. 初音ミク | `euRzG6zmEb8` | 25구절 | 53자 | 정상 등록 (일본어 전용 16번) |
| 138 | **チェリーポップ (Cherry Pop)** | DECO*27 feat. 初音ミク | `BI9Ue6JwJic` | 69구절 | 48자 | 정상 등록 (일본어 전용 17번) |
| 139 | **いますぐ輪廻 (Imasugu Rinne)** | なきそ feat. 初音ミク | `3iUgKH8c7p4` | 42구절 | 60자 | 정상 등록 (한국어 전용 20번) |
| 140 | **ストリートライト (Streetlight)** | Negi Shower P feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `NPOhKU5VTrQ` | 55구절 | 110자 | 정상 등록 (기타언어 전용 22번) |
| 141 | **散り散り (Chilly)** | 読谷あかね feat. 重音テト | `Xn-JobZlsQo` | 20구절 | 108자 | 정상 등록 (일본어 전용 18번) |
| 142 | **ミカンセイニンゲン (Mikansei Ningen)** | ミ瑞 feat. 可不、知声、重音テトSV | `P5nKiqaRo1M` | 76구절 | 77자 | 정상 등록 (한국어 전용 21번) |
| 143 | **デロデロデロデ (Deroderoderode)** | cosMo＠暴走P feat. 初音ミク | `gX_EUiEdur8` | 54구절 | 73자 | 정상 등록 (일본어 전용 19번) |
| 144 | **アベリア (Abelia)** | Aliey:S feat. 初音ミク | `wYlH_sR-8cA` | 86구절 | 83자 | 정상 등록 (한국어 전용 22번) |
| 145 | **天天天国地獄国 (Tentengoku Jigokukoku)** | covered by 初音ミクV4X & 重音テトSV | `xSfIAqxG1OM` | 62구절 | 85자 | 정상 등록 (일본어 전용 20번) |
| 146 | **エンパープル (Empurple)** | はるまきごはん feat. 初音ミク | `InZ7GOU-CQ8` | 42구절 | 82자 | 정상 등록 (한국어 전용 23번) |
| 147 | **成れなｲ (Can't becoME)** | 雨曇 feat. 重音テトSV, 重音テト | `7OqQ0HYPJVY` | 43구절 | 71자 | 정상 등록 (기타언어 전용 23번) |
| 148 | **ルサンチマン (Ressentiment)** | Aliey:S feat. 初音ミク | `vfk8bohEreg` | 56구절 | 62자 | 정상 등록 (한국어 전용 24번) |
| 149 | **Spoken For** | FLAVOR FOLEY ft. 重音テト | `LvYL8u4p-aM` | 71구절 | 127자 | 정상 등록 (일본어 전용 21번) |
| 150 | **エターナルアリア (Eternal Aria)** | Adeliae feat. 初音ミク | `GHzCL_6v87Y` | 41구절 | 101자 | 정상 등록 (기타언어 전용 24번) |
| 151 | **きおくをみたの (Kioku wo Mita no)** | まかろり feat. 初音ミク | `DNltbDXaKw8` | 46구절 | 90자 | 정상 등록 (한국어 전용 25번) |
| 151 | **モニタリング (Best Friend Remix)** | DECO*27 feat. 初音ミク | `C-CYwNz3z8w` | 48구절 | 82자 | 정상 등록 (일본어 전용 22번) |
| 152 | **ハピフルエンサー！ (Happyfulencer!)** | irucaice × 市瀬るぽ × Ponchi♪ feat. 初音ミク | `WGNLYKPuIUQ` | 56구절 | 90자 | 정상 등록 (일본어 전용 23번) |
| 153 | **成長痛 (Seichoutsuu)** | Iori Kanzaki feat. 梵そよぎ | `RXuoTY1neiU` | 63구절 | 104자 | 정상 등록 (일본어 전용 24번) |
| 154 | **Écho ｢ミロワール｣ (Miroir)** | Écho / エコー・エトワール -Pleiades Éclat- feat. 初音ミク | `un4S1RoQo7A` | 25구절 | 52자 | 정상 등록 (일본어 전용 25번) |
| 155 | **怪獣になりたい (Kaijuu ni Naritai)** | Sakuzyo feat. 初音ミク | `TbakFPc4ZTw` | 31구절 | 47자 | 정상 등록 (일본어 전용 26번) |
| 156 | **さざめき、とどめき、大百鬼夜行！ (Dai-hyakkiyagyou)** | netuki feat. 初音ミク | `7V8L9otIYMg` | 46구절 | 141자 | 정상 등록 (일본어 전용 27번) |
| 157 | **オデッセイ (Odyssey)** | 織井辺コフィ feat. 星界 | `KjJL_8x43OA` | 49구절 | 117자 | 정상 등록 (일본어 전용 28번) |
| 158 | **超限界バスター (Chougenkai Buster)** | ¿? feat. 重音テト | `PKXJWt0Pcfs` | 59구절 | 54자 | 정상 등록 (일본어 전용 29번) |
| 159 | **スマート??? (Smart???)** | まらしぃ feat. 鏡音リン | `xDuxw1rsNWo` | 59구절 | 86자 | 정상 등록 (일본어 전용 30번) |
| 160 | **全部夢だった！ (Zenbu Yume Datta!)** | 黒うさぎ feat. 重音テトSV | `z13hzDHruo8` | 32구절 | 50자 | 정상 등록 (일본어 전용 31번) |
| 161 | **初音ミクシンフォニー10thテーマ曲『プレイオン』 (Play On)** | Mitchie M feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `CXkY-vWeuRI` | 60구절 | 119자 | 정상 등록 (일본어 전용 32번) |
| 162 | **彗星ノ銀河 (Suisei no Ginga)** | マツシタレオ feat. 初音ミク | `HDwPGObRmXE` | 31구절 | 77자 | 정상 등록 (일본어 전용 33번) |
| 163 | **ネバーランド (Neverland)** | DECO*27 feat. 初音ミク | `48Csilkjev0` | 55구절 | 66자 | 정상 등록 (일본어 전용 34번) |
| 164 | **ドクヘビ (Dokuhebi)** | かめりあ feat. 初音ミク | `n1q-R6iNxRE` | 70구절 | 134자 | 정상 등록 (일본어 전용 35번) |
| 165 | **アイアイ傘 (Aiaigasa)** | ハム feat. 雨衣 | `e5_XSeN9Y4k` | 35구절 | 65자 | 정상 등록 (일본어 전용 36번) |
| 166 | **Vermillion** | sumika | `Epd7n5fqoNw` | 53구절 | 95자 | 정상 등록 (일본어 전용 37번) |
| 167 | **あんたは死んだ (Anta wa Shinda)** | カンザキイオリ feat. 重音テトSV | `bKA5FxTBujA` | 67구절 | 100자 | 정상 등록 (일본어 전용 38번) |
| 161 | **Pain** | めろくる (Mellowcle) feat. 初音ミク | `X2CFrEDiDyY` | 53구절 | 70자 | 정상 등록 (기타언어 전용 30번) |
| 162 | **シスターシスター (Sister Sister)** | せきこみごはん feat. 初音ミク | `AvctZU1E_7Q` | 38구절 | 83자 | 정상 등록 (기타언어 전용 31번) |
| 163 | **回生 (Kaisei)** | ゆくえわっと feat. 健音テイ, 暗鳴ニュイ, 湯鬱声からす | `U0YMFCYVzCI` | 41구절 | 83자 | 정상 등록 (기타언어 전용 32번) |
| 164 | **あたしの廃園 (Atashi no Haien)** | 溝野あわ feat. 重音テトSV | `xYJkF7EMyP8` | 35구절 | 47자 | 정상 등록 (기타언어 전용 33번) |
| 165 | **マジカル☆ミラクル☆メタギャルフォーゼ (MAGICAL☆MIRACLE☆METAGALPHOSE)** | ふるーり feat. 重音テトSV | `WYTSF1soBZs` | 60구절 | 108자 | 정상 등록 (기타언어 전용 34번) |
| 168 | **ジェヘナ (Gehenna)** | Earthy X6 (Cover) [wotaku feat. 巡音ルカ, MEIKO, KAITO] | `seXI1A6tMmA` | 54구절 | 120자 | 정상 등록 (기타언어 전용 35번) |
| 169 | **Boo!Boo!エトランゼ (Boo!Boo!Etranger)** | きさら feat. v flower & Ci flower | `VHmrMK5K2aY` | 51구절 | 65자 | 정상 등록 (기타언어 전용 36번) |
| 170 | **トレジャーガーデン (Treasure Garden)** | Ponchi♪ feat. 初音ミク | `RIpHyjsv_84` | 47구절 | 44자 | 정상 등록 (기타언어 전용 37번) |
| 171 | **MEGANE GIRL MEGANE BOY** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン・鏡音レン | `la6_f-oUFHE` | 58구절 | 77자 | 정상 등록 (기타언어 전용 38번) |
| 172 | **ポリビュー (polyview)** | いえぬ feat. 初音ミク | `6HSKCce8abM` | 35구절 | 73자 | 정상 등록 (기타언어 전용 39번) |
| 173 | **空奏ジャンプ (Kuusou Jump)** | ナナホシ管弦楽団 feat. 初音ミク | `5qMb-ZGmT1w` | 47구절 | 84자 | 정상 등록 (기타언어 전용 40번) |
| 174 | **にゅー！支配者のキャロル (New! Shihaisha no Carol)** | 藤原ハガネ feat. 里石ユカ | `UnlgVoWd7hI` | 45구절 | 121자 | 정상 등록 (기타언어 전용 41번) |
| 152 | **tig-hug** | sasakure.UK feat. GUMI | `AO81V78Dtwo` | 52구절 | 74자 | 정상 등록 (기타언어 전용 25번) |
| 153 | **Leucocoryne (リュウココリネ)** | ryuryu feat. 初音ミク | `fFitoGwCITo` | 28구절 | 75자 | 정상 등록 (한국어 전용 26번) |
| 156 | **パレードレコード (Parade Record)** | きさら feat. 初音ミク | `z7UF260NtyU` | 72구절 | 109자 | 정상 등록 (기타언어 전용 26번) |
| 157 | **バカみたいじゃん (Baka Mitai jan)** | あくたり (Aktari) feat. 重音テトSV | `2CnLNnY5QME` | 39구절 | 55자 | 정상 등록 (기타언어 전용 27번) |
| 158 | **Blusher (臙脂)** | om feat. 重音テト | `9HUMT9F7baM` | 48구절 | 80자 | 정상 등록 (기타언어 전용 28번) |
| 159 | **星降るココロ (Hoshifuru Kokoro)** | MIMI feat. 初音ミク | `Mb9TWJm_5L4` | 21구절 | 51자 | 정상 등록 (기타언어 전용 29번) |
| 157 | **Do not tap** | Shü feat. 重音テトSV・音街ウナSV | `rMlC5UQM9qI` | 40구절 | 103자 | 정상 등록 (한국어 전용 27번) |
| 158 | **ウニ (Uni / 성게)** | Adeliae feat. 雨衣 | `fi3YjlKlpRU` | 38구절 | 77자 | 정상 등록 (한국어 전용 28번) |
| 159 | **目撃！テト31世 (Mokugeki! Teto 31-sei)** | はろける feat. 雨衣・重音テト | `uWMr16O_Aso` | 56구절 | 43자 | 정상 등록 (한국어 전용 29번) |
| 160 | **カートゥーンガール (Cartoon Girl)** | Kanaria feat. GUMI | `BY7CnLX5Mk0` | 24구절 | 22자 | 정상 등록 (한국어 전용 30번) |
| 161 | **だれかぬいてくれ (DAREKANUITEKURE)** | ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ feat. 音街ウナSV & タカハシアマト | `VgLNfVougpI` | 61구절 | 42자 | 정상 등록 (한국어 전용 31번) |
| 162 | **キネティックタウン (Kinetic Town)** | 晴いちばん feat. 初音ミク | `AdT_lmdC39g` | 29구절 | 73자 | 정상 등록 (한국어 전용 32번) |
| 163 | **死神は瞑目、月明かりこそがハイライト。 (Aliey:S Remix)** | Project Lumina - Aliey:S Remix feat. 初音ミク | `DOai_KjDGh0` | 88구절 | 137자 | 정상 등록 (한국어 전용 33번) |
| 164 | **ぐるぐる (Guruguru)** | OLDUCT feat. 歌愛ユキ & 初音ミク | `ympFwEAUqc0` | 65구절 | 23자 | 정상 등록 (한국어 전용 34번, ID: `olduct-guruguru`) |
| 165 | **けっかおーらい (Kekka Orai)** | こっちのけんと | `Ug0N4qGRp_w` | 70구절 | 86자 | 정상 등록 (한국어 전용 35번) |
| 166 | **やる気が出ない歌 (Yaruki ga Denai Uta)** | えいぷ feat. 初音ミク・重音テト | `xAwnI9AraXs` | 85구절 | 119자 | 정상 등록 (한국어 전용 36번, ID: `eipu-yaruki-ga-denai-uta`) |
| 167 | **ずんだタコヤーキ (Zunda Takoyaaki)** | なみぐる feat. ずんだもん・琴葉茜 | `pbb7EQx-7tA` | 71구절 | 40자 | 정상 등록 (한국어 전용 37번, ID: `namigroove-zunda-takoyaaki`) |
| 168 | **メルトアイスクリーム (Melt Ice Cream)** | TRAP CHICK feat. 初音ミク・重音テト | `aDA1B_We5w8` | 51구절 | 81자 | 정상 등록 (한국어 전용 38번, ID: `trapchick-melt-ice-cream`) |
| 169 | **Pretender** | Official髭男dism | `TQ8WlA2GXbk` | 52구절 | 96자 | 정상 등록 (한국어 전용 39번, ID: `higedan-pretender`) |
| 170 | **スプリットダンス (Split Dance)** | えいぷ feat. 初音ミク・重音テト | `R401j1QAvEg` | 58구절 | 116자 | 정상 등록 (한국어 전용 40번, ID: `eipu-split-dance`) |
| 171 | **地獄行きの列車に乗ってさらば！ (Jigoku-yuki no Ressha ni Notte Saraba!)** | Aliey:S feat. 初音ミク | `oz-NYTQXA9o` | 95구절 | 106자 | 정상 등록 (한국어 전용 41번, ID: `alieys-jigoku-yuki-no-ressha`) |
| 172 | **次元通信 (Signaling)** | AnythingBecomeMoe feat. 初音ミク・重音テト | `PqpCRSOUuIE` | 56구절 | 103자 | 정상 등록 (한국어 전용 42번, ID: `abm-signaling`) |
| 173 | **杏仁dope (Annin Dope)** | なみぐる feat. 可不 | `fFL9NeOF7XM` | 83구절 | 75자 | 정상 등록 (한국어 전용 43번, ID: `namigroove-annin-dope`) |
| 174 | **バゥムクゥヘン・エンドロゥル (Baumkuchen End Roll)** | 雨良 feat. 初音ミクVS重音テトVS亞北ネル | `Dz5rALpx06M` | 51구절 | 114자 | 정상 등록 (한국어 전용 44번, ID: `amala-baumkuchen-end-roll`) |
| 175 | **ループザルーム (Looping the Rooms)** | ルシノ feat. 初音ミク | `icBDYkfxpMs` | 42구절 | 48자 | 정상 등록 (한국어 전용 45번, ID: `rusino-loop-the-room`) |
| 176 | **桜日和とタイムマシン (Sakurabiyori to Time Machine)** | Ado with 初音ミク | `nIWZfhpnq6M` | 35구절 | 76자 | 정상 등록 (한국어 전용 46번, ID: `ado-sakurabiyori-to-time-machine`) |
| 177 | **妄想アスパルテーム (Mousou Aspartame)** | picco feat. 初音ミク | `36LsS8T5RHE` | 53구절 | 65자 | 정상 등록 (한국어 전용 47번, ID: `picco-mousou-aspartame`) |
| 178 | **『トリックハート』 (Trick Heart)** | MIMI feat. 重音テトSV | `uoYegcqyfxE` | 40구절 | 67자 | 정상 등록 (한국어 전용 48번, ID: `mimi-trick-heart`) |
| 179 | **弱者のマーチ (March of the Weak)** | えいぷ feat. 重音テト | `IxSvgPhdc8c` | 62구절 | 144자 | 정상 등록 (한국어 전용 49번, ID: `eipu-jakusha-no-march`) |
| 180 | **とろいめもりー (Trois Memory)** | 豆カカオ feat. 初音ミク | `92gM1Kqm8n8` | 57구절 | 130자 | 정상 등록 (한국어 전용 50번, ID: `mamekakao-trois-memory`) |
| 181 | **それもいいね (Sore mo Ii ne)** | こっちのけんと | `URHwwFNdJ5Y` | 36구절 | 39자 | 정상 등록 (한국어 전용 51번, ID: `kocchinokento-sore-mo-ii-ne`) |
| 182 | **どこにもいかない (Dokonimo Ikanai)** | マサラダ feat. 雨衣 | `xJULqAHbst0` | 29구절 | 32자 | 정상 등록 (한국어 전용 52번, ID: `masarada-dokonimo-ikanai`) |
| 183 | **ぼくはそれで委員会! (Boku wa Sore de Iinkai!)** | 薄塩指数 ft. 重音テトSV | `fReNcRnVnS8` | 36구절 | 54자 | 정상 등록 (한국어 전용 53번, ID: `usushioshisuu-boku-wa-sore-de-iinkai`) |
| 184 | **命辛辛 (Inochigaragara / For dear life)** | 煮ル果実 feat. v flower | `QTxvUA4l0Vs` | 53구절 | 145자 | 정상 등록 (한국어 전용 54번, ID: `nilfruits-inochigaragara`) |
| 185 | **花びら哀歌 (Hanabira Aika)** | MIMI feat. 重音テトSV | `IxVFW1XIW7Q` | 27구절 | 53자 | 정상 등록 (한국어 전용 55번, ID: `mimi-hanabira-aika`) |
| 186 | **流季想 (Ryukisou)** | Project Lumina feat. 初音ミク | `Z0iDS-m2uW4` | 61구절 | 66자 | 정상 등록 (한국어 전용 56번, ID: `project-lumina-ryukisou`) |
| 187 | **だ・し・て (Da・Shi・Te)** | はろける feat. 初音ミク & 重音テトSV | `c4UFhgGrRCk` | 57구절 | 69자 | 정상 등록 (한국어 전용 57번, ID: `harokeru-da-shi-te`) |
| 188 | **アンチドリームロマンチスト (Anti-Dream Romanticist)** | テンタクル忍者 feat. 初音ミク | `kRTcFyjvUtE` | 72구절 | 82자 | 정상 등록 (한국어 전용 58번, ID: `tentacle-ninja-anti-dream-romanticist`) |
| - | ~~ハレ (Hare / 맑음)~~ | Project Lumina feat. 知声 | `T9eFcn4vKTI` | - | - | **사용자 요청으로 영구 삭제 (`deletedIds`)** |
| - | ~~時よ (Toki yo / 시간이여)~~ | 星野源 (Gen Hoshino) | `LGG8grKZhxY` | - | - | **사용자 요청으로 영구 삭제 (영상 후반 앨범 광고로 삭제, `deletedIds`)** |

---

## ⚡ 4. 다른 세션 시작 시 체크리스트 (Quick Startup Checklist)

1. [ ] `git status` 확인 (작업 트리 깨끗한지 확인)
2. [ ] `src/services/songStorage.ts`의 `loadDiskSongs()`, `deduplicateSongs()`, `getDeletedSongIds()` 구조가 보존되어 있는지 확인
3. [ ] 신규 곡 작업 시 `scratch/` 디렉토리에 파싱 및 빌드 스크립트를 작성하여 테스트 후 `src/data/songs/`에 배포
4. [ ] `.gitignore` 및 `README.md` 목록 업데이트
5. [ ] `npm run build`로 타입 및 번들링 에러 없는지 검증
