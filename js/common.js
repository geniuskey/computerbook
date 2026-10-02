/* ==========================================================================
   ComputerBook 공통 스크립트 — 전역 객체 CB
   - 레이아웃(상단바, 목차, 이전/다음, 테마) 자동 생성
   - 시뮬레이터 헬퍼: canvas, chart, range, seg, 그리기·포맷 유틸
   이 파일은 <head>에서 defer 없이 로드된다. 페이지 스크립트는 </body> 직전에 둔다.
   ========================================================================== */
(function () {
  "use strict";

  const CHAPTERS = [
    { slug: "intro",    num: "01", part: "시작하기", title: "컴퓨터는 무엇인가",          desc: "입력·처리·저장·출력. 컴퓨터 속 부품을 둘러보고, 나노초의 세계를 사람의 시간으로 느껴 본다.", tags: ["기초", "sim"] },
    { slug: "bits",     num: "02", part: "시작하기", title: "0과 1로 모든 것을",          desc: "비트와 이진수, 16진수, 글자·색·사진·소리를 숫자로 바꾸는 법. 바이트 단위 감각까지.", tags: ["데이터", "sim"] },
    { slug: "logic",    num: "03", part: "시작하기", title: "트랜지스터와 논리 게이트",    desc: "스위치에서 AND·OR·NOT으로, 게이트를 엮어 덧셈기와 1비트 기억 소자를 만든다.", tags: ["하드웨어", "sim"] },
    { slug: "cpu",      num: "04", part: "CPU",      title: "CPU: 명령을 수행하는 두뇌",   desc: "레지스터, ALU, 버스와 데이터 경로. 장난감 CPU로 명령어 사이클을 돌리고, 기계어를 해독하고, 함수 호출까지.", tags: ["CPU", "sim"] },
    { slug: "cpu-perf", num: "05", part: "CPU",      title: "더 빠른 CPU의 비밀",          desc: "클럭, 파이프라인, 슈퍼스칼라·비순차 실행, 분기 예측, 멀티코어와 암달의 법칙, 전력 계산기와 큰·작은 코어.", tags: ["CPU", "sim"] },
    { slug: "memory",   num: "06", part: "메모리",   title: "메모리와 캐시",               desc: "주소와 RAM, 메모리 계층, 캐시 적중과 실패, 지역성. 왜 '가까운 곳'이 빠른가.", tags: ["메모리", "sim"] },
    { slug: "storage",  num: "07", part: "메모리",   title: "저장장치와 파일",             desc: "HDD와 SSD의 동작 원리, 블록과 파일 시스템, 지워도 남는 데이터.", tags: ["메모리", "sim"] },
    { slug: "os",       num: "08", part: "운영체제", title: "운영체제: 컴퓨터의 관리자",   desc: "커널과 시스템 콜, 프로세스와 스레드, CPU 스케줄링, 인터럽트, 경쟁 상태와 잠금.", tags: ["OS", "sim"] },
    { slug: "vm",       num: "09", part: "운영체제", title: "가상 메모리",                 desc: "프로그램마다 주어지는 가짜 주소 공간. 페이지 테이블, TLB, 페이지 폴트, 교체 알고리즘, 스래싱.", tags: ["OS", "sim"] },
    { slug: "network",  num: "10", part: "네트워크", title: "네트워크의 기초",             desc: "패킷과 계층, IP 주소와 라우팅, TCP의 신뢰성. 데이터가 바다 건너가는 법.", tags: ["네트워크", "sim"] },
    { slug: "web",      num: "11", part: "네트워크", title: "웹 페이지가 열리기까지",      desc: "URL을 입력한 순간부터 DNS, TCP 연결, HTTPS 암호화, HTTP 요청, 화면 그리기까지.", tags: ["네트워크", "sim"] },
    { slug: "gpu",      num: "12", part: "GPU",      title: "GPU: 수천 개의 작은 일꾼",    desc: "CPU와 GPU의 차이, 대량 병렬 처리, 그래픽 파이프라인과 래스터화, AI가 GPU를 쓰는 이유.", tags: ["GPU", "sim"] },
    { slug: "program",  num: "13", part: "프로그램", title: "프로그램은 어떻게 실행되는가", desc: "소스 코드 → 컴파일 → 기계어 → 로딩 → 실행. 스택과 힙, 함수 호출을 눈으로 따라간다.", tags: ["소프트웨어", "sim"] },
    { slug: "journey",  num: "14", part: "종합",     title: "클릭 한 번의 여행",           desc: "메시지·웹 검색·게임·사진 네 장면으로 모든 계층이 함께 일하는 모습을 따라가고, 병목 실험실에서 느린 구간을 찾는다.", tags: ["종합", "sim"] },
    { slug: "io",       num: "15", part: "더 깊이",  title: "입출력과 버스",               desc: "장치와 대화하는 법. 폴링·인터럽트·DMA, USB·PCIe 대역폭, 화면이 그려지는 원리와 화면 찢김.", tags: ["하드웨어", "sim"] },
    { slug: "security", num: "16", part: "더 깊이",  title: "보안의 기초",                 desc: "해시와 비밀번호, 무차별 대입, 고전 암호가 깨지는 이유, 버퍼 오버플로, 피싱과 2단계 인증.", tags: ["보안", "sim"] },
    { slug: "ai",       num: "17", part: "더 깊이",  title: "AI는 어떻게 계산하나",        desc: "인공 뉴런과 학습, 경사 하강, 신경망과 행렬, 다음 단어 예측, 모델 크기와 GPU 메모리.", tags: ["AI", "sim"] },
    { slug: "build",    num: "18", part: "실습",     title: "나만의 컴퓨터 만들기",        desc: "예산 안에서 부품을 골라 조립하고, 부팅·게임·영상 편집·AI 작업을 돌려 병목을 찾는 미션 놀이터.", tags: ["실습", "sim"] },
    { slug: "glossary", num: "19", part: "종합",     title: "용어집 & 종합 퀴즈",          desc: "핵심 용어 199개를 검색하고, 35문항 종합 퀴즈로 배운 내용을 점검하자.", tags: ["정리"] },
  ];

  const CB = (window.CB = {});
  CB.CHAPTERS = CHAPTERS;

  /* ------------------------------------------------------------ math utils */
  CB.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  CB.lerp = (a, b, t) => a + (b - a) * t;
  CB.map = (x, a, b, c, d) => c + ((x - a) * (d - c)) / (b - a);
  CB.randn = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  CB.poisson = function (lambda) {
    if (lambda <= 0) return 0;
    if (lambda > 40) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * CB.randn()));
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  /** 숫자 포맷: 유효 자리 */
  CB.fmt = function (x, digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e5 || a < 1e-3) return x.toExponential(digits - 1).replace("e+", "e");
    return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  /** SI 접두사 포맷: CB.si(2.3e-9,'m') → "2.3 nm" */
  CB.si = function (x, unit = "", digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0 " + unit;
    const pre = [[1e12, "T"], [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"], [1e-15, "f"]];
    const a = Math.abs(x);
    for (const [v, p] of pre) if (a >= v * 0.9995) return Number((x / v).toPrecision(digits)) + " " + p + unit;
    return x.toExponential(digits - 1) + " " + unit;
  };

  /* ------------------------------------------------------------ number utils */
  /** 정수 → 2진 문자열(자리수 고정): CB.bin(5,8) → "00000101" */
  CB.bin = (n, bits = 8) => ((n >>> 0) & (bits >= 32 ? 0xffffffff : (1 << bits) - 1)).toString(2).padStart(bits, "0");
  /** 정수 → 16진 문자열: CB.hex(255,2) → "FF" */
  CB.hex = (n, digits = 2) => (n >>> 0).toString(16).toUpperCase().padStart(digits, "0");
  /** 바이트 수 → 사람이 읽는 단위 */
  CB.bytes = function (b, digits = 3) {
    const u = ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0;
    while (Math.abs(b) >= 1000 && i < u.length - 1) { b /= 1000; i++; }
    return Number(b.toPrecision(digits)) + " " + u[i];
  };
  /** 시간(초) → 사람이 읽는 단위 */
  CB.time = function (s) {
    const steps = [[3.156e7 * 100, "세기"], [3.156e7, "년"], [2.63e6, "개월"], [86400, "일"], [3600, "시간"], [60, "분"], [1, "초"], [1e-3, "ms"], [1e-6, "µs"], [1e-9, "ns"], [1e-12, "ps"]];
    for (const [v, n] of steps) if (Math.abs(s) >= v * 0.9995) return Number((s / v).toPrecision(3)) + " " + n;
    return s.toExponential(2) + " 초";
  };
  /** 큰 수를 한국어 단위로: CB.kn(1040000) → "104만" */
  CB.kn = function (n) {
    const a = Math.abs(n);
    if (a >= 1e12) return Number((n / 1e12).toPrecision(3)) + "조";
    if (a >= 1e8) return Number((n / 1e8).toPrecision(3)) + "억";
    if (a >= 1e4) return Number((n / 1e4).toPrecision(3)) + "만";
    return String(Math.round(n));
  };
  CB.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  /** 결정적 난수(시드) */
  CB.rng = function (seed = 1) { let x = seed >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };

  /* ------------------------------------------------------------ canvas drawing utils */
  /** 둥근 사각형 경로 */
  CB.rrect = function (ctx, x, y, w, h, r = 6) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  };
  /** 상자 + 가운데 글자 */
  CB.box = function (ctx, x, y, w, h, o = {}) {
    const P = CB.palette();
    CB.rrect(ctx, x, y, w, h, o.r == null ? 8 : o.r);
    ctx.fillStyle = o.fill || P.surface; ctx.fill();
    if (o.stroke !== false) { ctx.strokeStyle = o.stroke || P.border; ctx.lineWidth = o.lw || 1; ctx.stroke(); }
    if (o.text != null) {
      ctx.fillStyle = o.color || P.text;
      ctx.font = (o.bold ? "700 " : "") + (o.size || 13) + "px " + (o.mono ? CB.color("mono") || "monospace" : CB.font());
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const lines = String(o.text).split("\n");
      const lh = (o.size || 13) * 1.3;
      lines.forEach((ln, i) => ctx.fillText(ln, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * lh));
    }
  };
  /** 화살표 */
  CB.arrow = function (ctx, x1, y1, x2, y2, o = {}) {
    const P = CB.palette();
    ctx.strokeStyle = ctx.fillStyle = o.color || P.dim; ctx.lineWidth = o.lw || 1.6;
    ctx.setLineDash(o.dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    const a = Math.atan2(y2 - y1, x2 - x1), s = o.head || 8;
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); ctx.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  };
  /** 텍스트 */
  CB.text = function (ctx, str, x, y, o = {}) {
    ctx.fillStyle = o.color || CB.color("text");
    ctx.font = (o.bold ? "700 " : o.weight ? o.weight + " " : "") + (o.size || 13) + "px " + (o.mono ? CB.color("mono") || "monospace" : CB.font());
    ctx.textAlign = o.align || "left"; ctx.textBaseline = o.base || "middle";
    ctx.fillText(str, x, y);
  };
  CB.font = () => getComputedStyle(document.documentElement).getPropertyValue("--font") || "sans-serif";

  /* ------------------------------------------------------------ theme */
  const themeCbs = [];
  CB.onTheme = (cb) => themeCbs.push(cb);
  CB.isDark = function () {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  /** CSS 변수 값 읽기: CB.color('accent') */
  CB.color = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
  };
  /** 자주 쓰는 색 묶음 (테마 변경 시 다시 호출할 것) */
  CB.palette = function () {
    const c = CB.color;
    return {
      bg: c("canvas-bg"), text: c("text"), dim: c("text-dim"), faint: c("text-faint"),
      grid: c("grid"), axis: c("axis"), border: c("border"), surface: c("surface"),
      accent: c("accent"), accent2: c("accent-2"), ok: c("ok"), warn: c("warn"), bad: c("bad"),
      red: c("red"), green: c("green"), blue: c("blue"),
      // 데이터 시리즈용 기본 순서
      series: [c("accent"), c("accent-2"), c("warn"), c("ok"), c("bad"), c("text-dim")],
    };
  };
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  }
  try { const saved = localStorage.getItem("cb-theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
    });
  }

  /* ------------------------------------------------------------ canvas helper */
  /**
   * HiDPI 캔버스. 폭은 부모 폭을 따르고 높이는 aspect(높이/폭) 또는 height(px)로 결정.
   * draw(ctx, w, h)는 리사이즈·테마 변경 시 자동 호출된다. 애니메이션이면 직접 redraw() 호출.
   *   const cv = CB.canvas(el, (ctx,w,h)=>{...}, {aspect:0.5, maxHeight: 420});
   *   cv.redraw(); cv.ctx; cv.w; cv.h
   */
  CB.canvas = function (canvas, draw, opts = {}) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    const ctx = canvas.getContext("2d");
    const st = { ctx, w: 0, h: 0, canvas, dpr: 1 };
    function resize() {
      const parent = canvas.parentElement;
      const w = Math.max(200, Math.floor(opts.width || parent.clientWidth || 600));
      let h = opts.height || Math.round(w * (opts.aspect || 0.5));
      if (opts.minHeight) h = Math.max(h, opts.minHeight);
      if (opts.maxHeight) h = Math.min(h, opts.maxHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h; st.dpr = dpr;
      st.redraw();
    }
    st.redraw = function () {
      if (!st.w) return;
      ctx.save();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      if (!opts.noClear) {
        ctx.clearRect(0, 0, st.w, st.h);
        ctx.fillStyle = CB.color("canvas-bg");
        ctx.fillRect(0, 0, st.w, st.h);
      }
      try { draw && draw(ctx, st.w, st.h); } finally { ctx.restore(); }
    };
    st.resize = resize;
    if (window.ResizeObserver) {
      let lastW = -1;
      new ResizeObserver(() => { const w = canvas.parentElement.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(canvas.parentElement);
    } else window.addEventListener("resize", resize);
    CB.onTheme(() => st.redraw());
    resize();
    return st;
  };

  /**
   * 화면에 보일 때만 도는 애니메이션 루프. fn(dt초, t초)
   *   const loop = CB.loop(el, (dt,t)=>{...}); loop.stop(); loop.start();
   */
  CB.loop = function (el, fn) {
    let raf = 0, last = 0, t = 0, visible = true, running = true;
    function frame(ts) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      fn(dt, t);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }
    if (window.IntersectionObserver && el) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(el);
    }
    kick();
    return {
      start() { running = true; kick(); },
      stop() { running = false; },
      get running() { return running; },
      toggle() { running ? (running = false) : ((running = true), kick()); return running; },
    };
  };

  /* ------------------------------------------------------------ chart helper */
  /**
   * 간단한 선 그래프. box = {x,y,w,h}(생략 시 캔버스 전체에 여백 자동)
   * opts: { x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xTicks, yTicks,
   *         xFmt, yFmt, series:[{data:[[x,y],...], color, width, dash, fill, label}],
   *         vlines:[{x,color,label,dash}], hlines:[{y,color,label,dash}], points:[{x,y,color,r,label}],
   *         bands:[{x0,x1,color}] }
   * 반환: { X(v)->px, Y(v)->px, box }
   */
  CB.chart = function (ctx, box, opts) {
    const P = CB.palette();
    const dpr = (ctx.getTransform && ctx.getTransform().a) || 1;
    const W = ctx.canvas.width / dpr, H = ctx.canvas.height / dpr;
    if (!box) box = { x: 58, y: 16, w: W - 58 - 18, h: H - 16 - 46 };
    const [x0, x1] = opts.x, [y0, y1] = opts.y;
    const lx = (v) => (opts.logX ? Math.log10(v) : v);
    const ly = (v) => (opts.logY ? Math.log10(v) : v);
    const X = (v) => box.x + ((lx(v) - lx(x0)) / (lx(x1) - lx(x0))) * box.w;
    const Y = (v) => box.y + box.h - ((ly(v) - ly(y0)) / (ly(y1) - ly(y0))) * box.h;
    const ticks = (a, b, log, n) => {
      if (log) { const out = []; for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.log10(b) + 1e-9; e++) out.push(Math.pow(10, e)); return out; }
      const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= (n || 5) + 0.5) || raw;
      const out = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    };
    const defFmt = (v) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(0).replace("e+", "e") : String(Number(v.toPrecision(4))));
    const xFmt = opts.xFmt || defFmt, yFmt = opts.yFmt || defFmt;
    ctx.save();
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.lineWidth = 1;
    // bands
    (opts.bands || []).forEach((b) => { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), box.y, X(b.x1) - X(b.x0), box.h); });
    // grid + ticks
    const xt = opts.xTicks || ticks(x0, x1, opts.logX, 6);
    const yt = opts.yTicks || ticks(y0, y1, opts.logY, 5);
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.dim;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach((v) => { const px = X(v); if (px < box.x - 1 || px > box.x + box.w + 1) return; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); ctx.fillText(xFmt(v), px, box.y + box.h + 6); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    yt.forEach((v) => { const py = Y(v); if (py < box.y - 1 || py > box.y + box.h + 1) return; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); ctx.fillText(yFmt(v), box.x - 6, py); });
    ctx.strokeStyle = P.axis;
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    // labels
    ctx.fillStyle = P.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (opts.xLabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(opts.xLabel, box.x + box.w / 2, box.y + box.h + 40); }
    if (opts.yLabel) { ctx.save(); ctx.translate(14, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }
    // clip plot area
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w + 2, box.h + 4); ctx.clip();
    (opts.series || []).forEach((s, i) => {
      if (!s.data || !s.data.length) return;
      ctx.strokeStyle = s.color || P.series[i % P.series.length];
      ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach(([x, y]) => { if (!isFinite(y) || (opts.logY && y <= 0) || (opts.logX && x <= 0)) { started = false; return; } const px = X(x), py = Y(y); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.lineTo(X(s.data[0][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill();
      }
      ctx.setLineDash([]);
    });
    (opts.vlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(X(l.x), box.y); ctx.lineTo(X(l.x), box.y + box.h); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(l.label, X(l.x) + 4, box.y + 4); } });
    (opts.hlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(box.x, Y(l.y)); ctx.lineTo(box.x + box.w, Y(l.y)); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(l.label, box.x + box.w - 4, Y(l.y) - 3); } });
    (opts.points || []).forEach((p) => { ctx.fillStyle = p.color || P.accent; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); ctx.fill(); if (p.label) { ctx.fillStyle = P.text; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 4); } });
    ctx.restore();
    ctx.restore();
    return { X, Y, box };
  };

  /* ------------------------------------------------------------ controls */
  /**
   * range 입력 바인딩. output은 id+"-out" 요소 또는 <output for=id>.
   *   const get = CB.range('wl', v => v+' nm', v => redraw());  get() → 현재 값(Number)
   */
  CB.range = function (id, fmt, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const out = document.getElementById(el.id + "-out") || document.querySelector(`output[for="${el.id}"]`);
    const update = (fire) => {
      const v = Number(el.value);
      const pct = ((v - Number(el.min || 0)) / (Number(el.max || 100) - Number(el.min || 0))) * 100;
      el.style.setProperty("--fill", pct + "%");
      if (out) out.textContent = fmt ? fmt(v) : String(v);
      if (fire && onInput) onInput(v);
    };
    el.addEventListener("input", () => update(true));
    update(false);
    const get = () => Number(el.value);
    get.set = (v) => { el.value = v; update(true); };
    get.el = el;
    return get;
  };
  /**
   * 세그먼트 버튼: <div class="seg" id="mode"><button data-value="a" class="on">A</button>...</div>
   *   const mode = CB.seg('mode', v => redraw());  mode() → 현재 값
   */
  CB.seg = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const btns = [...el.querySelectorAll("button")];
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.value;
    const set = (v, fire = true) => {
      cur = v;
      btns.forEach((b) => { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      if (fire && onChange) onChange(v);
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    set(cur, false);
    const get = () => cur;
    get.set = set;
    return get;
  };
  /** 통계 표시: CB.stat('snr', '32.1 dB') → id 요소의 textContent 설정(HTML 허용) */
  CB.stat = function (id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; };


  /* ------------------------------------------------------------ 학습 진도 (브라우저에만 저장) */
  const PKEY = "cb-progress-v1";
  CB.progress = {
    load() { try { return JSON.parse(localStorage.getItem(PKEY)) || { ch: {} }; } catch (e) { return { ch: {} }; } },
    save(d) { try { localStorage.setItem(PKEY, JSON.stringify(d)); } catch (e) {} },
    get(slug) { return this.load().ch[slug] || null; },
    update(slug, fn) { const d = this.load(); d.ch = d.ch || {}; const c = (d.ch[slug] = d.ch[slug] || { pct: 0 }); fn(c, d); this.save(d); return c; },
    last() { return this.load().last || null; },
    reset() { try { localStorage.removeItem(PKEY); } catch (e) {} },
    doneCount() { const ch = this.load().ch || {}; return CHAPTERS.filter((c) => ch[c.slug] && ch[c.slug].done).length; },
  };
  /* ------------------------------------------------------------ layout build */
  const LOGO = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#cbg)"/><g stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"><path d="M12 6v3M16 6v3M20 6v3M12 23v3M16 23v3M20 23v3M6 12h3M6 16h3M6 20h3M23 12h3M23 16h3M23 20h3"/></g><rect x="10" y="10" width="12" height="12" rx="2.5" fill="#fff"/><text x="16" y="19.2" text-anchor="middle" font-family="monospace" font-size="7.5" font-weight="700" fill="var(--accent)">01</text></svg>`;
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

  function build() {
    const body = document.body;
    const root = body.dataset.root != null ? body.dataset.root : body.dataset.chapter ? "../" : "";
    const curSlug = body.dataset.chapter || "";
    const href = (slug) => (slug ? `${root}chapters/${slug}.html` : `${root}index.html`);

    // top bar
    const bar = document.createElement("header");
    bar.className = "sb-topbar";
    bar.innerHTML = `
      <button class="sb-btn icon" id="sb-menu" aria-label="챕터 목록">${ICON_MENU}</button>
      <a class="sb-logo" href="${href("")}">${LOGO}<span>ComputerBook <small>컴퓨터 교과서</small></span></a>
      <span class="spacer"></span>
      <button class="sb-btn icon" id="sb-theme" aria-label="테마 전환"></button>
      <div class="sb-progress" id="sb-progress"></div>`;
    body.prepend(bar);

    // drawer
    const drawer = document.createElement("nav");
    drawer.className = "sb-drawer";
    let lastPart = "";
    drawer.innerHTML = `<h4>Chapters</h4><ul class="sb-chlist">
      <li><a href="${href("")}" class="${curSlug ? "" : "active"}"><span class="num">00</span><span>홈 · 로드맵</span></a></li>
      ${CHAPTERS.map((c) => { const head = c.part !== lastPart ? `<li class="part">${c.part}</li>` : ""; lastPart = c.part; return head + `<li><a href="${href(c.slug)}" data-slug="${c.slug}" class="${c.slug === curSlug ? "active" : ""}"><span class="num">${c.num}</span><span class="t">${c.title}</span><i class="sb-st"></i></a></li>`; }).join("")}
    </ul>`;
    const backdrop = document.createElement("div");
    backdrop.className = "sb-drawer-backdrop";
    body.append(backdrop, drawer);
    const toggleDrawer = (o) => body.classList.toggle("drawer-open", o);
    bar.querySelector("#sb-menu").addEventListener("click", () => toggleDrawer(true));
    backdrop.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleDrawer(false); });

    // theme toggle
    const tbtn = bar.querySelector("#sb-theme");
    const setIcon = () => (tbtn.innerHTML = CB.isDark() ? ICON_SUN : ICON_MOON);
    setIcon();
    tbtn.addEventListener("click", () => {
      const next = CB.isDark() ? "light" : "dark";
      try { localStorage.setItem("cb-theme", next); } catch (e) {}
      applyTheme(next); setIcon();
    });

    // progress
    const prog = bar.querySelector("#sb-progress");
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // chapter page extras
    const main = document.querySelector("main.chapter");
    if (main) {
      // numbered h2 + TOC
      const layout = document.createElement("div");
      layout.className = "sb-layout";
      main.parentNode.insertBefore(layout, main);
      layout.appendChild(main);
      const toc = document.createElement("aside");
      toc.className = "sb-toc";
      const h2s = [...main.querySelectorAll("section > h2")];
      let n = 0;
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + h2s.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = "s" + (i + 1);
        const numbered = !sec.classList.contains("keypoints") && !sec.classList.contains("quiz-sec") && !sec.hasAttribute("data-nonum");
        if (numbered && !h.querySelector(".h-num")) { n++; h.insertAdjacentHTML("afterbegin", `<span class="h-num">${String(n).padStart(2, "0")}</span>`); }
        return `<a href="#${sec.id}">${h.textContent.replace(/^\d\d/, "").trim()}</a>`;
      }).join("");
      layout.appendChild(toc);
      const links = [...toc.querySelectorAll("a")];
      if (window.IntersectionObserver && h2s.length) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
        }, { rootMargin: "-20% 0px -70% 0px" });
        h2s.forEach((h) => io.observe(h.parentElement));
      }

      // pager
      const idx = CHAPTERS.findIndex((c) => c.slug === curSlug);
      const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
      const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
      const pager = document.createElement("nav");
      pager.className = "sb-pager";
      pager.innerHTML =
        (prev ? `<a class="prev" href="${href(prev.slug)}"><small>← 이전 · ${prev.num}</small>${prev.title}</a>` : `<a class="prev" href="${href("")}"><small>← 처음으로</small>홈 · 로드맵</a>`) +
        (next ? `<a class="next" href="${href(next.slug)}"><small>다음 · ${next.num} →</small>${next.title}</a>` : "");
      layout.after(pager);
    }
    const foot = document.createElement("footer");
    foot.className = "sb-foot";
    foot.innerHTML = `ComputerBook — 누구나 읽는 인터랙티브 컴퓨터 교과서 · 시뮬레이터는 이해를 돕기 위해 단순화한 모델입니다.
      <br>© 2026 <a href="https://github.com/geniuskey">geniuskey</a> ·
      콘텐츠 <a href="https://creativecommons.org/licenses/by/4.0/deed.ko" rel="license">CC BY 4.0</a> ·
      코드 <a href="https://github.com/geniuskey/computerbook/blob/main/LICENSE-MIT">MIT</a> ·
      <a href="https://github.com/geniuskey/computerbook/blob/main/LICENSE.md">라이선스 안내</a>`;
    body.appendChild(foot);

    // quiz
    document.querySelectorAll(".quiz-q").forEach((q) => {
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((b) => b.addEventListener("click", () => {
        opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        q.classList.add("done");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { correct: b.hasAttribute("data-correct") } }));
      }));
    });


    // 학습 진도: 읽은 비율, 마지막 섹션, 퀴즈 답
    const paintDrawer = () => {
      const ch = CB.progress.load().ch || {};
      drawer.querySelectorAll("a[data-slug]").forEach((a) => {
        const c = ch[a.dataset.slug], st = a.querySelector(".sb-st");
        st.className = "sb-st" + (c && c.done ? " done" : c && c.pct > 2 ? " part" : "");
        st.style.setProperty("--p", (c ? Math.round(c.pct) : 0) + "%");
        st.title = c && c.done ? "다 읽음" : c && c.pct > 2 ? `${Math.round(c.pct)}% 읽음` : "";
      });
    };
    paintDrawer();
    if (main && curSlug) {
      const secs = [...main.querySelectorAll("section[id]")];
      const quizQs = [...main.querySelectorAll(".quiz-q")];
      const saved = CB.progress.get(curSlug);
      // 지난 퀴즈 답 복원
      if (saved && saved.ans) {
        quizQs.forEach((q, qi) => {
          const pick = saved.ans[qi]; if (pick == null) return;
          const opts = [...q.querySelectorAll("button.opt")]; const b = opts[pick]; if (!b) return;
          opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
          if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
          q.classList.add("done");
        });
        const qs = main.querySelector(".quiz-sec .quiz");
        if (qs && Object.keys(saved.ans).length) {
          const bar = document.createElement("div"); bar.className = "quiz-restore";
          bar.innerHTML = `<span>지난번에 푼 답을 불러왔습니다.</span><button class="btn" type="button">다시 풀기</button>`;
          bar.querySelector("button").onclick = () => {
            CB.progress.update(curSlug, (c) => { c.ans = {}; });
            quizQs.forEach((q) => { q.classList.remove("done"); q.querySelectorAll("button.opt").forEach((o) => { o.disabled = false; o.classList.remove("right", "wrong"); }); });
            bar.remove();
          };
          qs.before(bar);
        }
      }
      quizQs.forEach((q, qi) => {
        const opts = [...q.querySelectorAll("button.opt")];
        opts.forEach((b, bi) => b.addEventListener("click", () => CB.progress.update(curSlug, (c) => { c.ans = c.ans || {}; c.ans[qi] = bi; })));
      });
      // 읽은 위치 기록
      let tmr = 0;
      const record = () => {
        tmr = 0;
        const h = document.documentElement.scrollHeight - innerHeight;
        const pct = h > 0 ? Math.min(100, (scrollY / h) * 100) : 100;
        let sec = null; for (const s of secs) { if (s.getBoundingClientRect().top < innerHeight * 0.35) sec = s.id; }
        CB.progress.update(curSlug, (c, d) => {
          c.pct = Math.max(c.pct || 0, pct); c.t = Date.now();
          if (sec) c.sec = sec;
          if (c.pct >= 92) c.done = true;
          d.last = { slug: curSlug, sec: c.sec || null, t: c.t };
        });
        paintDrawer();
      };
      addEventListener("scroll", () => { if (!tmr) tmr = setTimeout(record, 600); }, { passive: true });
      setTimeout(record, 1500);
      // 이어 읽기 안내
      if (saved && saved.sec && !location.hash && !saved.done && secs.length && saved.sec !== secs[0].id) {
        const target = document.getElementById(saved.sec);
        if (target) {
          const h = target.querySelector("h2");
          const toast = document.createElement("div"); toast.className = "sb-resume";
          toast.innerHTML = `<span>지난번에 <b>${(h ? h.textContent.replace(/^\d\d/, "") : "").trim()}</b>까지 읽었어요.</span><button class="btn primary" type="button">이어 읽기</button><button class="x" type="button" aria-label="닫기">×</button>`;
          const close = () => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); };
          toast.querySelector(".primary").onclick = () => { target.scrollIntoView({ behavior: "smooth" }); close(); };
          toast.querySelector(".x").onclick = close;
          body.appendChild(toast); requestAnimationFrame(() => toast.classList.add("show"));
          setTimeout(close, 12000);
        }
      }
    }

    // 용어 툴팁: 본문의 .term에 용어집 설명을 붙인다
    if (main && curSlug !== "glossary" && main.querySelector(".term")) {
      const bind = () => {
        const T = window.CB_TERMS, AL = window.CB_TERM_ALIAS || {};
        if (!T) return;
        const norm = (x) => x.replace(/\s+/g, "").toLowerCase();
        const idx = new Map();
        const put = (k, t) => { k = norm(k); if (!k) return; const l = idx.get(k) || []; if (!l.includes(t)) l.push(t); idx.set(k, l); };
        T.forEach((t) => { [t[0], t[0].replace(/\(.*?\)/g, ""), t[1], t[1].replace(/\(.*?\)/g, "")].forEach((k) => put(k, t)); t[0].split(/[\/·]/).forEach((k) => put(k, t)); });
        const find = (txt) => { const a = AL[txt.trim()]; const l = idx.get(norm(a || txt)); if (!l) return null; return l.find((t) => t[3] === curSlug) || l[0]; };
        const tip = document.createElement("div"); tip.className = "sb-tip"; tip.id = "sb-tip"; tip.setAttribute("role", "tooltip"); body.appendChild(tip);
        let cur = null, hideT = 0;
        const esc = (x) => x.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
        const show = (el, t) => {
          clearTimeout(hideT); cur = el;
          const c = CHAPTERS.find((x) => x.slug === t[3]);
          tip.innerHTML = `<div class="tt-h"><b>${esc(t[0])}</b><span>${esc(t[1])}</span></div><p>${esc(t[2])}</p><div class="tt-l">` +
            (c && c.slug !== curSlug ? `<a href="${href(c.slug)}">${c.num}장 ${esc(c.title)}에서 자세히 →</a>` : "") +
            `<a href="${href("glossary")}?q=${encodeURIComponent(t[0].replace(/\(.*?\)/g, ""))}">용어집</a></div>`;
          tip.classList.add("show"); el.setAttribute("aria-describedby", "sb-tip");
          const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
          let x = Math.max(12, Math.min(innerWidth - tw - 12, r.left + r.width / 2 - tw / 2));
          let y = r.top - th - 10; if (y < 70) y = r.bottom + 10;
          tip.style.left = x + "px"; tip.style.top = y + "px";
        };
        const hide = (now) => { clearTimeout(hideT); hideT = setTimeout(() => { tip.classList.remove("show"); if (cur) cur.removeAttribute("aria-describedby"); cur = null; }, now ? 0 : 220); };
        tip.addEventListener("mouseenter", () => clearTimeout(hideT));
        tip.addEventListener("mouseleave", () => hide());
        main.querySelectorAll(".term").forEach((el) => {
          const t = find(el.textContent); if (!t) return;
          el.classList.add("has-tip"); el.tabIndex = 0;
          el.addEventListener("mouseenter", () => show(el, t));
          el.addEventListener("mouseleave", () => hide());
          el.addEventListener("focus", () => show(el, t));
          el.addEventListener("blur", () => hide());
          el.addEventListener("click", (e) => { e.stopPropagation(); cur === el && tip.classList.contains("show") ? hide(true) : show(el, t); });
        });
        document.addEventListener("click", (e) => { if (!tip.contains(e.target)) hide(true); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(true); });
        addEventListener("scroll", () => { if (cur) hide(true); }, { passive: true });
      };
      if (window.CB_TERMS) bind();
      else { const sc = document.createElement("script"); sc.src = root + "js/terms.js"; sc.onload = bind; document.head.appendChild(sc); }
    }

    // KaTeX
    const renderMath = () => {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
          throwOnError: false,
          ignoredClasses: ["no-math"],
        });
      }
    };
    if (window.renderMathInElement) renderMath();
    else window.addEventListener("load", renderMath);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
