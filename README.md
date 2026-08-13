# 칩타이쿤 · ChipTycoon (한국어)

<p align="center">
  <a href="https://sigco3111.github.io/chiptycoon-kr/"><img alt="Live Demo" src="https://img.shields.io/badge/Live_Demo-GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white" /></a>
  <a href="https://github.com/sigco3111/chiptycoon-kr"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-sigco3111%2Fchiptycoon--kr-181717?style=for-the-badge&logo=github" /></a>
  <a href="https://laurentiugabriel.github.io/ChipTycoon/"><img alt="Original" src="https://img.shields.io/badge/Original-LaurenGabriel%2FChipTycoon-blue?style=for-the-badge" /></a>
</p>

<p align="center">
  <a href="#hero">🇰🇷 한국어</a> · <a href="#english">🇬🇧 English (mirror)</a>
</p>

---

<a id="hero"></a>

## 🇰🇷 한국어

> **칩 공장을 테마파크처럼 펼쳐놓았습니다. 한 줌의 모래가 시작해서 데이터센터의 서버 랙이 끝입니다.**

아이소메트릭 공원 안에서 카트가 한 장의 실리콘 웨이퍼를 싣고 도로를 따라 다닙니다. 카트는 스무 개의 건물 사이를 지나면서, 보통 모래를 컴퓨터 칩으로 바꾸는 20단계 공정을 모두 보여줍니다. 화물인 웨이퍼는 정류장마다 형태가 바뀌기 때문에, "지금 어느 단계인가"를 항상 한눈에 알 수 있습니다. 마지막 두 정류장에서 칩은 트럭에 실려 데이터센터로 배달되어 일을 시작하고, 트럭은 다시 게이트로 돌아가 다음 웨이퍼를 시작합니다 — **한 공정은 세 달이 걸리지만, 이 투어에서는 4바퀴로 압축**됩니다.

```
   ┌─ 테마파크 (한 바퀴 22개 정류장) ────────────────────────────┐
   │                                                              │
   │   [모래]→[용광로]→[정제]→[잉곳]→[와이어 쏘]→[연마]         │
   │      ↓                                                     ↓ │
   │   [설계실]→[마스크]→[클린룸]                              │
   │      ↓                                                     ↓ │
   │   [층형성]→[스핀]→[인쇄]→[식각]→[이온건]→[배선]→[루프]   │
   │      ↓ (4바퀴 반복)                                       ↓ │
   │   [테스트]→[다이싱]→[패키징]→[출하]                       │
   │      ↓                                                     ↓ │
   │   [상하차장]→[트럭]→[데이터센터]→(루프 복귀)               │
   └──────────────────────────────────────────────────────────────┘
```

### 🚀 시작하기

| 채널 | URL |
|---|---|
| 🌐 **라이브 데모 : https://sigco3111.github.io/chiptycoon-kr/** | **<https://sigco3111.github.io/chiptycoon-kr/>** |
| 💻 GitHub 저장소 | <https://github.com/sigco3111/chiptycoon-kr> |
| 🇬🇧 원본 (영문) | <https://laurentiugabriel.github.io/ChipTycoon/> |

> 💡 **팁**: 라이브 데모는 빌드 도구 / 설치 / 다운로드 없이 브라우저에서 바로 실행됩니다. 첫 가이드 투어(약 9분)가 끝나면 공원이 자동으로 가볍게 보는 속도로 바뀝니다.

### 🎯 라이브 데모가 보여주는 것

브라우저에서 처음 페이지를 열면, 공원이 정지된 상태에서 카트가 모래 채굴장에 있고, 누른 키에 따라 다음이 실시간으로 시각화됩니다:

| HUD 라벨 | 라이브 수치 예시 | 의미 |
|---|---|---|
| 방문한 정류장 | `0 / 22` | 현재까지 본 정류장 수 |
| 층 | `1 / 4` | 인쇄 루프 진행 (실제 칩은 약 60층) |
| 웨이퍼 | `#1` | 처리 중인 웨이퍼 번호 |

**`정보` 모달**을 열면, "이 공원이 실제로 무엇을 보여주고 무엇을 단순화했는지"가 정리돼 있습니다.

### 🧱 무엇이 다른가 — 한국어 vs 원본

