# ComputerBook 챕터 작성 가이드

## 기여물의 라이선스

기여하는 코드는 MIT, 교재 콘텐츠는 CC BY 4.0으로 제공하는 데 동의해야 합니다. HTML 안에 코드와 콘텐츠가 함께 있어도 각 부분에 해당하는 라이선스를 적용합니다. 적용 범위는 [라이선스 안내](LICENSE.md)를 참고하세요.

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`.
로컬 실행: `python3 -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 사용한다. ES module 금지.)

## 원칙
- **한국어**, 대상은 **컴퓨터 구조를 배운 적 없는 일반인**. 전문 용어는 처음 나올 때 쉬운 말로 풀고 `<span class="term">캐시</span><span class="en">(cache)</span>`처럼 원어를 병기한다.
- 수식 대신 비유와 숫자 감각을 쓴다. 책 전체의 공통 비유는 **주방**이다(CPU = 요리사, 레지스터 = 손, 캐시 = 선반, RAM = 조리대, SSD = 창고, GPU = 보조 요리사 군단, OS = 주방장, 프로그램 = 레시피, 네트워크 = 배달).
- 흐름: 질문/상황 → 비유(`.callout.analogy`) → 그림(SVG) → 시뮬레이터 → 실제 수치 → 핵심 정리 → 퀴즈.
- 앞 장의 개념을 쓸 때는 “(6장)”처럼 장 번호를 적어 연결한다.
- 수치는 실제 하드웨어의 대표적인 크기 수준을 쓰고, 단순화했다면 `sim-note`에 밝힌다.
- 외부 라이브러리는 쓰지 않는다(글꼴 CSS만 CDN). 이미지 파일 대신 인라인 SVG/canvas로 그린다.
- 색은 하드코딩하지 말고 CSS 변수(`var(--accent)` 등)나 `CB.palette()`를 쓴다. 라이트/다크 둘 다 읽혀야 한다.
- 모바일(폭 360px)에서 페이지 가로 스크롤이 생기면 안 된다. 넓은 그림은 `overflow-x:auto` 래퍼 안에 넣는다. SVG는 `viewBox`만 주고 width/height 속성 생략.

## head 템플릿
```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<title>캐시 · ComputerBook</title>
<meta name="description" content="한 문장 설명">
<link rel="stylesheet" href="../css/style.css">
<script src="../js/common.js"></script>
</head>
<body data-chapter="memory">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter 06</div>
    <h1>메모리와 캐시</h1>
    <p class="lead">...</p>
    <ul class="objectives"><li>...</li></ul>
  </header>

  <section id="intro"><h2>제목</h2> ... </section>   <!-- h2 번호와 우측 목차는 자동 생성 -->
  ...
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>...</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> ... </div></section>
</main>
<script> /* 페이지 스크립트: 여기서 CB 사용 */ </script>
</body>
</html>
```
상단바, 챕터 서랍, 목차, 이전/다음, 푸터, 테마 토글, 퀴즈 동작은 `common.js`가 자동 처리한다.
새 챕터는 `common.js`의 `CHAPTERS`에 `{ slug, num, part, title, desc, tags }`로 등록한 뒤 `python3 tools/seo.py`를 실행한다.

## 컴포넌트
- 그림: `<figure class="diagram"><svg viewBox="...">...</svg><figcaption><b>그림 6-1.</b> 설명</figcaption></figure>`
  - SVG 유틸 클래스: `.t .t-dim .t-mono .t-acc`, `.s-line .s-axis .s-acc`, `.f-surface .f-elev .f-acc .f-acc-soft .f-acc2-soft`
- 시뮬레이터: `.sim > .sim-head(.sim-tag + h3) + .sim-view(canvas) + .sim-controls(.ctrl, .seg, .check, .btn) + .sim-readout(.stat) + .sim-note`
  - `.sim-body.side`로 넓은 화면에서 컨트롤을 오른쪽에 둔다.
- 콜아웃: `.callout`(기본), `.tip`, `.warn`, `.analogy`(비유), `.deep`(더 알아보기)
- 코드: `<div class="codebox">` (`.k` 키워드, `.c` 주석, `.n` 숫자, `.s` 문자열, `.hl` 강조 줄)
- 비트 토글: `<button class="bit">0<small>128</small></button>`, 메모리 칸: `.cell` (+ `.hot .hot2 .ok .bad .warn`)
- 퀴즈: `.quiz-q > p + .opts > button.opt[data-correct]` + `.quiz-exp` (고른 답은 자동으로 진도에 저장·복원된다)
- 용어: `.term` 안의 글자가 `js/terms.js`의 표제어(괄호 앞부분, 영어 이름 포함)나 `CB_TERM_ALIAS`와 맞으면 자동으로 툴팁이 붙는다. 새 용어는 `CB_TERMS`에 `[한국어, 영어, 설명, 장 slug]`로 그 장 묶음 안에 추가한다.

## JS 헬퍼 (`js/common.js`, 전역 `CB`)
- `CB.canvas(el, (ctx,w,h)=>{}, {aspect, height, minHeight, maxHeight})` → `{redraw()}` HiDPI, 리사이즈·테마 변경 시 자동 redraw.
- `CB.chart(ctx, box|null, {x, y, logX, logY, xLabel, yLabel, series, vlines, hlines, points, bands, xFmt, yFmt})`
- `CB.loop(el, (dt,t)=>{})` 화면에 보일 때만 도는 애니메이션 루프.
- `CB.range(id, fmt, onInput)`, `CB.seg(id, onChange)`, `CB.stat(id, html)`
- 그리기: `CB.rrect`, `CB.box(ctx,x,y,w,h,{fill,stroke,text,color,size,bold,mono,r})`, `CB.arrow`, `CB.text`
- 숫자: `CB.bin(n,bits)`, `CB.hex(n,digits)`, `CB.bytes(b)`, `CB.time(s)`, `CB.kn(n)`(만·억·조), `CB.fmt`, `CB.si`
- 진도: `CB.progress.get(slug)`, `.last()`, `.doneCount()`, `.reset()` (localStorage `cb-progress-v1`)
- 기타: `CB.palette()`, `CB.color(name)`, `CB.isDark()`, `CB.onTheme(cb)`, `CB.rng(seed)`, `CB.clamp/lerp/map`, `CB.CHAPTERS`
