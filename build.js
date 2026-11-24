// Sestavení webu: content/*.json + src/index.template.html -> dist/
// Bez závislostí, stačí Node.js:  node build.js
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const list = (v) => (Array.isArray(v) ? v : []);
const initials = (name) => String(name || '').split(/\s+/).filter(Boolean)
  .map((w) => w[0]).join('').replace(/\./g, '').slice(0, 2).toUpperCase();

const nastaveni = read('nastaveni.json');
const cenik = read('cenik.json');
const sluzby = read('sluzby.json');
const realizace = read('realizace.json');
const recenze = read('recenze.json');

const cenikOn = cenik.zobrazit !== false && list(cenik.polozky).length > 0;
const recenzeOn = recenze.zobrazit !== false && list(recenze.polozky).length > 0;
const galerie = list(realizace.galerie).map((g) => g.foto).filter(Boolean);

// --- Navigace ---------------------------------------------------------------
const navItems = [
  ['#o-mne', 'O mně'],
  ['#sluzby', 'Služby'],
  cenikOn && ['#cenik', 'Ceník'],
  ['#realizace', 'Realizace'],
  recenzeOn && ['#recenze', 'Recenze'],
  ['#kontakt', 'Kontakt'],
].filter(Boolean);
const navDesktop = navItems.map(([h, t]) =>
  `                <a href="${h}" class="text-slate-300 hover:text-blueAccent transition-colors">${t}</a>`).join('\n');
const navMobile = navItems.map(([h, t]) =>
  `            <a href="${h}" class="block text-slate-200 hover:text-blueAccent font-medium py-1 mobile-link">${t}</a>`).join('\n');

// --- Odznak "Přijímá zakázky" ----------------------------------------------
const badge = nastaveni.prijima_zakazky !== false
  ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                    Přijímá zakázky
                                </span>`
  : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
                                    Plně obsazeno
                                </span>`;