| 항목 | 원본 (영문) | 이 포크 (한국어) |
|---|---|---|
| 사용자 가시 영문 UI 텍스트 | 22개 빌딩 × 5필드 + HUD + 패널 + About 본문 (~150개) | **0개** — 전부 한국어로 교체 |
| 22개 빌딩 이름/태그/본문 | 영문 | 한국어 (예: *Sand Pit → 모래 채굴장*, *Wire Saw → 와이어 쏘*, *The Printer → 인쇄기*) |
| 5막 이름 | 영문 (Act 1~5) | 한국어 (1막·모래에서 웨이퍼로 등) |
| 헤더 / HUD / 패널 / About 모달 | 영문 | 한국어 |
| `<html lang>` | `"en"` | `"ko"` |
| 빌드 도구 / 의존성 | 없음 | 없음 (원본 그대로 보존) |
| 시뮬레이션 / 그래픽 / 애니메이션 로직 | — | 원본 그대로 (수정 없음) |

한국어 번역은 **하드코딩 교체 방식**입니다 — 원본에 i18n 사전·토글 시스템이 없었기 때문에, 모든 영문 텍스트를 한국어로 직접 교체했습니다. 원본 구조·동작·게임 로직은 한 줄도 건드리지 않았습니다.

### 🗺️ 22개 정류장 (5막 구성)

| 막 | 정류장 (한국어) | 정류장 (원본 영문) | 단계 |
|---|---|---|---|
| **1막** · 원료 | 모래 채굴장 | Sand Pit | 석영 모래 |
| | 용광로 | Furnace | 99% 실리콘 |
| | 정제탑 | Purifier | 9-nines 다결정 실리콘 |
| | 단결정 인발기 | Crystal Puller | 2m 은빛 원기둥 |
| | 와이어 쏘 | Wire Saw | 웨이퍼 |
| | 연마기 | Polisher | 거울 웨이퍼 |
| **2막** · 설계 | 설계실 | Design Lab | 회로 도면 |
| | 마스크 작업실 | Mask Shop | 60장 유리 스텐실 |
| | 클린룸 입구 | Cleanroom Gate | <10 입자/m³ |
| **3막** · 인쇄 (×4 루프) | 층 형성로 | Layer Tube | 박막 코팅 |
| | 스핀 코터 | Spin Coater | 포토레지스트 |
| | 인쇄기 | The Printer | EUV 노광 |
| | 식각실 | Etch Bay | 수직 벽 식각 |
| | 이온 건 | Ion Gun | 이온 주입 |
| | 배선층 | Wire Floor | 구리 다마스신 |
| | 루프 계산소 | The Loop Counter | ×4 회 반복 |
| **4막** · 완성 | 테스트 베이 | Test Bay | 웨이퍼 프로브 |
| | 다이싱 쏘 | Dicing Saw | 다이 절단 |
| | 패키징 | Packaging | 케이스 |
| | 출하 게이트 | Shipping Gate | 등급별 분류 |
| **5막** · 배달 | 상하차장 | Loading Dock | 트럭 |
| | 데이터센터 | Data Centre | 서버 랙 |

### 🎮 조작법

| 키 / 동작 | 의미 |
|---|---|
| **스페이스바** | 재생/일시정지 (어느 정류장에서든 계속 머무를 수 있음) |
| **S** | 다음 정류장으로 건너뛰기 |
| **R** | 가이드 투어 다시 시작 |
| **F** | 카메라 따라가기 |
| **L** | 사인 표시 |
| **드래그** | 화면 이동 |
| **스크롤** | 확대/축소 |
| **더블 클릭** | 공원 전체 보기 |
| **+ − ⤢** | 왼쪽 가장자리의 줌 컨트롤, ⤢은 공원 전체 보기 |
| **건물 클릭** | 설명을 고정 (빈 바닥을 누르면 해설로 복귀) |

### 🎚️ 슬라이더

| 슬라이더 | 범위 | 효과 |
|---|---|---|
| **속도** | 0.4× ~ 6× | 정류장 정지 시간 포함 모두 비례 |

### 📐 정확도 매트릭스 (How accurate is it)

원본 README의 "How accurate is it"을 그대로 가져온 표 — 공원이 실제로 무엇을 보여주고 무엇을 단순화했는지:

