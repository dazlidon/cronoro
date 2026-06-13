/* ===== CronoRO iOS — logica aplicației (swipe, temă light/dark, bilingv RO/EN) ===== */
(function () {
  "use strict";

  /* ---------- Dicționar de interfață / UI dictionary ---------- */
  const I18N = {
    ro: {
      tabToday: "Azi",
      tabCompare: "Atunci vs. Acum",
      tabQuiz: "Quiz",
      btnToday: "Azi",
      btnEras: "Epoci",
      sheetTitle: "Filtrează după epocă",
      allEras: "Toate epocile",
      swipeHint: "← glisează pentru altă zi →",
      subToday: (day) => `astăzi, ${day}`,
      subOther: "de-a lungul istoriei",
      tomorrowNote: "Pentru această zi nu avem încă un eveniment — dar mâine în istorie:",
      archiveNote: "Pentru această zi nu avem încă un eveniment în arhivă. Între timp, descoperă altceva din istorie:",
      archiveAlso: "Și ceva din arhivă:",
      emptyState: "Nimic în arhivă pentru filtrul ales. Încearcă altă epocă sau dă click pe 🎲.",
      whyLabel: "De ce contează:",
      compareTitle: 'Atunci <span class="vs">vs.</span> Acum',
      compareIntro: "Comunism (1947–1989) față în față cu România membră UE (2007–azi). Date documentate, nu nostalgie.",
      compareFootnote: "Cifrele sunt rotunjite pentru lizibilitate — fiecare card are linkul către sursa oficială.",
      thenLabel: "Comunism",
      nowLabel: "România în UE",
      srcLabel: "Sursă",
      quizTitle: "Cât de bine știi istoria? 🧠",
      quizIntro: "Întrebările sunt generate doar din evenimente documentate, din baza de date a aplicației.",
      quizProgress: (i, n, s) => `Întrebarea ${i} din ${n} · Scor: ${s}`,
      quizQuestion: (t) => `În ce an: „${t}”?`,
      quizCorrect: "✅ Corect!",
      quizWrong: (y) => `❌ Era ${y}.`,
      quizNext: "Următoarea →",
      quizSeeScore: "Vezi scorul",
      quizYourScore: "Scorul tău:",
      quizPerfect: "Perfect! Istoria nu are secrete pentru tine. 🏆",
      quizGood: "Solid! Mai dă o tură să prinzi tot. 💪",
      quizTryAgain: "Cel mai bun mod de a învăța: mai încearcă o dată. 📚",
      quizRestart: "Joacă din nou",
      months: ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],
      days: ["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],
      scopeRo: "România", scopeEu: "Europa"
    },
    en: {
      tabToday: "Today",
      tabCompare: "Then vs. Now",
      tabQuiz: "Quiz",
      btnToday: "Today",
      btnEras: "Eras",
      sheetTitle: "Filter by era",
      allEras: "All eras",
      swipeHint: "← swipe for another day →",
      subToday: (day) => `today, ${day}`,
      subOther: "throughout history",
      tomorrowNote: "We don't have an event for this day yet — but tomorrow in history:",
      archiveNote: "We don't have an event for this exact day yet. Meanwhile, discover something else from history:",
      archiveAlso: "And something from the archive:",
      emptyState: "Nothing in the archive for this filter. Try another era or hit 🎲.",
      whyLabel: "Why it matters:",
      compareTitle: 'Then <span class="vs">vs.</span> Now',
      compareIntro: "Communism (1947–1989) face to face with EU-member Romania (2007–today). Documented facts, not nostalgia.",
      compareFootnote: "Figures are rounded for readability — every card links to its official source.",
      thenLabel: "Communism",
      nowLabel: "Romania in the EU",
      srcLabel: "Source",
      quizTitle: "How well do you know history? 🧠",
      quizIntro: "Questions are generated only from documented events in the app's database.",
      quizProgress: (i, n, s) => `Question ${i} of ${n} · Score: ${s}`,
      quizQuestion: (t) => `In what year: “${t}”?`,
      quizCorrect: "✅ Correct!",
      quizWrong: (y) => `❌ It was ${y}.`,
      quizNext: "Next →",
      quizSeeScore: "See your score",
      quizYourScore: "Your score:",
      quizPerfect: "Perfect! History holds no secrets for you. 🏆",
      quizGood: "Solid! One more round to catch them all. 💪",
      quizTryAgain: "The best way to learn: try again. 📚",
      quizRestart: "Play again",
      months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
      days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      scopeRo: "Romania", scopeEu: "Europe"
    }
  };

  /* ---------- Stare / State ---------- */
  let lang = localStorage.getItem("cronoro-lang") || "ro";
  let current = new Date();
  let activeEra = "all";

  const $ = (sel) => document.querySelector(sel);
  const t = () => I18N[lang];
  const txt = (field) => (typeof field === "string" ? field : field[lang]);

  /* ---------- Tema light/dark ---------- */
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function appliedTheme() {
    const saved = localStorage.getItem("cronoro-theme");
    return saved || (prefersDark.matches ? "dark" : "light");
  }

  function applyTheme() {
    const theme = appliedTheme();
    document.documentElement.dataset.theme = theme;
    $("#theme-toggle").textContent = theme === "dark" ? "☀️" : "🌙";
    // Sincronizează status bar-ul nativ (doar în Capacitor)
    const StatusBar = window.Capacitor?.Plugins?.StatusBar;
    if (StatusBar) {
      StatusBar.setStyle({ style: theme === "dark" ? "DARK" : "LIGHT" }).catch(() => {});
    }
  }

  $("#theme-toggle").addEventListener("click", () => {
    const next = appliedTheme() === "dark" ? "light" : "dark";
    localStorage.setItem("cronoro-theme", next);
    applyTheme();
  });
  prefersDark.addEventListener("change", () => {
    if (!localStorage.getItem("cronoro-theme")) applyTheme();
  });

  /* ---------- Comutare limbă / Language toggle ---------- */
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = t()[el.dataset.i18n];
      if (typeof val === "string") el.textContent = val;
    });
    $("#compare-title").innerHTML = t().compareTitle;
    $("#lang-toggle").textContent = lang === "ro" ? "EN" : "RO";
  }

  $("#lang-toggle").addEventListener("click", () => {
    lang = lang === "ro" ? "en" : "ro";
    localStorage.setItem("cronoro-lang", lang);
    applyStaticI18n();
    renderEraFilters();
    renderDay();
    renderCompare();
    if (quizStarted) startQuiz();
  });

  /* ---------- Tab-uri (bara de jos) ---------- */
  document.querySelectorAll(".tabbar-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tabbar-btn").forEach((tb) => {
        tb.classList.toggle("active", tb === tab);
        tb.setAttribute("aria-selected", tb === tab ? "true" : "false");
      });
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      $("#view-" + tab.dataset.view).classList.add("active");
      if (tab.dataset.view === "quiz" && !quizStarted) startQuiz();
      window.scrollTo({ top: 0 });
    });
  });

  /* ---------- Utilitare evenimente ---------- */
  function eventsOn(month, day) {
    return EVENTS
      .filter((e) => e.m === month && e.d === day)
      .sort((a, b) => a.y - b.y);
  }

  function eventsTomorrow(month, day) {
    const ref = new Date(2024, month - 1, day);
    ref.setDate(ref.getDate() + 1);
    return eventsOn(ref.getMonth() + 1, ref.getDate());
  }

  // Selecție deterministă „din arhivă” — aceeași zi arată mereu aceleași evenimente
  function archivePicks(month, day, count, exclude) {
    const excluded = new Set(exclude.map((e) => EVENTS.indexOf(e)));
    const seed = month * 31 + day;
    const picks = [];
    for (let i = 0; picks.length < count && i < EVENTS.length; i++) {
      const idx = (seed * 7 + 13 + i * 37) % EVENTS.length;
      if (!excluded.has(idx) && !picks.includes(EVENTS[idx])) picks.push(EVENTS[idx]);
    }
    return picks;
  }

  function applyEraFilter(list) {
    return activeEra === "all" ? list : list.filter((e) => e.era === activeEra);
  }

  /* ---------- Randare carduri ---------- */
  function eventCard(e, showDate) {
    const era = ERAS[e.era];
    const card = document.createElement("article");
    card.className = "event-card";
    card.style.setProperty("--era-color", era.color);

    const dateNote = showDate
      ? `<span class="muted" style="font-size:.74rem">🗓 ${lang === "ro" ? `${e.d} ${t().months[e.m - 1]}` : `${t().months[e.m - 1]} ${e.d}`}</span>`
      : "";

    card.innerHTML = `
      <div class="event-meta">
        <span class="year-badge">${e.y}</span>
        <span class="scope-badge" title="${e.scope === "ro" ? t().scopeRo : t().scopeEu}">${e.scope === "ro" ? "🇷🇴" : "🇪🇺"}</span>
        <span class="era-badge">${txt(era.label)}</span>
        ${dateNote}
      </div>
      <h2>${txt(e.title)}</h2>
      <p class="event-text">${txt(e.text)}</p>
      ${e.why ? `<div class="event-why">💡 <strong>${t().whyLabel}</strong> ${txt(e.why)}</div>` : ""}
      <div class="event-sources">
        ${e.sources.map((s) => `<a href="${s.u}" target="_blank" rel="noopener noreferrer">${s.n}</a>`).join("")}
      </div>`;
    return card;
  }

  function renderDay() {
    const m = current.getMonth() + 1;
    const d = current.getDate();

    $("#date-title").textContent = lang === "ro"
      ? `${d} ${t().months[m - 1]}`
      : `${t().months[m - 1]} ${d}`;

    const today = new Date();
    const isToday = today.getDate() === d && today.getMonth() + 1 === m;
    $("#date-sub").textContent = isToday
      ? t().subToday(t().days[today.getDay()])
      : t().subOther;

    const timeline = $("#timeline");
    timeline.innerHTML = "";

    const exact = applyEraFilter(eventsOn(m, d));
    exact.forEach((e) => timeline.appendChild(eventCard(e)));

    if (exact.length === 0) {
      const tomorrow = applyEraFilter(eventsTomorrow(m, d));
      const archive = applyEraFilter(archivePicks(m, d, 2, tomorrow));

      if (tomorrow.length === 0 && archive.length === 0) {
        timeline.innerHTML = `<div class="empty-state">
          <p style="font-size:2rem">🗂️</p>
          <p>${t().emptyState}</p>
        </div>`;
        return;
      }

      if (tomorrow.length > 0) {
        const note = document.createElement("p");
        note.className = "nearby-note";
        note.textContent = t().tomorrowNote;
        timeline.appendChild(note);
        tomorrow.forEach((e) => timeline.appendChild(eventCard(e, true)));
      }

      if (archive.length > 0) {
        const note = document.createElement("p");
        note.className = "nearby-note";
        note.textContent = tomorrow.length > 0 ? t().archiveAlso : t().archiveNote;
        timeline.appendChild(note);
        archive.forEach((e) => timeline.appendChild(eventCard(e, true)));
      }
    }
  }

  /* ---------- Navigare pe zile, cu animație de glisare ---------- */
  let animating = false;

  function shiftDay(delta, animate) {
    if (animating) return;
    current.setDate(current.getDate() + delta);

    if (!animate) { renderDay(); return; }

    animating = true;
    const timeline = $("#timeline");
    timeline.classList.add(delta > 0 ? "exit-left" : "exit-right");

    setTimeout(() => {
      renderDay();
      window.scrollTo({ top: 0 });
      timeline.classList.remove("exit-left", "exit-right");
      timeline.classList.add(delta > 0 ? "enter-left" : "enter-right");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        timeline.classList.remove("enter-left", "enter-right");
        animating = false;
      }));
    }, 180);

    // Feedback haptic discret (doar în Capacitor)
    const Haptics = window.Capacitor?.Plugins?.Haptics;
    if (Haptics) Haptics.impact({ style: "LIGHT" }).catch(() => {});
  }

  $("#prev-day").addEventListener("click", () => shiftDay(-1, true));
  $("#next-day").addEventListener("click", () => shiftDay(1, true));
  $("#go-today").addEventListener("click", () => { current = new Date(); renderDay(); });

  $("#go-random").addEventListener("click", () => {
    const e = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    current = new Date(2024, e.m - 1, e.d);
    renderDay();
  });

  $("#date-pick").addEventListener("change", (ev) => {
    if (!ev.target.value) return;
    const [y, m, d] = ev.target.value.split("-").map(Number);
    current = new Date(y, m - 1, d);
    renderDay();
  });

  /* ---------- Gestul de swipe stânga/dreapta ---------- */
  (function initSwipe() {
    const zone = $("#swipe-zone");
    let startX = 0, startY = 0, tracking = false;

    zone.addEventListener("touchstart", (ev) => {
      if (ev.touches.length !== 1) return;
      startX = ev.touches[0].clientX;
      startY = ev.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    zone.addEventListener("touchend", (ev) => {
      if (!tracking) return;
      tracking = false;
      const dx = ev.changedTouches[0].clientX - startX;
      const dy = ev.changedTouches[0].clientY - startY;
      // Swipe valid: orizontal dominant și suficient de lung
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.8 * Math.abs(dy)) {
        shiftDay(dx < 0 ? 1 : -1, true); // glisare la stânga → ziua următoare
      }
    }, { passive: true });
  })();

  /* ---------- Bottom sheet: filtre de epocă ---------- */
  const sheet = $("#era-sheet");
  const backdrop = $("#sheet-backdrop");

  function openSheet() { sheet.hidden = false; backdrop.hidden = false; }
  function closeSheet() { sheet.hidden = true; backdrop.hidden = true; }

  $("#open-filter").addEventListener("click", openSheet);
  backdrop.addEventListener("click", closeSheet);

  function renderEraFilters() {
    const wrap = $("#era-filters");
    wrap.innerHTML = "";

    const all = document.createElement("button");
    all.className = "era-chip" + (activeEra === "all" ? " active" : "");
    all.textContent = t().allEras;
    all.dataset.era = "all";
    wrap.appendChild(all);

    Object.entries(ERAS).forEach(([key, era]) => {
      const chip = document.createElement("button");
      chip.className = "era-chip" + (activeEra === key ? " active" : "");
      chip.dataset.era = key;
      chip.style.setProperty("--chip-color", era.color);
      chip.innerHTML = `<span class="dot"></span>${txt(era.label)}`;
      wrap.appendChild(chip);
    });
  }

  $("#era-filters").addEventListener("click", (ev) => {
    const chip = ev.target.closest(".era-chip");
    if (!chip) return;
    activeEra = chip.dataset.era;
    document.querySelectorAll(".era-chip").forEach((c) => c.classList.toggle("active", c === chip));
    // Indicator pe butonul de filtru când e activ un filtru
    const dot = $("#filter-dot");
    if (activeEra === "all") {
      dot.hidden = true;
    } else {
      dot.hidden = false;
      dot.style.setProperty("--chip-color", ERAS[activeEra].color);
    }
    renderDay();
    closeSheet();
  });

  /* ---------- Atunci vs. Acum ---------- */
  function renderCompare() {
    const grid = $("#compare-grid");
    grid.innerHTML = "";
    STATS.forEach((s) => {
      const card = document.createElement("article");
      card.className = "compare-card";
      card.innerHTML = `
        <h3><span>${s.icon}</span>${txt(s.title)}</h3>
        <div class="compare-row">
          <p class="compare-label then">${t().thenLabel}</p>
          <p>${txt(s.then)}</p>
        </div>
        <div class="compare-row">
          <p class="compare-label now">${t().nowLabel}</p>
          <p>${txt(s.now)}</p>
        </div>
        <a class="src-link" href="${s.src.u}" target="_blank" rel="noopener noreferrer">🔗 ${t().srcLabel}: ${s.src.n}</a>`;
      grid.appendChild(card);
    });
  }

  /* ---------- Quiz ---------- */
  const QUIZ_LENGTH = 5;
  let quizStarted = false;
  let quizQuestions = [];
  let quizIndex = 0;
  let quizScore = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function yearOptions(correct) {
    const pool = shuffle([...new Set(EVENTS.map((e) => e.y))]
      .filter((y) => y !== correct && Math.abs(y - correct) <= 80 && Math.abs(y - correct) >= 2));
    const distractors = pool.slice(0, 3);
    while (distractors.length < 3) {
      const candidate = correct + (distractors.length + 1) * (Math.random() < 0.5 ? -7 : 9);
      if (candidate !== correct && !distractors.includes(candidate)) distractors.push(candidate);
    }
    return shuffle([correct, ...distractors]);
  }

  function startQuiz() {
    quizStarted = true;
    quizQuestions = shuffle(EVENTS.filter((e) => e.scope === "ro")).slice(0, QUIZ_LENGTH);
    quizIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const box = $("#quiz-box");
    if (quizIndex >= quizQuestions.length) {
      const msg = quizScore === quizQuestions.length ? t().quizPerfect
        : quizScore >= Math.ceil(quizQuestions.length / 2) ? t().quizGood
        : t().quizTryAgain;
      box.innerHTML = `
        <div class="quiz-score">
          <p>${t().quizYourScore}</p>
          <span class="big">${quizScore} / ${quizQuestions.length}</span>
          <p class="muted">${msg}</p>
          <button class="quiz-restart">${t().quizRestart}</button>
        </div>`;
      box.querySelector(".quiz-restart").addEventListener("click", startQuiz);
      return;
    }

    const q = quizQuestions[quizIndex];
    const options = yearOptions(q.y);

    box.innerHTML = `
      <p class="quiz-progress">${t().quizProgress(quizIndex + 1, quizQuestions.length, quizScore)}</p>
      <p class="quiz-question">${t().quizQuestion(txt(q.title))}</p>
      <div class="quiz-options">
        ${options.map((y) => `<button class="quiz-option" data-year="${y}">${y}</button>`).join("")}
      </div>
      <div class="quiz-feedback"></div>`;

    box.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const picked = Number(btn.dataset.year);
        box.querySelectorAll(".quiz-option").forEach((b) => {
          b.disabled = true;
          if (Number(b.dataset.year) === q.y) b.classList.add("correct");
        });
        if (picked === q.y) {
          quizScore++;
        } else {
          btn.classList.add("wrong");
        }
        const fb = box.querySelector(".quiz-feedback");
        fb.innerHTML = `<strong>${picked === q.y ? t().quizCorrect : t().quizWrong(q.y)}</strong> ${txt(q.text)}
          <button class="quiz-next">${quizIndex + 1 === quizQuestions.length ? t().quizSeeScore : t().quizNext}</button>`;
        fb.querySelector(".quiz-next").addEventListener("click", () => {
          quizIndex++;
          renderQuizQuestion();
        });
      });
    });
  }

  /* ---------- Init ---------- */
  applyTheme();
  applyStaticI18n();
  renderEraFilters();
  renderDay();
  renderCompare();
})();
