# 🎵 UtaStudy (歌Study) - 노래로 배우는 일본어 싱크 러닝

<p align="center">
  <b>YouTube 영상 재생과 100% 정밀 싱크 가사, Zero-Gap 루비(후리가나), 실시간 대형 한자 사전 및 보관함 셔플을 지원하는 올인원 일본어 학습 웹 플랫폼</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## 🌟 주요 특징 (Key Features)

### 1. 🎬 유튜브 IFrame API 연동 & 무중단 백그라운드 재생
- **100ms 정밀 시간 트래킹**: YouTube Player API를 통해 100ms 단위로 현재 재생 시간을 추적하여 가사 하이라이트 및 한자 사전을 정밀하게 동기화합니다.
- **오디오 지속 마운트 아키텍처**: '영상 화면 보기'와 '실시간 한자 보기' 모드를 전환해도 YouTube 플레이어가 언마운트되지 않고 화면 밖 오프스크린으로 유지되어, **화면을 100% 가려도 음악(오디오)은 단 한 순간도 끊기지 않습니다.**

### 2. 🈸 Zero-Gap 루비 문자(후리가나) & 가창 독음(歌唱読み)
- **Zero-Gap 자석 밀착 렌더링**: CSS Flexbox 레이아웃 최적화를 통해 한자 바로 위에 후리가나가 상하/좌우 오차 없이 자석처럼 정확하게 밀착됩니다.
- **정밀 인라인 파서 (`lyricParser.ts`)**: 비한자 텍스트와 한자 블록을 완벽히 분리하여 후리가나가 앞 단어로 밀려나는 브라우저 기본 루비 왜곡을 원천 해결했습니다.
- **가창 독음(歌唱読み) & 숙자훈 절대 우선**:
  - 사전의 기계적인 1순위 음독 대신, 노래에서 가수가 실제로 부르는 발음을 후리가나로 달았습니다.
  - 예: `明後日[あさって]` (みょうごにち ❌), `今日[きょう]の日[ひ]` (にち ❌), `詩[し]の束[たば]` (そく ❌), `今宵[こよい]`, `足掻[あが]いて` 등.

### 3. 📖 100% 완전 차폐 실시간 대형 한자 사전 (Kanji Inspector)
- **소절 자동 연동**: 현재 재생 중인 소절에 나오는 모든 한자를 자동으로 감지하여 바둑판형 대형 카드로 동시 표시합니다.
- **독립 스크롤 완전 차폐**: 좌측 패널 전체를 덮는 독립 스크롤 컨테이너를 적용하여, 스크롤을 맨 아래로 내려도 뒷배경의 영상이나 전체 한자 칩이 단 1px도 노출되지 않습니다.
- **시원시원한 대형 UI**:
  - 대형 한자 글리프 박스 (`text-4xl ~ text-5xl`)
  - 한국어 훈음/제목 (`text-xl ~ text-2xl font-black`)
  - 훈독(訓) / 음독(音) 대형 뱃지 칩
  - 대표 활용 예시 단어 전용 섹션 (`단어 (요미가나) : 한국어 뜻`)

### 4. 🎼 노래 보관함 (Playlist) & 셔플/자동 연속 재생
- **셔플 (Shuffle) 모드**: 곡이 끝났을 때 보관함 내 다른 곡 중 무작위(Random)로 선택되어 재생됩니다.
- **자동 다음 곡 재생 (Auto-Next)**: 유튜브 영상이 끝났을 때(`PlayerState.ENDED`) 다음 곡으로 자동 전환되며 연속 재생됩니다.
- **지금 무작위 곡으로 셔플 재생 (Quick Shuffle)**: 보관함에 2곡 이상 있을 때 원클릭으로 랜덤 곡을 즉시 골라 재생합니다.
- **자유로운 보관함 관리**: 보관함의 모든 곡에 대해 삭제(휴지통) 지원 및 기본 곡(에메랄드) 원클릭 복원 지원.

### 5. 🤖 AI (ChatGPT / Claude / Gemini) 전용 프롬프트 파이프라인
- 유튜브 자막(yt-dlp 등)의 타임스탬프와 원문 가사를 1:1로 매핑하여 JSON을 자동 생성하는 맞춤형 AI 프롬프트 원클릭 복사 기능 내장.
- 누구나 좋아하는 J-POP 노래를 손쉽게 추가하여 학습할 수 있습니다.

### 6. 🎨 편의 기능
- **명조(세리프) / 고딕(산스) 서체 실시간 전환** (한글: Pretendard 고딕 고정, 일본어: Shippori Mincho 명조 기본)
- **후리가나 토글** & **한국어 번역 토글**
- **실시간 자동 스크롤** & **소절 클릭 시 점프(Seek)**
- **다크 모드 / 라이트 모드 지원**

---

## 🎶 수록곡 (Built-in Songs)