| 범주 | 내용 |
|---|---|
| ✅ **실제 공정** | 석영 모래 · 탄소 환원 · 지멘스 정제 · 초크랄스키 단결정 성장 · 와이어 쏘잉 · 연마 · 박막 증착 · 포토레지스트 · 노광 · 현상·식각 · 이온 주입 · 구리 다마스신 배선 · 웨이퍼 프로브 · 다이싱 · 패키징 · 최종 선별 · 트럭으로 트레이 운반 |
| ⚖️ **축소** | 4바퀴 (vs 실제 약 60층) · 한 장의 웨이퍼 (vs 병렬로 많은 웨이퍼) · 1분 걸어 도는 공원 크기 (vs 축구장 몇 개짜리 공장) |
| 📋 **인용된 수치** | "보통 범위" — 제품에 따라 천차만별이므로 정확한 숫자 대신 경향 위주 |
| 🎭 **풍경** | 모든 도형은 평범한 다각형 — 도식화된 일러스트레이션 |

> 인용된 수치는 제품마다 다릅니다. 대략적인 범위로 적혀 있어, 자세한 수치가 궁금하면 별도 학습 자료를 참고하세요.

### 🏃 진행 속도

| 단계 | 시간 | 설명 |
|---|---|---|
| 첫 가이드 투어 | 약 **9분** | 정류장마다 10~22초 정지, 본문 길이에 비례 |
| 그 이후 | 가볍게 보는 속도 | 모든 정류장이 한 번씩 설명된 뒤 빠르게 진행 |
| HUD 안내 | 표시 | "모든 정류장 설명 완료 · 가볍게 보는 속도로 재생 중" 같은 메시지 |
| **⟲ (R)** | — | 천천히 진행하는 안내 투어를 처음부터 다시 |
| **스페이스바** | — | 어느 정류장에서든 원하는 만큼 정지 |

### 🧩 로컬에서 실행

정적 사이트라 브라우저에서 `index.html`을 열기만 하면 됩니다.

```bash
cd /Users/mac/work/chiptycoon-kr

# 방법 1 — 그냥 열기
open index.html          # macOS
xdg-open index.html      # Linux

# 방법 2 — 로컬 서버 (모바일 / CORS 회피 시 권장)
python3 -m http.server 8000
# → http://localhost:8000
```

빌드 도구가 없고 외부 라이브러리도 없습니다. 모든 도형은 캔버스 2D에 폴리곤만으로 그려집니다.

### 📦 디렉토리 구조

```
.github/workflows/  GitHub Pages 배포
index.html          마크업, 컨트롤, About 모달 (한국어)
css/styles.css      라이트 미니멀 UI
js/iso.js           아이소메트릭 투영 + 박스/프리즘/실린더/원뿔 프리미티브
js/park.js          22개 빌딩 + 도로 + 정류장 (한국어 데이터)
js/render.js        캔버스 2D painter's-algorithm 렌더러
js/tour.js          카트가 공원을 도는 상태 기계
js/ui.js            패널, 내레이션, 컨트롤 (한국어 라벨)
js/main.js          카메라, 입력, 프레임 루프
```

`Park.routes`가 카트가 도는 폴리라인을, `Park.stops`가 거리를 정류장 ID로 매핑합니다. `Tour`가 카트가 정류장에 도착하면 단계 핸들러를 발화하고, 그 안에서 카트의 화물(웨이퍼)이 변하는 모습이 그려집니다.

### 🌐 배포

| 항목 | 값 |
|---|---|
| 호스팅 | GitHub Pages (`gh-pages` 브랜치) |
| 빌드 | 없음 (순수 정적 HTML/CSS/JS) |
| 자동배포 | ✅ `gh-pages` 브랜치 push → GitHub Pages 즉시 반영 |
| 배포 방식 | `gh-pages` 브랜치 직접 배포 · Actions 워크플로도 포함 |

### 🌍 영문 미러

원본 영문 README의 한국어 미러는 본 저장소에 없습니다 — 원본 자체가 영문이므로 <https://laurentiugabriel.github.io/ChipTycoon/> 으로 가시면 됩니다.

### 📜 원본 attribution

