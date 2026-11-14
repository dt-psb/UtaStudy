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

---

## 🛠️ 기술 스택 (Tech Stack)

- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Flexbox Ruby Zero-Gap Architecture
- **Media**: YouTube IFrame Player API
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage (`utastudy_songs_v7`)
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