| 곡명 | 아티스트 | 유튜브 ID | 구절 수 | 수록 한자 수 |
| :--- | :--- | :---: | :---: | :---: |
| **エメラルド (Emerald)** | キタニタツヤ feat. 初音ミク | `kM8HEzBGU-0` | 32구절 | 81자 (전수 매핑) |
| **ギャンブルショット (Gamble Shot)** | 佐倉流星 feat. 重音テトSV | `QOVVWkAXtSg` | 44구절 | 129자 (전수 매핑) |
| **でまかせなシンフォニー (되는대로 심포니)** | 馬車馬カエデ × ちから feat. 重音テト & ALL | `Gtu2utelMRc` | 83구절 | 131자 (전수 매핑) |
| **ハローサロウ (Hello Sorrow)** | Aliey:S feat. v flower | `-kXdEsihdvU` | 81구절 | 127자 (전수 매핑) |
| **運命 (운명) - 던전밥 2기 OP** | sumika | `qabqhNQS-S0` | 70구절 | 93자 (전수 매핑) |
| **エゴ (Ego)** | sasakure.UK feat. 初音ミク | `79LwIdheZts` | 52구절 | 68자 (전수 매핑) |
| **ウルトラトレーラー (Ultra Trailer)** | マサラダ feat. 重音テトSV | `Fhg3KsDkMJM` | 67구절 | 128자 (전수 매핑) |
| **ちっちゃな私 (Chiisana Watashi)** | マサラダ feat. 重音テトSV | `4aFC2oC-wHA` | 30구절 | 29자 (전수 매핑) |
| **ライアーダンサー (Liar Dancer)** | マサラダ feat. 重音テトSV | `UHbmkxv-874` | 51구절 | 80자 (전수 매핑) |
| **ゼロトーキング (Zero Talking)** | はるまきごはん feat. 初音ミク | `2INYgH-Gcjk` | 61구절 | 82자 (전수 매핑) |
| **一輪の詩 (Ichirin no Uta)** | Project Lumina feat. 星界 | `_zhfi_RyF1U` | 65구절 | 92자 (전수 매핑) |
| **パリィ (Parry)** | 宮守文学 feat. 鏡音レン, 鏡音リン | `p9F__9fciRo` | 96구절 | 128자 (전수 매핑) |
| **ハレ (Hare / 맑음)** | Project Lumina feat. 知声 | `T9eFcn4vKTI` | 54구절 | 53자 (전수 매핑) |
| **アイムマイン (I'm Mine)** | halyosy ft. VOCALOIDS | `yVMHWv7hKTE` | 83구절 | 203자 (전수 매핑) |
| **あっぷりケ (Applique / 아플리케)** | 真島ゆろ feat. 可不 | `TpkZqCopUDA` | 59구절 | 97자 (전수 매핑) |
| **Ours** | *Luna feat. 初音ミク | `QcpjV43ALCA` | 39구절 | 62자 (전수 매핑) |
| **フィクション (Fiction)** | sumika | `IKHGAuNaGuA` | 41구절 | 76자 (전수 매핑) |
| **にっこり^^調査隊のテーマ (Niccori Survey Team Theme)** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン, 鏡音レン | `C_Fc1x_aeFQ` | 85구절 | 118자 (전수 매핑) |
| **ひゅ〜どろどろ (Hyu~Dorodoro)** | 栗山夕璃 feat. 初音ミク, MEIKO | `8D_7-jNaErg` | 26구절 | 87자 (전수 매핑) |
| **オーバーレイ・ワールド (Overlay World)** | 雪乃イト feat. 重音テト | `7b4M8utvFb8` | 51구절 | 120자 (전수 매핑) |
| **25時の情熱 (25-ji no Jounetsu)** | カンザキイオリ feat. VOCALOIDS | `RifILHUOV_w` | 31구절 | 72자 (전수 매핑) |
| **ミックスナッツ (Mixed Nuts)** | Official HIGE DANDism | `CbH2F0kXgTY` | 33구절 | 103자 (전수 매핑) |
| **スーツ (Suits)** | カンザキイオリ feat. 重音テト, 初音ミク | `DMEmRL5YGTM` | 54구절 | 115자 (전수 매핑) |
| **僕らはなんにも悪くない！ (Nothing Wrong With Us!)** | 宮守文学 feat. 初音ミク | `WWD7qemSKyc` | 68구절 | 138자 (전수 매핑) |
| **水色侵略 (Mizuiro Shinryaku)** | ナユタン星人 feat. 初音ミク | `Mksf3xakH8s` | 60구절 | 75자 (전수 매핑) |
| **コバルトメモリーズ (Cobalt Memories)** | はるまきごはん feat. 初音ミク | `0X_pI_SCDK8` | 55구절 | 102자 (전수 매핑) |
| **クローンクローン (Clone Clone)** | Atena feat. GUMI, 鏡音リン | `bmbAm-fKnbQ` | 56구절 | 65자 (전수 매핑) |
| **アタマモミ (Atamamomi)** | はるまきごはん feat. 初音ミク, ナースロボ_タイプT | `WPXDz834NEo` | 60구절 | 70자 (전수 매핑) |
| **Ribbon** | sabio feat. 重音テト | `_a-eNWjvw1g` | 39구절 | 74자 (전수 매핑) |
| **グルグル (Guruguru)** | Omi feat. 重音テト | `Hn6SpfEu2MA` | 52구절 | 86자 (전수 매핑) |
| **マジック・メイド (Magic Maid)** | MIMI feat. 重音テトSV | `TC80uw4HgCw` | 48구절 | 65자 (전수 매핑) |
| **星降る海 (Hoshi Furu Umi)** | Aqu3ra feat. 月見ヤチヨ (cv. 早見沙織) | `h5XQqKuek5A` | 40구절 | 95자 (전수 매핑) |
| **アンドゥ (Undo)** | 宮守文学 feat. 鏡音レン, 鏡音リン | `Nen743brrNA` | 88구절 | 142자 (전수 매핑) |
| **密かなる交信曲 (Hisokanaru Koushinkyoku)** | 濁茶 feat. 初音ミク | `Ch4RQPG1Tmo` | 30구절 | 106자 (전수 매핑) |
| **UNIVERCE** | あたたかい水族館 feat. 初音ミク, 音街ウナ | `Q2n-G_SMAEw` | 39구절 | 78자 (전수 매핑) |
| **テレパシ (Telepathy)** | DECO*27 feat. 初音ミク | `c56TpxfO9q0` | 53구절 | 75자 (전수 매핑) |
| **溶けちゃいそう (Tokechaisou)** | なみぐる feat. AiSuu | `Q3FjTt2bzoQ` | 41구절 | 56자 (전수 매핑) |
| **贅沢と君とカプチーノ (Zeitaku to Kimi to Cappuccino)** | shikisai feat. 初音ミク, 鏡音リン | `LPci3mEA5AA` | 67구절 | 105자 (전수 매핑) |
| **アンコールダンス (Encore Dance)** | MIMI feat. 重音テトSV | `5hgSET4bpbk` | 27구절 | 52자 (전수 매핑) |
| **お水見ずにいる (Omizu Mizu ni Iru)** | 濁茶 feat. 知声, りむる | `UtVS0YEdOes` | 18구절 | 88자 (전수 매핑) |
| **お返事まだカナ💦❓おじさん構文😁❗️ (Ohenji Mada Kana? Ojisan Koubun!)** | 雨衣 | `8E8aWeY-pAc` | 84구절 | 91자 (전수 매핑) |
| **ゔるとぅーむ (Vulthoom)** | 藤原ハガネ feat. flower, 重音テトSV | `4peROn0bCAQ` | 33구절 | 120자 (전수 매핑) |
| **夏に透明 (Natsu ni Toumei)** | Twinfield feat. 初音ミク | `d8tp0hbDQBM` | 32구절 | 74자 (전수 매핑) |
| **どりーむもーど (Dream Mode)** | Atena feat. 音街ウナ, 歌愛ユキ | `7Ucwpeg9iXM` | 76구절 | 89자 (전수 매핑) |
| **ちゅきちゅきポコポコポン (Chukichuki Pokopokopon)** | TAK feat. 初音ミク | `pHakQLbGjaU` | 52구절 | 15자 (전수 매핑) |
| **ブレインロット (Brain rot)** | 東京真中 feat. 重音テト | `UsjsYMo3O1Q` | 24구절 | 24자 (전수 매핑) |
| **てんしかあくまか (Tenshi ka Akuma ka)** | WONDERFUL★OPPORTUNITY! feat. 雨衣 | `YC6DLCKhlkY` | 64구절 | 61자 (전수 매핑) |
| **ドゥーマー (Doomer)** | 東京真中 feat. 重音テト | `YcO-MxPf_Vg` | 44구절 | 31자 (전수 매핑) |
| **我ら！ゴミ分別団 (Garbage Sorting Squad)** | かてらざわ feat. 重音テト, ずんだもん | `OreUrf87EUE` | 51구절 | 79자 (전수 매핑) |
| **ヒロインRE♡クエスト (Heroine RE♡Request)** | 삼사 feat. 重音テト, 足立レイ | `VXA0PEjkIGU` | 73구절 | 76자 (전수 매핑) |
| **いえない (Ienai)** | ひらぎ feat. 初音ミク | `SuP_gK4q2a8` | 26구절 | 82자 (전수 매핑) |
| **Phonky Donky Crazy** | Chenomio feat. 重音テト | `nzMKs_Xh1Co` | 42구절 | 71자 (전수 매핑) |
| **アダチ・レイ (Adachi Rei)** | 佐藤ちなみに feat. 足立レイ, 重音テト | `cRnjetMobw8` | 38구절 | 88자 (전수 매핑) |
| **39** | d0tc0mmie feat. 初音ミク, 重音テトSV | `ZhOyrxdK3Hs` | 19구절 | 0자 (순수 히라가나 곡) |
| **無宗教クラブ (Gray Zone)** | Parang feat. 初音ミク | `hU7hcBcLLUY` | 51구절 | 22자 (전수 매핑) |
| **ディスコティックナイト (Discotic Night)** | NEKOZUME feat. 雨衣, 重音テト | `CrfRliqxuYc` | 41구절 | 47자 (전수 매핑) |
| **拝啓、少年よ (Haikei, Shounen yo)** | Hump Back | `d6i4AtCxrDo` | 29구절 | 42자 (전수 매핑) |
| **カンケーガール (Kankee Girl)** | マサラダ feat. 重音テト | `5lK9z88taP8` | 56구절 | 76자 (전수 매핑) |
| **フィクションです。 (Fiction Desu)** | Chenomio feat. 重音テト | `LxVv4QneUuU` | 57구절 | 69자 (전수 매핑) |
| **ミスエラア (Miss Error)** | Vell feat. 初音ミク | `sRnx3XjcDFs` | 42구절 | 86자 (전수 매핑) |
| **マギアート (Magiato)** | 煮ル果実 feat. v flower | `IMJVU4ztJI0` | 56구절 | 148자 (전수 매핑) |
| **キャラクターT (Character T)** | Atena feat. 重音テト, 重音テトSV | `YSBZFVSvqL0` | 83구절 | 102자 (전수 매핑) |
| **アンタに言ってんの！！！ (Anta ni Itten no!!!)** | ぴーなた feat. 重音テト | `V4elF7---KQ` | 44구절 | 69자 (전수 매핑) |
| **承認してくださいジーニーさん！ (Approve, Please! Genie)** | TRAP CHICK feat. 重音テト, 音街ウナ | `XKZIQlqVjjk` | 88구절 | 104자 (전수 매핑) |
| **Take me out** | Omi feat. 重音テト | `L6e6fjlQiL8` | 33구절 | 46자 (전수 매핑) |
| **子供になっちゃえよ (Kodomo ni Natchae yo)** | 栗山夕璃 feat. flower, 重音テトSV | `JucbynqMPvc` | 34구절 | 49자 (전수 매핑) |
| **ライフリワード (Life Reward)** | 栗山夕璃 feat. 重音テトSV | `81jeVW4JLXs` | 35구절 | 83자 (전수 매핑) |
| **ポッペンキュート (Poppen Cute)** | 東京真中 feat. 重音テト | `XYYq-uSeVwY` | 41구절 | 62자 (전수 매핑) |
| **プラネテス (Planetes)** | seiza feat. 初音ミク | `KcCNaBP06dM` | 20구절 | 73자 (전수 매핑) |
| **ヤラララ (YARARARA)** | ABM feat. 重音テト | `T24rF_x0TmQ` | 57구절 | 52자 (전수 매핑) |
| **しらないプラネット (Shiranai Planet)** | shikisai feat. 初音ミク, 鏡音リン | `TqTmTqIxcGQ` | 38구절 | 48자 (전수 매핑) |
| **海底の彗星 (Kaitei no Suisei)** | まきゃヴぇり feat. 鏡音リン, 鏡音レン | `s-qMpqq791M` | 67구절 | 95자 (전수 매핑) |
| **アクマバライ (Akumabarai / Exorcist)** | うちのボカロは様子がおかしい feat. 雨衣, Gemini, 初音ミク | `TzH5BsJj81Y` | 37구절 | 61자 (전수 매핑) |
| **スパイラル・メロディーズ (Spiral Melodies)** | Omoi feat. 初音ミク with メロエッタ | `yNw89sQOKas` | 40구절 | 48자 (전수 매핑) |
| **君のココロをハッキング (Kimi no Kokoro o Hacking)** | ki-you feat. りむる | `-pIGv9GlhEU` | 41구절 | 66자 (전수 매핑) |
| **最高のMVの作りかた (Saikou no MV no Tsukurikata)** | 阿修 feat. 初音ミク | `fcVC8FN_Qx8` | 55구절 | 144자 (전수 매핑) |
| **マイルストーン (Milestone)** | しゃいと feat. 音街ウナ | `s5Jj3aE9GAk` | 59구절 | 70자 (전수 매핑) |
| **オイメアルシー (oimearcy)** | 88 / nihachi feat. 知声 | `9v_0TZ4XMuw` | 29구절 | 41자 (전수 매핑) |
| **あなたのアーカイブ (Anata no Archive)** | 真島ゆろ feat. 初音ミク | `75KQXOArrTE` | 56구절 | 91자 (전수 매핑) |
| **connecting the dots** | 蒼天のラピスラズリ feat. 初音ミク, IA | `Kz9hfvwfFXk` | 36구절 | 39자 (전수 매핑) |
| **こころこぼれ (Kokoro Kobore)** | Omi feat. 重音テト | `Xtc5GiharaE` | 35구절 | 98자 (전수 매핑) |
| **ウタカタナ (Utakatana)** | halyosy feat. KAITO, MEIKO, 巡音ルカ | `9RgvGM33aSM` | 83구절 | 186자 (전수 매핑) |
| **時間厳守！どんびーれいと！ (Jikan Genshu! Don't Be Late!)** | いずん≒ feat. 音街ウナ | `odGELwGS2Ko` | 40구절 | 100자 (전수 매핑) |
| **パカパカバカリ (Pakapaka Bakari)** | ぼっちぼろまる | `HGaXGRQrKsY` | 54구절 | 68자 (전수 매핑) |
| **ハオ (Hao)** | DECO*27 feat. 初音ミク | `3GzRDW3hZ1k` | 46구절 | 82자 (전수 매핑) |
| **愛属性 (Ai Zokusei)** | ピノキオピー feat. 初音ミク | `Xx1TnVObQ0k` | 78구절 | 130자 (전수 매핑) |
| **完璧超人だ！ (Kanpeki Choujin da!)** | かてらざわ feat. ずんだもん, Yi Xi | `ql-DCZqjLNk` | 60구절 | 107자 (전수 매핑) |
| **惑星ウェブスター (Wakusei Webster)** | Atena feat. 蒼姫ラピス, メルリ | `UlhFuCzxNbk` | 61구절 | 80자 (전수 매핑) |
| **はしる! とおく! とどく!** | 薄塩指数 feat. 重音テトSV | `b6ndcYxpX24` | 49구절 | 59자 (전수 매핑) |
| **異種 (Ishu / Alien)** | GESO feat. 歌愛ユキ, GUMI, 鳴花ヒメ | `rc9MrU98Eco` | 26구절 | 41자 (전수 매핑) |
| **冴ゆる青 (Sayuru Ao / Feel sky blue)** | 瀬名航 feat. 初音ミク | `EesNkIVrbR4` | 42구절 | 92자 (전수 매핑) |
| **ベラドンナ (Belladonna)** | nyanyannya（大天才P）- SynthV Yuma | `VSGEpqi48dQ` | 45구절 | 140자 (전수 매핑) |
| **スノーマン (Snowman) - Rerec** | halyosy ft. KAITO | `SUXQ7L1D2Dw` | 47구절 | 100자 (전수 매핑) |
| **モミアゲヲシャカアゲヲ** | ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ | `cirDXY3CkSk` | 85구절 | 74자 (전수 매핑) |
| **サイエンス (Science)** | MIMI feat. 重音テトSV | `m-bvW4pKT68` | 57구절 | 101자 (전수 매핑) |
| **はいよろこんで (Hai Yorokonde)** | こっちのけんと | `jzi6RNVEOtA` | 48구절 | 50자 (전수 매핑) |
| **携帯恋話 (Keitai Renwa)** | まふまふ (cover by Earthy X6) | `HdlJxpetUvc` | 47구절 | 78자 (전수 매핑) |
| **死神は瞑目、月明かりこそがハイライト。** | Project Lumina feat. v_flower | `W-BlSr5jE9g` | 88구절 | 137자 (전수 매핑) |
| **神様じゃなくてごめんね** | Aliey:S feat. 初音ミク | `OZ8qQ6GKnFE` | 49구절 | 95자 (전수 매핑) |
| **夕立ちゃん (Yuudachi-chan)** | 雨の介 feat. flower | `uCR3no1sKpI` | 43구절 | 78자 (전수 매핑) |
| **ロウワー (Lower)** | ぬゆり feat. 重音テトSV (cover by takaokamizuki) | `vB0edMo1kX8` | 43구절 | 118자 (전수 매핑) |
| **あの春を返して (Ano Haru wo Kaeshite)** | カンザキイオリ feat. 鏡音リン | `33eTF7Fa0IA` | 104구절 | 166자 (전수 매핑) |
| **ハローセカイ (Hello Sekai)** | DECO*27 feat. 初音ミク | `t5U0rrj0dio` | 29구절 | 49자 (전수 매핑) |
| **mochimochi** | TAK feat. 初音ミク | `tQM8pfwmcU0` | 69구절 | 29자 (전수 매핑) |
| **レシートラスト (Receipt Last)** | いえぬ feat. 重音テト | `QVtOjH3G24U` | 67구절 | 135자 (전수 매핑) |
| **ヘリアンサス (Helianthus)** | Aliey:S feat. 初音ミク | `K64aaWn17jk` | 57구절 | 81자 (전수 매핑) |
| **ギビュリタ (Gibyurita)** | Vell feat. GUMI | `2YjKVSjdDVM` | 46구절 | 108자 (전수 매핑) |
| **僕なんかいなくても (With or Without Me)** | ピノキオピー feat. 初音ミク | `A1XqqVWyUl4` | 61구절 | 119자 (전수 매핑) |
| **ODDS & ENDS** | ryo (supercell) covered by kyaami feat. 重音テト | `R8fuPgbOhTM` | 62구절 | 121자 (전수 매핑) |
| **あなたのいないデスクトップ (Anata no Inai Desktop)** | 豆カカオ feat. 初音ミク | `8zpxkCgJZSk` | 50구절 | 95자 (전수 매핑) |
| **ブランディングができない (Branding ga Dekinai)** | Chinozo feat. KafU | `5qunwwaPvN8` | 38구절 | 59자 (전수 매핑) |
| **罪と罰 (Reloaded) (Tsumi to Batsu)** | DECO*27 feat. 初音ミク | `iD3oF5HkPms` | 34구절 | 40자 (전수 매핑) |
| **オブソミート (Obsolete Meat)** | 32ki feat. 初音ミク・重音テトSV | `L2hzsXOT0Nc` | 68구절 | 191자 (전수 매핑) |
| **Leisure** | wotaku feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `aJBbfxlic64` | 48구절 | 53자 (전수 매핑) |
| **君恋クエスト (Kimikoi Quest)** | irucaice × 市瀬るぽ feat. 初音ミク | `h3djT-YfSDQ` | 48구절 | 91자 (전수 매핑) |
| **天使の涙 (Tenshi no Namida)** | MIMI feat. 初音ミク | `mCYjEWWsqZ8` | 38구절 | 61자 (전수 매핑) |
| **こたえあわせ (Kotaeawase)** | TANT feat. 鏡音リン・レン | `Hfpzhlc7fdk` | 43구절 | 106자 (전수 매핑) |
| **ユーチューバー (UTuber)** | ピノキオピー feat. 初音ミク | `lTUVw7wd5qY` | 61구절 | 71자 (전수 매핑) |
| **ムーンガイズ (Moonguys)** | 煮ル果実 feat. 初音ミク | `dmA_M1xxo9E` | 64구절 | 116자 (전수 매핑) |
| **WOLF** | バルーン × ヒトリエ feat. flower | `CvEvfA45nVA` | 41구절 | 56자 (전수 매핑) |
| **ムウ (MW)** | 煮ル果実 feat. flower | `so8TeLqLWps` | 64구절 | 144자 (전수 매핑) |
| **大人にはなれない (Otona ni wa Narenai)** | Aliey:S feat. 重音テトSV | `cANncTf97w8` | 65구절 | 106자 (전수 매핑) |
| **超主人公 (Super Superhero)** | ピノキオピー feat. 初音ミク | `thmR2SmkeDU` | 65구절 | 88자 (전수 매핑) |
| **からっぽの久遠 (Karappo no Kuon)** | Aliey:S feat. 初音ミク | `IoAq-sqLPhg` | 70구절 | 86자 (전수 매핑) |
| **花弁、それにまつわる音声 (Kaben, Sore ni Matsuwaru Onsei)** | あばらや feat. 初音ミク | `LW1KBCgvEPQ` | 39구절 | 93자 (전수 매핑) |
| **ダイダイダイダイダイキライ (Daidaidaidaidaikirai)** | 雨良 Amala feat. 初音ミク VS 重音テト | `klIxS5o65C4` | 68구절 | 127자 (전수 매핑) |
| **ファンファーレ (Fanfare)** | sumika | `7N8oan7fwfk` | 37구절 | 69자 (전수 매핑) |
| **萬屋レストラン (Yorozuya Restaurant)** | 暖炉P feat. 鏡音リン, 鏡音レン, 初音ミク | `7gv4MLe1ZRg` | 39구절 | 53자 (전수 매핑) |
| **D/N/A** | Azari feat. 重音テト, flower | `j9RGt9Z_UeE` | 39구절 | 54자 (전수 매핑) |
| **インテグラル (Integral)** | *Luna feat. 初音ミク | `gjLYd3iyPKM` | 67구절 | 98자 (전수 매핑) |
| **化けの花 (Bake no Hana)** | なきそ feat. 初音ミク | `jaSJ4t2ITW8` | 34구절 | 35자 (전수 매핑) |
| **ニャルラト (Nyarlathotep)** | 藤原ハガネ feat. 重音テトSV, 初音ミク | `z1imm_yPUHI` | 40구절 | 151자 (전수 매핑) |
| **わたしまだBABY (Watashi Mada BABY)** | MIMI feat. 狐子 | `q8Ap-1MUTew` | 34구절 | 52자 (전수 매핑) |
| **冬晴れステップ (Fuyubare Step)** | きさら feat. 初音ミク | `BupJ_OLUBMw` | 32구절 | 62자 (전수 매핑) |
| **少女A (Young Girl A)** | 椎名もた feat. 鏡音リン | `AqI97zHMoQw` | 29구절 | 65자 (전수 매핑) |
| **Time Traveler** | EMIRI feat. 初音ミク | `MhPXMcL9PBU` | 46구절 | 62자 (전수 매핑) |
| **SHOOTING STARS** | めろくる feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, MEIKO, KAITO | `EA1H2wHa7iU` | 72구절 | 80자 (전수 매핑) |
| **微熱のリリック (Binetsu no Lyric)** | MIMI feat. 重音テトSV | `qXvVt75kNmE` | 41구절 | 67자 (전수 매핑) |
| **聖人君子でありたい (Seijin Kunshi de Aritai)** | しゃいと feat. 重音テトSV | `hrBjKBPNi1c` | 51구절 | 109자 (전수 매핑) |
| **T氏の話を信じるな (Don’t Believe in T)** | ピノキオピー feat. 初音ミク・重音テト | `Jtm6ikBIl0g` | 70구절 | 92자 (전수 매핑) |
| **弱虫モンブラン (Reloaded) (Yowamushi Montblanc)** | DECO*27 feat. 初音ミク | `euRzG6zmEb8` | 25구절 | 53자 (전수 매핑) |
| **チェリーポップ (Cherry Pop)** | DECO*27 feat. 初音ミク | `BI9Ue6JwJic` | 69구절 | 48자 (전수 매핑) |
| **イレギュラーマン (Irregular Man)** | マサラダ feat. 重音テトSV | `KOcReuSy67Y` | 60구절 | 99자 (전수 매핑) |
| **いますぐ輪廻 (Imasugu Rinne)** | なきそ feat. 初音ミク | `3iUgKH8c7p4` | 42구절 | 60자 (전수 매핑) |
| **ストリートライト (Streetlight)** | Negi Shower P feat. 初音ミク, 鏡音リン, 鏡音レン, 巡音ルカ, KAITO, MEIKO | `NPOhKU5VTrQ` | 55구절 | 110자 (전수 매핑) |
| **散り散り (Chilly)** | 読谷あかね feat. 重音テト | `Xn-JobZlsQo` | 20구절 | 108자 (전수 매핑) |
| **ミカンセイニンゲン (Mikansei Ningen)** | ミ瑞 feat. 可不、知声、重音テトSV | `P5nKiqaRo1M` | 76구절 | 77자 (전수 매핑) |
| **デロデロデロデ (Deroderoderode)** | cosMo＠暴走P feat. 初音ミク | `gX_EUiEdur8` | 54구절 | 73자 (전수 매핑) |
| **アベリア (Abelia)** | Aliey:S feat. 初音ミク | `wYlH_sR-8cA` | 86구절 | 83자 (전수 매핑) |
| **天天天国地獄国 (Tentengoku Jigokukoku)** | covered by 初音ミクV4X & 重音テトSV | `xSfIAqxG1OM` | 62구절 | 85자 (전수 매핑) |
| **エンパープル (Empurple)** | はるまきごはん feat. 初音ミク | `InZ7GOU-CQ8` | 42구절 | 82자 (전수 매핑) |
| **成れなｲ (Can't becoME)** | 雨曇 feat. 重音テトSV, 重音テト | `7OqQ0HYPJVY` | 43구절 | 71자 (전수 매핑) |
| **ルサンチマン (Ressentiment)** | Aliey:S feat. 初音ミク | `vfk8bohEreg` | 56구절 | 62자 (전수 매핑) |
| **Spoken For** | FLAVOR FOLEY ft. 重音テト | `LvYL8u4p-aM` | 71구절 | 127자 (전수 매핑) |
| **エターナルアリア (Eternal Aria)** | Adeliae feat. 初音ミク | `GHzCL_6v87Y` | 41구절 | 101자 (전수 매핑) |
| **きおくをみたの (Kioku wo Mita no)** | まかろり feat. 初音ミク | `DNltbDXaKw8` | 46구절 | 90자 (전수 매핑) |
| **モニタリング (Best Friend Remix)** | DECO*27 feat. 初音ミク | `C-CYwNz3z8w` | 48구절 | 82자 (전수 매핑) |
| **ハピフルエンサー！ (Happyfulencer!)** | irucaice × 市瀬るぽ × Ponchi♪ feat. 初音ミク | `WGNLYKPuIUQ` | 56구절 | 90자 (전수 매핑) |
| **成長痛 (Seichoutsuu)** | Iori Kanzaki feat. 梵そよぎ | `RXuoTY1neiU` | 63구절 | 104자 (전수 매핑) |
| **Écho ｢ミロワール｣ (Miroir)** | Écho feat. 初音ミク | `un4S1RoQo7A` | 25구절 | 52자 (전수 매핑) |
| **怪獣になりたい (Kaijuu ni Naritai)** | Sakuzyo feat. 初音ミク | `TbakFPc4ZTw` | 31구절 | 47자 (전수 매핑) |
| **さざめき、とどめき、大百鬼夜行！** | netuki feat. 初音ミク | `7V8L9otIYMg` | 46구절 | 141자 (전수 매핑) |
| **オデッセイ (Odyssey)** | 織井辺コフィ feat. 星界 | `KjJL_8x43OA` | 49구절 | 117자 (전수 매핑) |
| **超限界バスター (Chougenkai Buster)** | ¿? feat. 重音テト | `PKXJWt0Pcfs` | 59구절 | 54자 (전수 매핑) |
| **スマート??? (Smart???)** | まらしぃ feat. 鏡音リン | `xDuxw1rsNWo` | 59구절 | 86자 (전수 매핑) |
| **全部夢だった！ (Zenbu Yume Datta!)** | 黒うさぎ feat. 重音テトSV | `z13hzDHruo8` | 32구절 | 50자 (전수 매핑) |
| **初音ミクシンフォニー10thテーマ曲『プレイオン』 (Play On)** | Mitchie M | `CXkY-vWeuRI` | 60구절 | 119자 (전수 매핑) |
| **彗星ノ銀河 (Suisei no Ginga)** | マツシタレオ feat. 初音ミク | `HDwPGObRmXE` | 31구절 | 77자 (전수 매핑) |
| **ネバーランド (Neverland)** | DECO*27 feat. 初音ミク | `48Csilkjev0` | 55구절 | 66자 (전수 매핑) |
| **ドクヘビ (Dokuhebi)** | かめりあ feat. 初音ミク | `n1q-R6iNxRE` | 70구절 | 134자 (전수 매핑) |
| **アイアイ傘 (Aiaigasa)** | ハム feat. 雨衣 | `e5_XSeN9Y4k` | 35구절 | 65자 (전수 매핑) |
| **Vermillion** | sumika | `Epd7n5fqoNw` | 53구절 | 95자 (전수 매핑) |
| **あんたは死んだ (Anta wa Shinda)** | カンザキイオリ feat. 重音テトSV | `bKA5FxTBujA` | 67구절 | 100자 (전수 매핑) |
| **tig-hug** | sasakure.UK feat. GUMI | `AO81V78Dtwo` | 52구절 | 74자 (전수 매핑) |
| **Leucocoryne (リュウココリネ)** | ryuryu feat. 初音ミク | `fFitoGwCITo` | 28구절 | 75자 (전수 매핑) |
| **パレードレコード (Parade Record)** | きさら feat. 初音ミク | `z7UF260NtyU` | 72구절 | 109자 (전수 매핑) |
| **バカみたいじゃん (Baka Mitai jan)** | あくたり (Aktari) feat. 重音テトSV | `2CnLNnY5QME` | 39구절 | 55자 (전수 매핑) |
| **Blusher (臙脂)** | om feat. 重音テト | `9HUMT9F7baM` | 48구절 | 80자 (전수 매핑) |
| **星降るココロ (Hoshifuru Kokoro)** | MIMI feat. 初音ミク | `Mb9TWJm_5L4` | 21구절 | 51자 (전수 매핑) |
| **Pain** | めろくる (Mellowcle) feat. 初音ミク | `X2CFrEDiDyY` | 53구절 | 70자 (전수 매핑) |
| **シスターシスター (Sister Sister)** | せきこみごはん feat. 初音ミク | `AvctZU1E_7Q` | 38구절 | 83자 (전수 매핑) |
| **回生 (Kaisei)** | ゆくえわっと feat. 健音テイ, 暗鳴ニュイ, 湯鬱声からす | `U0YMFCYVzCI` | 41구절 | 83자 (전수 매핑) |
| **あたしの廃園 (Atashi no Haien)** | 溝野あわ feat. 重音テトSV | `xYJkF7EMyP8` | 35구절 | 47자 (전수 매핑) |
| **マジカル☆ミラクル☆メタギャルフォーゼ (MAGICAL☆MIRACLE☆METAGALPHOSE)** | ふるーり feat. 重音テトSV | `WYTSF1soBZs` | 60구절 | 108자 (전수 매핑) |
| **ジェヘナ (Gehenna)** | Earthy X6 (Cover) [wotaku feat. 巡音ルカ, MEIKO, KAITO] | `seXI1A6tMmA` | 54구절 | 120자 (전수 매핑) |
| **Boo!Boo!エトランゼ (Boo!Boo!Etranger)** | きさら feat. v flower & Ci flower | `VHmrMK5K2aY` | 51구절 | 65자 (전수 매핑) |
| **トレジャーガーデン (Treasure Garden)** | Ponchi♪ feat. 初音ミク | `RIpHyjsv_84` | 47구절 | 44자 (전수 매핑) |
| **MEGANE GIRL MEGANE BOY** | WONDERFUL★OPPORTUNITY! feat. 鏡音リン・鏡音レン | `la6_f-oUFHE` | 58구절 | 77자 (전수 매핑) |
| **ポリビュー (polyview)** | いえぬ feat. 初音ミク | `6HSKCce8abM` | 35구절 | 73자 (전수 매핑) |
| **空奏ジャンプ (Kuusou Jump)** | ナナホシ管弦楽団 feat. 初音ミク | `5qMb-ZGmT1w` | 47구절 | 84자 (전수 매핑) |
| **にゅー！支配者のキャロル (New! Shihaisha no Carol)** | 藤原ハガネ feat. 里石ユカ | `UnlgVoWd7hI` | 45구절 | 121자 (전수 매핑) |
| **Do not tap** | Shü feat. 重音テトSV・音街ウナSV | `rMlC5UQM9qI` | 40구절 | 103자 (전수 매핑) |
| **ウニ (Uni / 성게)** | Adeliae feat. 雨衣 | `fi3YjlKlpRU` | 38구절 | 77자 (전수 매핑) |
| **目撃！テト31世 (Mokugeki! Teto 31-sei)** | はろける feat. 雨衣・重音テト | `uWMr16O_Aso` | 56구절 | 43자 (전수 매핑) |
| **カートゥーンガール (Cartoon Girl)** | Kanaria feat. GUMI | `BY7CnLX5Mk0` | 24구절 | 22자 (전수 매핑) |
| **だれかぬいてくれ (DAREKANUITEKURE)** | ぬぬぬぬぬぬぬぬ feat. 音街ウナSV & タカハシアマト | `VgLNfVougpI` | 61구절 | 42자 (전수 매핑) |
| **キネティックタウン (Kinetic Town)** | 晴いちばん feat. 初音ミク | `AdT_lmdC39g` | 29구절 | 73자 (전수 매핑) |
| **死神は瞑目、月明かりこそがハイライト。 (Aliey:S Remix)** | Project Lumina - Aliey:S Remix feat. 初音ミク | `DOai_KjDGh0` | 88구절 | 137자 (전수 매핑) |
| **ぐるぐる (Guruguru)** | OLDUCT feat. 歌愛ユキ & 初音ミク | `ympFwEAUqc0` | 65구절 | 23자 (전수 매핑) |
| **けっかおーらい (Kekka Orai)** | こっちのけんと | `Ug0N4qGRp_w` | 70구절 | 86자 (전수 매핑) |
| **やる気が出ない歌 (Yaruki ga Denai Uta)** | えいぷ feat. 初音ミク・重音テト | `xAwnI9AraXs` | 85구절 | 119자 (전수 매핑) |
| **ずんだタコヤーキ (Zunda Takoyaaki)** | なみぐる feat. ずんだもん・琴葉茜 | `pbb7EQx-7tA` | 71구절 | 40자 (전수 매핑) |
| **メルトアイスクリーム (Melt Ice Cream)** | TRAP CHICK feat. 初音ミク・重音テト | `aDA1B_We5w8` | 51구절 | 81자 (전수 매핑) |
| **Pretender** | Official髭男dism | `TQ8WlA2GXbk` | 52구절 | 96자 (전수 매핑) |
| **スプリットダンス (Split Dance)** | えいぷ feat. 初音ミク・重音テト | `R401j1QAvEg` | 58구절 | 116자 (전수 매핑) |
| **地獄行きの列車に乗ってさらば！ (Jigoku-yuki no Ressha ni Notte Saraba!)** | Aliey:S feat. 初音ミク | `oz-NYTQXA9o` | 95구절 | 106자 (전수 매핑) |
| **次元通信 (Signaling)** | AnythingBecomeMoe feat. 初音ミク・重音テト | `PqpCRSOUuIE` | 56구절 | 103자 (전수 매핑) |
| **杏仁dope (Annin Dope)** | なみぐる feat. 可不 | `fFL9NeOF7XM` | 83구절 | 75자 (전수 매핑) |
| **バゥムクゥヘン・エンドロゥル (Baumkuchen End Roll)** | 雨良 feat. 初音ミクVS重音テトVS亞北ネル | `Dz5rALpx06M` | 51구절 | 114자 (전수 매핑) |
| **ループザルーム (Looping the Rooms)** | ルシノ feat. 初音ミク | `icBDYkfxpMs` | 42구절 | 48자 (전수 매핑) |
| **桜日和とタイムマシン (Sakurabiyori to Time Machine)** | Ado with 初音ミク | `nIWZfhpnq6M` | 35구절 | 76자 (전수 매핑) |
| **妄想アスパルテーム (Mousou Aspartame)** | picco feat. 初音ミク | `36LsS8T5RHE` | 53구절 | 65자 (전수 매핑) |
| **『トリックハート』 (Trick Heart)** | MIMI feat. 重音テトSV | `uoYegcqyfxE` | 40구절 | 67자 (전수 매핑) |
| **弱者のマーチ (March of the Weak)** | えいぷ feat. 重音テト | `IxSvgPhdc8c` | 62구절 | 144자 (전수 매핑) |
| **とろいめもりー (Trois Memory)** | 豆カカオ feat. 初音ミク | `92gM1Kqm8n8` | 57구절 | 130자 (전수 매핑) |
| **それもいいね (Sore mo Ii ne)** | こっちのけんと | `URHwwFNdJ5Y` | 36구절 | 39자 (전수 매핑) |
| **どこにもいかない (Dokonimo Ikanai)** | マサラダ feat. 雨衣 | `xJULqAHbst0` | 29구절 | 32자 (전수 매핑) |
| **ぼくはそれで委員会! (Boku wa Sore de Iinkai!)** | 薄塩指数 ft. 重音テトSV | `fReNcRnVnS8` | 36구절 | 54자 (전수 매핑) |
| **命辛辛 (Inochigaragara / For dear life)** | 煮ル果実 feat. v flower | `QTxvUA4l0Vs` | 53구절 | 145자 (전수 매핑) |
| **花びら哀歌 (Hanabira Aika)** | MIMI feat. 重音テトSV | `IxVFW1XIW7Q` | 27구절 | 53자 (전수 매핑) |
| **流季想 (Ryukisou)** | Project Lumina feat. 初音ミク | `Z0iDS-m2uW4` | 61구절 | 66자 (전수 매핑) |
| **だ・し・て (Da・Shi・Te)** | はろける feat. 初音ミク & 重音テトSV | `c4UFhgGrRCk` | 57구절 | 69자 (전수 매핑) |
| **アンチドリームロマンチスト (Anti-Dream Romanticist)** | テンタクル忍者 feat. 初音ミク | `kRTcFyjvUtE` | 72구절 | 82자 (전수 매핑) |

---

## 🛠️ 기술 스택 (Tech Stack)

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Flexbox Ruby Zero-Gap Architecture
- **Media**: YouTube IFrame Player API
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage (`utastudy_songs_v12`)
- **Fonts**:
  - 한글/공통: Pretendard (Gothic / Sans)
  - 일본어 명조: Shippori Mincho B1 (Google Fonts)
  - 일본어 고딕: Noto Sans JP

---

## 🚀 시작하기 (Getting Started)

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn / pnpm

### 설치 및 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/dt-psb/UtaStudy.git
cd UtaStudy

# 2. 의존성 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 프로덕션 빌드

```bash
# TypeScript 컴파일 및 Vite 번들링
npm run build

# 빌드 결과물 미리보기
npm run preview
```

---

## 📄 라이선스 (License)

This project is licensed under the MIT License.