| | |
|---|---|
| 원본 저장소 | <https://github.com/LaurentiuGabriel/ChipTycoon> |
| 원작자 | Laurentiu Gabriel ([@LaurentiuGabriel](https://github.com/LaurentiuGabriel)) |
| 원본 라이선스 | 명시되지 않음 (저장소에 `LICENSE` 파일 없음) — 공개 GitHub 저장소이나 라이선스 표기 부재. 사용 전 원작자 문의 권장 |
| 라이브 데모 (원본) | <https://laurentiugabriel.github.io/ChipTycoon/> |
| 클론 시점 | 2026-08-11 |
| 한국어 번역 | sigco3111 ([@sigco3111](https://github.com/sigco3111)) |
| 한국어 저작물 라이선스 | MIT |

원본 게임 로직·그래픽·애니메이션은 모두 원작자의 것입니다. 이 저장소는 **한국어화 (사용자 가시 텍스트의 한국어 교체) + GitHub Pages 배포 환경 구성만** 추가합니다.

### 📋 상태 뱃지

| | |
|---|---|
| ✅ Live Demo : <https://sigco3111.github.io/chiptycoon-kr/> (GitHub Pages, 자동배포 활성화) |
| 📄 한국어 | UI 100% (사용자 가시 영문 잔재 0개) |
| 🔓 License | 한국어 저작물은 MIT · 원본은 라이선스 미명시 |
| 🤖 Build | `MiniMax-M3` + Hermes Agent로 번역 및 배포 |
| ⚡ Runtime | 순수 정적 사이트, 빌드 도구 0, 외부 라이브러리 0, 네트워크 호출 0 |

### ❓ FAQ

<details>
<summary><b>Q. 왜 i18n 시스템(언어 토글) 없이 한국어만 있나요?</b></summary>

원본에 i18n 사전·언어 토글이 없었기 때문에, 가장 단순한 "ko 하드코딩" 방식을 채택했습니다. 토글을 원하시면 별도 요청 주세요 — `js/dict.js` 사전 + `lang` 변수를 추가하는 작업이 필요합니다.

</details>

<details>
<summary><b>Q. 한자/혼종 문자가 있나요?</b></summary>

없음 — 모든 텍스트가 자연스러운 한국어입니다 (한자 0개 확인).

</details>

<details>
<summary><b>Q. 원본에 PR을 보낼 수 있나요?</b></summary>

원작자가 명시한 라이선스가 없고 한국어화는 본 저장소의 한국어 저작물이라 PR 대상이 아닙니다. 본 저장소는 **독립 운영**됩니다.

</details>

<details>
<summary><b>Q. 다른 게임도 한국어 포크가 있나요?</b></summary>

같은 작가의 시리즈 3부작이 모두 한국어 포크로 배포되어 있습니다:

| 게임 | 라이브 | 저장소 |
|---|---|---|
| 🏭 칩타이쿤 (이 저장소) | <https://sigco3111.github.io/chiptycoon-kr/> | <https://github.com/sigco3111/chiptycoon-kr> |
| 🏙️ 토큰타운 | <https://sigco3111.github.io/token-town-kr/> | <https://github.com/sigco3111/token-town-kr> |
| 🏎️ 엔진웍스 | <https://sigco3111.github.io/engineworks-kr/> | <https://github.com/sigco3111/engineworks-kr> |

</details>

---

<a id="english"></a>

## 🇬🇧 English (mirror)

This repository is the **Korean-language independent fork** of [LaurentiuGabriel/ChipTycoon](https://github.com/LaurentiuGabriel/ChipTycoon), an isometric theme park that is really a chip factory. All user-visible English text has been replaced with Korean.

- **Live Demo : <https://sigco3111.github.io/chiptycoon-kr/>**
- **Original (English)**: <https://laurentiugabriel.github.io/ChipTycoon/>
- **What changed**: 22 buildings × 5 fields + HUD + panel + About modal — all Korean
- **What did NOT change**: simulation math, isometric graphics, canvas renderer, animation logic — all original

The original work is by Laurentiu Gabriel ([@LaurentiuGabriel](https://github.com/LaurentiuGabriel)). The Korean translation layer (the file contents under `index.html`, `js/park.js`, `js/ui.js`) is © sigco3111 under MIT.

<p align="right">
  <a href="#hero">⬆️ back to top</a>
</p>