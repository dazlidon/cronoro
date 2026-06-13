# CronoRO — Azi în istorie / Today in history 🇷🇴🇪🇺

Aplicație web educațională bilingvă (RO/EN) pentru Gen-Z: deschizi aplicația și vezi **ce s-a întâmplat în această zi** în istoria României și a Europei, din epoca medievală până în era UE. Design în stil Anthropic: hârtie caldă, serif, accente coral.

## Principii editoriale (NU se negociază)

1. **Nimic inventat.** Intră în baza de date doar evenimente documentate, cu dată verificabilă.
2. **Fiecare eveniment are surse** (Wikipedia, europa.eu, IICCMER, Institutul „Elie Wiesel”, Memorialul Sighet, Eurostat, Banca Mondială, Freedom House etc.), afișate pe card. Toate linkurile sunt verificate automat (vezi mai jos).
3. **Comunismul este prezentat prin fapte documentate** — alegerile furate din 1946, Securitatea, Pitești, Canalul, Bărăganul, Decretul 770, colectivizarea, raționalizarea, datoria plătită cu foame, Brașov 1987, Revoluția din 1989 — nu prin opinii.
4. **Istoria se asumă integral**: și paginile glorioase, și cele dureroase (pogromul de la Iași, Odesa 1941, Mineriada). Mișcarea legionară este acoperită ca lanț documentat de crime — asasinarea prefectului Manciu de către Codreanu (1924), înființarea Legiunii (1927), asasinarea premierilor Duca (1933) și Călinescu (1939), măcelărirea lui Stelescu (1936), uciderea fără proces a lui Codreanu (1938), Statul Național-Legionar, masacrul de la Jilava și pogromul din 1941 — fără romantizare și fără eroizarea „martirilor”.
5. **Evoluția în era UE se arată cu cifre** (Eurostat, Banca Mondială, Freedom House), în secțiunea „Atunci vs. Acum” — 15 comparații documentate.
6. **Bilingv integral**: fiecare text există în română și engleză.

## Stadiul acoperirii

- **135 de evenimente**, acoperind **104 zile distincte** ale anului (țintă: 366).
- Zilele fără evenimente NU repetă conținutul zilelor vecine. În schimb:
  - dacă **ziua următoare** are evenimente → teaser „mâine în istorie” (cârlig de revenire);
  - altfel → **2 selecții „din arhivă”**, alese determinist pe baza datei (aceeași zi arată mereu aceleași evenimente; zile consecutive arată evenimente diferite — important pentru partajare și viitoarele notificări zilnice).
- Distribuția curentă pe luni e vizibilă rulând verificarea de integritate (mai jos).

## Structura proiectului

```
index.html              — aplicația WEB (3 tab-uri: Azi / Atunci vs. Acum / Quiz) + comutator RO/EN
css/style.css           — stiluri web (paletă caldă în stil Anthropic, serif + sans, mobile-first)
js/app.js               — logica web + dicționarul de interfață I18N (ro/en)
data/events.js          — ⭐ baza de date bilingvă: EVENTS + STATS + ERAS (sursa unică de adevăr)
app-ios/                — stratul de interfață al aplicației iOS (swipe, temă dark/light, tab bar jos)
ios/                    — proiectul nativ Xcode generat de Capacitor
branding/               — logo: logo.svg (master 1024), logo-dark.svg, logo-horizontal.svg (wordmark)
capacitor.config.json   — configurația Capacitor (webDir: app-ios)
serve.js                — server static minimal pentru dezvoltare (node serve.js 8400)
manifest.webmanifest    — PWA (instalabilă pe telefon din browser)
icons/icon.svg          — iconița aplicației
```

## Cum o rulezi local

```bash
node serve.js 8400
# apoi deschide http://localhost:8400
```

## Cum adaugi un eveniment

În `data/events.js`, adaugă un obiect în `EVENTS` — **bilingv**:

```js
{ m: 6, d: 11, y: 1948,            // luna, ziua, anul
  scope: "ro",                      // "ro" = România, "eu" = Europa
  era: "comunism",                  // medieval | modern | interbelic | ww2 | comunism | tranzitie | ue
  title: { ro: "Titlu scurt, factual", en: "Short, factual title" },
  text:  { ro: "Fapte, nu opinii.", en: "Facts, not opinions." },
  why:   { ro: "Opțional.", en: "Optional." },
  sources: [{ n: "Numele sursei", u: "https://..." }] }
```

**Checklist înainte de commit:**
- data verificată în minimum două surse independente;
- ambele limbi completate;
- linkurile funcționează — rulează verificarea:

```bash
# verifică toate URL-urile surselor (trebuie: Probleme: 0)
node -e 'const fs=require("fs");const[E,S]=eval(fs.readFileSync("data/events.js","utf8")+"\n;[EVENTS,STATS]");const urls=[...new Set([...E.flatMap(e=>e.sources.map(s=>s.u)),...S.map(s=>s.src.u)])];(async()=>{const r=await Promise.all(urls.map(async u=>{try{const x=await fetch(u,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0"}});return{u,s:x.status}}catch(e){return{u,s:"ERR"}}}));const bad=r.filter(x=>x.s!==200);console.log("URL-uri:",urls.length,"| Probleme:",bad.length);bad.forEach(b=>console.log(b.s,b.u))})();'
```

## Publicare (gratuit)

- **GitHub Pages**: push în repo → Settings → Pages → branch `main`.
- **Netlify / Vercel**: drag-and-drop al folderului.

## Aplicația iOS (Capacitor) — `app-ios/` + `ios/`

Aplicația iOS are propriul strat de interfață, **separat de aplicația web** (care rămâne neatinsă), optimizat pentru telefon:

- **Swipe stânga/dreapta** pentru a naviga între zile (cu animație + haptic feedback în aplicația nativă);
- **Header compact**: filtrele de epocă sunt mutate într-un *bottom sheet* (butonul „Epoci”), ca să lase loc gestului de swipe;
- **Bara de tab-uri jos**, în stil iOS (Azi / Atunci vs. Acum / Quiz);
- **Temă light/dark**: urmează automat setarea sistemului, cu comutator manual (🌙/☀️) persistat;
- **Safe areas** (notch / Dynamic Island / home indicator) prin `env(safe-area-inset-*)` — funcționează pe toate modelele: standard, Air, Pro, Pro Max, SE;
- Aceeași bază de date: `data/events.js` este copiată în `app-ios/data/` la sincronizare.

```bash
# după ce modifici evenimentele sau app-ios:
npm run ios:sync        # copiază datele + sincronizează proiectul nativ
npm run ios:open        # deschide proiectul în Xcode

# build din terminal (după acceptarea licenței Xcode):
# sudo xcodebuild -license accept && xcodebuild -downloadPlatform iOS
```

Platforma nativă folosește Swift Package Manager (fără CocoaPods). Pluginuri instalate: `@capacitor/status-bar` (stilul barei de status urmează tema), `@capacitor/haptics` (vibrație discretă la swipe).

De adăugat înainte de App Store: iconițe native, splash screen, notificare zilnică locală cu `@capacitor/local-notifications`.

## Roadmap idei

- [ ] Acoperire completă: minimum un eveniment pentru fiecare zi a anului (acum: 104/366)
- [ ] Notificare zilnică (PWA push / Capacitor local notifications)
- [ ] Partajare card pe Instagram/TikTok (generare imagine din card)
- [ ] Mod „streak” — vii zilnic, îți crește seria (gamification)
- [ ] Quiz extins: „ce eveniment a fost primul?”, nu doar ani