// --- Služby -----------------------------------------------------------------
const sluzbyHtml = list(sluzby.polozky).map((s) => {
  const wide = s.siroka ? ' md:col-span-2 lg:col-span-2' : '';
  const h = s.siroka ? 'h-48 md:h-56' : 'h-48';
  const foto = s.foto ? `<img src="${esc(s.foto)}" alt="${esc(s.nazev)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : '';
  const stitek = s.stitek ? `\n                        <div class="absolute top-4 right-4 z-20 bg-electricBlue text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">${esc(s.stitek)}</div>` : '';
  return `
                <div class="bg-slateCard border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-electricBlue transition-all flex flex-col justify-between group${wide}">
                    <div class="${h} overflow-hidden relative">
                        <div class="absolute inset-0 bg-gradient-to-t from-slateCard via-slateCard/20 to-transparent z-10"></div>
                        ${foto}${stitek}
                    </div>
                    <div class="p-8 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                            <div class="flex items-center gap-3 mb-3">
                                <div class="text-blueAccent text-xl"><i class="fa-solid ${esc(s.ikona || 'fa-circle-check')}"></i></div>
                                <h4 class="text-xl font-bold text-white">${esc(s.nazev)}</h4>
                            </div>
                            <p class="text-slate-400 text-sm leading-relaxed">${esc(s.popis)}</p>
                        </div>
                        <a href="#kontakt" class="inline-flex items-center gap-2 text-blueAccent font-semibold text-sm hover:text-cyan-300 transition-colors pt-2">
                            <span>${esc(s.tlacitko || 'Mám zájem')}</span> <i class="fa-solid fa-arrow-right text-xs"></i>
                        </a>
                    </div>
                </div>`;
}).join('\n');

// --- Ceník ------------------------------------------------------------------
const cenikHtml = !cenikOn ? '' : `    <!-- Ceník -->
    <section id="cenik" class="py-24 bg-slateDark border-t border-slate-800/80">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto space-y-4 mb-12">
                <h2 class="text-xs font-bold uppercase tracking-widest text-blueAccent">Ceník</h2>
                <h3 class="text-3xl sm:text-4xl font-extrabold text-white">Orientační ceny</h3>
                ${cenik.uvod ? `<p class="text-slate-300">${esc(cenik.uvod)}</p>` : ''}
            </div>
            <div class="bg-slateCard border border-slate-800 rounded-3xl shadow-xl divide-y divide-slate-800">
${list(cenik.polozky).map((p) => `                <div class="flex items-center justify-between gap-6 px-6 sm:px-8 py-5">
                    <div>
                        <div class="font-semibold text-white">${esc(p.nazev)}</div>
                        ${p.poznamka ? `<div class="text-xs text-slate-400 mt-0.5">${esc(p.poznamka)}</div>` : ''}
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electricBlue to-cyan-400">${esc(p.cena)}</span>
                        ${p.jednotka ? `<span class="text-xs text-slate-400 block">${esc(p.jednotka)}</span>` : ''}
                    </div>
                </div>`).join('\n')}
            </div>
            ${cenik.poznamka_dole ? `<p class="text-center text-xs text-slate-400 mt-6">${esc(cenik.poznamka_dole)}</p>` : ''}
            <div class="text-center mt-8">
                <a href="#kontakt" class="inline-flex items-center gap-2 bg-electricBlue hover:bg-blueHover text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-electricBlue/30 transition-all">
                    <i class="fa-solid fa-calculator"></i> Chci přesnou nabídku
                </a>
            </div>
        </div>
    </section>`;

// --- Realizace --------------------------------------------------------------
const projektyHtml = list(realizace.projekty).map((p) => `
                <div class="bg-slateCard/95 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl group">
                    <div class="h-64 overflow-hidden relative">
                        <img src="${esc(p.foto)}" alt="${esc(p.nazev)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        ${p.popisek_foto ? `<div class="absolute inset-0 bg-gradient-to-t from-slateDark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span class="text-white text-sm font-medium">${esc(p.popisek_foto)}</span>
                        </div>` : ''}
                    </div>
                    <div class="p-6">
                        <span class="text-xs font-semibold text-blueAccent uppercase tracking-wider">${esc(p.kategorie)}</span>
                        <h4 class="text-lg font-bold text-white mt-1">${esc(p.nazev)}</h4>
                        <p class="text-slate-300 text-sm mt-2">${esc(p.popis)}</p>
                    </div>
                </div>`).join('\n');

const galerieBtn = galerie.length === 0 ? '' : `            <div class="mt-12">
                <button id="open-gallery-btn" class="w-full bg-slateCard/90 hover:bg-slate-900 border border-slate-700/80 hover:border-blueAccent text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group">
                    <span class="tracking-widest uppercase text-blueAccent text-sm sm:text-base group-hover:scale-105 transition-transform">více</span>
                    <i class="fa-solid fa-chevron-down text-blueAccent group-hover:translate-y-1 transition-transform"></i>
                </button>
            </div>`;

// --- Recenze ----------------------------------------------------------------
const star = '<i class="fa-solid fa-star"></i>';
const starOff = '<i class="fa-regular fa-star"></i>';
const recenzeHtml = !recenzeOn ? '' : `    <!-- Recenze -->
    <section id="recenze" class="py-24 bg-slateDark border-t border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <h2 class="text-xs font-bold uppercase tracking-widest text-blueAccent">Recenze</h2>
                <h3 class="text-3xl sm:text-4xl font-extrabold text-white">Co říkají zákazníci</h3>
                <p class="text-slate-300">Přečtěte si hodnocení od lidí, kterým jsem pomohl se stíněním.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
${list(recenze.polozky).map((r) => {
  const n = Math.max(0, Math.min(5, Number(r.hvezdy) || 5));
  return `                <div class="bg-slateCard border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
                    <div class="space-y-4">
                        <div class="flex text-amber-400 gap-1 text-sm">${star.repeat(n)}${starOff.repeat(5 - n)}</div>
                        <p class="text-slate-300 text-sm italic leading-relaxed">„${esc(r.text)}“</p>
                    </div>
                    <div class="flex items-center gap-3 pt-4 border-t border-slate-800">
                        <div class="w-10 h-10 rounded-full bg-electricBlue/20 text-blueAccent flex items-center justify-center font-bold">${esc(initials(r.jmeno))}</div>
                        <div>
                            <h5 class="font-bold text-white text-sm">${esc(r.jmeno)}</h5>
                            ${r.misto ? `<span class="text-xs text-slate-400">${esc(r.misto)}</span>` : ''}
                        </div>
                    </div>
                </div>`;
}).join('\n')}
            </div>
        </div>
    </section>`;

// --- Formulář ---------------------------------------------------------------
const formOptions = [...list(sluzby.polozky).map((s) => s.nazev), 'Jiné / Poradenství']
  .map((n) => `                                    <option>${esc(n)}</option>`).join('\n');

// --- Složení ----------------------------------------------------------------
const tel = String(nastaveni.telefon || '').trim();
const vars = {
  TEL: esc(tel),
  TEL_HREF: esc(tel.replace(/[^\d+]/g, '')),
  EMAIL: esc(nastaveni.email),
  NAV_DESKTOP: navDesktop,
  NAV_MOBILE: navMobile,
  BADGE: badge,
  SLUZBY: sluzbyHtml,
  CENIK: cenikHtml,
  PROJEKTY: projektyHtml,
  GALERIE_BTN: galerieBtn,
  GALERIE_JSON: JSON.stringify(galerie).replace(/</g, '\\u003c'),
  RECENZE: recenzeHtml,
  FORM_OPTIONS: formOptions,
  ROK: String(new Date().getFullYear()),
};

let html = fs.readFileSync(path.join(ROOT, 'src', 'index.template.html'), 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
  if (!(k in vars)) throw new Error('Neznámá proměnná v šabloně: ' + m);
  return vars[k];
});

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html);
for (const dir of ['images', 'admin', 'dekujeme']) {
  fs.cpSync(path.join(ROOT, dir === 'dekujeme' ? 'src/dekujeme' : dir), path.join(DIST, dir), { recursive: true });
}
console.log(`Hotovo: ${list(sluzby.polozky).length} služeb, ${list(cenik.polozky).length} položek ceníku, ` +
  `${list(realizace.projekty).length} projektů, ${galerie.length} fotek v galerii, ${list(recenze.polozky).length} recenzí.`);
