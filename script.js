'use strict';
/* ===== Utilitaires ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); // anti-injection HTML
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ymd = d => new Date(d).toLocaleDateString('sv');
const DAY = 864e5;

/* ===== Traductions FR / AR / EN ===== */
const T = {
  fr: { dash: 'Tableau de bord', notes: 'Notes', tasks: 'Devoirs', pomo: 'Pomodoro', grades: 'Résultats', cards: 'Flashcards', search: 'Rechercher une note…', export: 'Sauvegarder', import: 'Restaurer', hello: 'Bonjour', name: 'Votre prénom', title: 'Titre', subject: 'Matière', tags: 'Étiquettes (virgules)', content: 'Contenu', pin: 'Épingler', save: 'Enregistrer', clear: 'Nouvelle note', edit: 'Modifier', del: 'Supprimer', restore: 'Restaurer', trash: 'Corbeille (30 jours)', sortNew: 'Plus récentes', sortOld: 'Plus anciennes', print: 'Imprimer / PDF', high: 'Haute', mid: 'Moyenne', low: 'Basse', add: 'Ajouter', start: 'Démarrer', pause: 'Pause', reset: 'Réinitialiser', work: 'Travail', short: 'Pause courte', long: 'Pause longue', sound: 'Son', today: "Aujourd'hui", total: 'Total', mark: 'Note /20', coef: 'Coefficient', avg: 'Moyenne générale', goal: 'Objectif', front: 'Question', back: 'Réponse', empty: 'Rien ici pour le moment.', week: 'Étude cette semaine (min)', last: 'Dernières notes', late: 'en retard', saved: 'Enregistré', bad: 'Fichier invalide', pending: 'À faire', sessions: 'séances', tip: 'Cliquez sur une carte pour la retourner.', ok: 'Objectif atteint', ko: 'Écart avec l’objectif' },
  en: { dash: 'Dashboard', notes: 'Notes', tasks: 'Tasks', pomo: 'Pomodoro', grades: 'Grades', cards: 'Flashcards', search: 'Search notes…', export: 'Backup', import: 'Restore', hello: 'Hello', name: 'Your first name', title: 'Title', subject: 'Subject', tags: 'Tags (comma)', content: 'Content', pin: 'Pin', save: 'Save', clear: 'New note', edit: 'Edit', del: 'Delete', restore: 'Restore', trash: 'Trash (30 days)', sortNew: 'Newest', sortOld: 'Oldest', print: 'Print / PDF', high: 'High', mid: 'Medium', low: 'Low', add: 'Add', start: 'Start', pause: 'Pause', reset: 'Reset', work: 'Focus', short: 'Short break', long: 'Long break', sound: 'Sound', today: 'Today', total: 'Total', mark: 'Mark /20', coef: 'Coefficient', avg: 'Overall average', goal: 'Goal', front: 'Question', back: 'Answer', empty: 'Nothing here yet.', week: 'Study this week (min)', last: 'Latest notes', late: 'overdue', saved: 'Saved', bad: 'Invalid file', pending: 'To do', sessions: 'sessions', tip: 'Click a card to flip it.', ok: 'Goal reached', ko: 'Gap to goal' },
  ar: { dash: 'لوحة التحكم', notes: 'الملاحظات', tasks: 'المهام', pomo: 'بومودورو', grades: 'النتائج', cards: 'البطاقات', search: 'ابحث في الملاحظات…', export: 'نسخ احتياطي', import: 'استعادة', hello: 'مرحبا', name: 'اسمك', title: 'العنوان', subject: 'المادة', tags: 'وسوم (فاصلة)', content: 'المحتوى', pin: 'تثبيت', save: 'حفظ', clear: 'ملاحظة جديدة', edit: 'تعديل', del: 'حذف', restore: 'استرجاع', trash: 'سلة المحذوفات (30 يوما)', sortNew: 'الأحدث', sortOld: 'الأقدم', print: 'طباعة / PDF', high: 'عالية', mid: 'متوسطة', low: 'منخفضة', add: 'إضافة', start: 'ابدأ', pause: 'إيقاف', reset: 'إعادة', work: 'تركيز', short: 'استراحة قصيرة', long: 'استراحة طويلة', sound: 'صوت', today: 'اليوم', total: 'المجموع', mark: 'النقطة /20', coef: 'المعامل', avg: 'المعدل العام', goal: 'الهدف', front: 'سؤال', back: 'جواب', empty: 'لا شيء هنا بعد.', week: 'الدراسة هذا الأسبوع (د)', last: 'آخر الملاحظات', late: 'متأخرة', saved: 'تم الحفظ', bad: 'ملف غير صالح', pending: 'للإنجاز', sessions: 'حصص', tip: 'انقر على البطاقة لقلبها.', ok: 'تم بلوغ الهدف', ko: 'الفارق عن الهدف' }
};
const t = k => (T[S.lang] && T[S.lang][k]) || T.fr[k] || k;

/* ===== Données (localStorage) + démo ===== */
const KEY = 'studyhub.v1', LISTS = ['notes', 'trash', 'tasks', 'grades', 'cards', 'pomo'];
const now = Date.now();
const demo = () => ({
  lang: 'fr', theme: 'dark', name: '', goal: 14, sound: true, cfg: { w: 25, s: 5, l: 15 }, draft: null,
  notes: [
    { id: uid(), title: 'Théorème de Pythagore', subject: 'Maths', tags: 'géométrie, cours', body: 'Dans un triangle rectangle : a² + b² = c².\nExemple : 3² + 4² = 5².', pin: true, cre: now, mod: now },
    { id: uid(), title: 'La cellule', subject: 'SVT', tags: 'biologie', body: 'Noyau, cytoplasme, membrane.', pin: false, cre: now - DAY, mod: now - DAY }
  ],
  trash: [],
  tasks: [
    { id: uid(), title: 'Exercices page 42', subject: 'Maths', due: ymd(now + DAY), prio: '1', done: false },
    { id: uid(), title: 'Résumé du chapitre 3', subject: 'SVT', due: ymd(now + 4 * DAY), prio: '2', done: false }
  ],
  grades: [
    { id: uid(), subject: 'Maths', mark: 15, coef: 7 }, { id: uid(), subject: 'Maths', mark: 13, coef: 7 },
    { id: uid(), subject: 'Physique', mark: 12.5, coef: 7 }, { id: uid(), subject: 'SVT', mark: 16, coef: 5 }
  ],
  cards: [{ id: uid(), q: 'Formule de la vitesse ?', a: 'v = d / t' }, { id: uid(), q: 'Capitale du Maroc ?', a: 'Rabat' }],
  pomo: []
});
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || typeof S !== 'object') S = demo();
S = Object.assign(demo(), S);
S.trash = S.trash.filter(x => now - x.del < 30 * DAY); // corbeille : 30 jours
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Stockage plein'); } };

function toast(m) { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 1800); }
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }

/* ===== Langue, thème, navigation ===== */
function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr'; // mise en page RTL automatique
  $('#lang').value = S.lang;
  $$('[data-i]').forEach(e => e.textContent = t(e.dataset.i));
  $$('[data-p]').forEach(e => e.placeholder = t(e.dataset.p));
  render();
}
function show(v) {
  $$('.view').forEach(x => x.hidden = x.id !== 'v-' + v);
  $$('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
}
$$('nav button').forEach(b => b.onclick = () => show(b.dataset.v));
$('#burger').onclick = () => document.body.classList.toggle('min');
$('#theme').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; document.body.dataset.theme = S.theme; save(); };
$('#lang').onchange = e => { S.lang = e.target.value; save(); applyLang(); };

/* ===== Tableau de bord ===== */
const minutes = d => S.pomo.filter(p => p.d === d).reduce((a, p) => a + p.m, 0);
function gradeStats() {
  const g = {};
  S.grades.forEach(x => { const o = g[x.subject] = g[x.subject] || { m: [], c: 1 }; o.m.push(x.mark); o.c = x.coef; });
  const L = Object.entries(g).map(([s, o]) => ({ s, a: o.m.reduce((p, c) => p + c, 0) / o.m.length, c: o.c }));
  const tc = L.reduce((p, x) => p + x.c, 0);
  return { L, avg: tc ? L.reduce((p, x) => p + x.a * x.c, 0) / tc : null };
}
function rDash() {
  $('#hello').textContent = t('hello') + (S.name ? ' ' + S.name : '') + ' 👋';
  $('#name').value = S.name;
  const todo = S.tasks.filter(x => !x.done), g = gradeStats();
  $('#stats').innerHTML = [[t('pending'), todo.length], [t('today'), minutes(ymd(now)) + ' min'], [t('avg'), g.avg === null ? '–' : g.avg.toFixed(2)], [t('notes'), S.notes.length]]
    .map(([l, v]) => `<div class="card stat"><b>${esc(v)}</b>${esc(l)}</div>`).join('');
  const days = [...Array(7)].map((_, i) => ymd(Date.now() - (6 - i) * DAY)), vals = days.map(minutes), mx = Math.max(...vals, 1);
  $('#week').innerHTML = vals.map((v, i) => `<i style="height:${Math.max(3, v / mx * 100)}%" title="${days[i]} : ${v} min"></i>`).join('');
  $('#dtasks').innerHTML = todo.slice(0, 4).map(x => `<div class="item p${esc(x.prio)}"><span>${esc(x.title)}</span></div>`).join('') || `<p class="empty">${t('empty')}</p>`;
  $('#dnotes').innerHTML = [...S.notes].sort((a, b) => b.mod - a.mod).slice(0, 3).map(n => `<div class="item"><span>${esc(n.title)}</span></div>`).join('') || `<p class="empty">${t('empty')}</p>`;
}
function tickClock() { $('#clock').textContent = new Date().toLocaleString(S.lang === 'ar' ? 'ar-MA' : S.lang === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'full', timeStyle: 'medium' }); }
$('#name').oninput = e => { S.name = e.target.value.trim(); save(); $('#hello').textContent = t('hello') + (S.name ? ' ' + S.name : '') + ' 👋'; };

/* ===== Notes ===== */
let editId = null;
const fields = () => ({ title: $('#nt').value.trim(), subject: $('#ns').value.trim(), tags: $('#ng').value, body: $('#nb').value, pin: $('#np').checked });
function fillNote(n) { $('#nt').value = n.title; $('#ns').value = n.subject; $('#ng').value = n.tags; $('#nb').value = n.body; $('#np').checked = n.pin; }
function resetNote() { editId = null; S.draft = null; $('#nf').reset(); }
function rNotes() {
  const q = $('#q').value.toLowerCase(), old = $('#sort').value === 'old';
  const L = S.notes.filter(n => (n.title + n.body + n.subject + n.tags).toLowerCase().includes(q))
    .sort((a, b) => (b.pin - a.pin) || (old ? a.mod - b.mod : b.mod - a.mod));
  $('#nlist').innerHTML = L.map(n => `<article class="card ${n.pin ? 'pin' : ''}"><h3>${n.pin ? '📌 ' : ''}${esc(n.title)}</h3>
    <small class="mu">${esc(n.subject)}${n.tags.split(',').filter(x => x.trim()).map(x => `<span class="tag">#${esc(x.trim())}</span>`).join('')}</small>
    <p>${esc(n.body).replace(/\n/g, '<br>')}</p>
    <div class="row"><button data-a="nedit" data-id="${n.id}">${t('edit')}</button><button data-a="ndel" data-id="${n.id}">${t('del')}</button></div></article>`).join('') || `<p class="empty">${t('empty')}</p>`;
  $('#tlist').innerHTML = S.trash.map(n => `<div class="item"><span class="sp">${esc(n.title)}</span><button data-a="nres" data-id="${n.id}">${t('restore')}</button></div>`).join('') || `<p class="empty">${t('empty')}</p>`;
}
$('#nf').onsubmit = e => {
  e.preventDefault();
  const f = fields();
  if (editId) Object.assign(S.notes.find(n => n.id === editId), f, { mod: Date.now() });
  else S.notes.push({ id: uid(), cre: Date.now(), mod: Date.now(), ...f });
  resetNote(); save(); render(); toast(t('saved'));
};
$('#nf').oninput = () => { S.draft = fields(); save(); }; // enregistrement automatique du brouillon
$('#nc').onclick = () => { resetNote(); save(); };
$('#sort').onchange = rNotes;
$('#q').oninput = () => { show('notes'); rNotes(); };
$('#etxt').onclick = () => download('notes.txt', S.notes.map(n => `# ${n.title} [${n.subject}]\n${n.body}\n`).join('\n---\n\n'), 'text/plain');
$('#ejson').onclick = () => download('notes.json', JSON.stringify(S.notes, null, 2), 'application/json');
$('#eprint').onclick = () => window.print();

/* ===== Devoirs ===== */
function rTasks() {
  const td = ymd(now);
  $('#tl').innerHTML = [...S.tasks].sort((a, b) => a.done - b.done || (a.due || '9').localeCompare(b.due || '9') || a.prio - b.prio).map(x => {
    const late = !x.done && x.due && x.due < td;
    return `<div class="item p${esc(x.prio)} ${x.done ? 'done' : ''} ${late ? 'late' : ''}">
      <input type="checkbox" data-a="tdone" data-id="${x.id}" ${x.done ? 'checked' : ''}>
      <span class="sp">${esc(x.title)} <small class="mu">${esc(x.subject)} ${esc(x.due || '')} ${late ? '⚠ ' + t('late') : ''}</small></span>
      <button data-a="tdel" data-id="${x.id}">${t('del')}</button></div>`;
  }).join('') || `<p class="empty">${t('empty')}</p>`;
}
$('#tf').onsubmit = e => {
  e.preventDefault();
  S.tasks.push({ id: uid(), title: $('#tt').value.trim(), subject: $('#ts').value.trim(), due: $('#td').value, prio: $('#tp').value, done: false });
  e.target.reset(); save(); render();
};

/* ===== Pomodoro ===== */
let mode = 'w', left = S.cfg.w * 60, timer = null, cycles = 0;
const dur = () => S.cfg[mode] * 60;
function beep() {
  if (!S.sound) return;
  try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.connect(c.destination); o.frequency.value = 880; o.start(); o.stop(c.currentTime + .4); } catch (e) { /* audio indisponible */ }
}
function drawPomo() {
  $('#tm').textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
  $('#ring').style.strokeDashoffset = 565.5 * (1 - left / dur());
  $('#mode').textContent = t(mode === 'w' ? 'work' : mode === 's' ? 'short' : 'long');
  $('#pgo').textContent = t(timer ? 'pause' : 'start');
  const d = ymd(now), wk = S.pomo.filter(p => Date.now() - p.t < 7 * DAY).reduce((a, p) => a + p.m, 0), tot = S.pomo.reduce((a, p) => a + p.m, 0);
  $('#pst').textContent = `${t('today')} : ${minutes(d)} min · 7j : ${wk} min · ${t('total')} : ${tot} min · ${S.pomo.length} ${t('sessions')}`;
}
function finish() {
  clearInterval(timer); timer = null; beep();
  if (mode === 'w') { S.pomo.push({ d: ymd(Date.now()), t: Date.now(), m: S.cfg.w }); cycles++; mode = cycles % 4 ? 's' : 'l'; save(); render(); }
  else mode = 'w';
  left = dur(); drawPomo();
}
$('#pgo').onclick = () => {
  if (timer) { clearInterval(timer); timer = null; }
  else timer = setInterval(() => { left--; if (left <= 0) finish(); else drawPomo(); }, 1000);
  drawPomo();
};
$('#prs').onclick = () => { clearInterval(timer); timer = null; mode = 'w'; left = dur(); drawPomo(); };
$('#snd').onchange = e => { S.sound = e.target.checked; save(); };
[['cw', 'w'], ['cs', 's'], ['cl', 'l']].forEach(([id, k]) => {
  $('#' + id).value = S.cfg[k];
  $('#' + id).onchange = e => { S.cfg[k] = Math.max(1, +e.target.value || 1); save(); if (!timer && mode === k) left = dur(); drawPomo(); };
});

/* ===== Résultats ===== */
function rGrades() {
  const g = gradeStats();
  $('#goal').value = S.goal;
  const diff = g.avg === null ? null : g.avg - S.goal;
  $('#gsum').innerHTML = `<h3>${t('avg')} : ${g.avg === null ? '–' : g.avg.toFixed(2) + ' / 20'}</h3>` +
    (diff === null ? '' : `<p>${diff >= 0 ? '✅ ' + t('ok') : '⚠ ' + t('ko')} : ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}</p>`) +
    g.L.sort((a, b) => a.a - b.a).map(x => `<div class="row"><span style="min-width:90px">${esc(x.s)} ×${esc(x.c)}</span><div class="meter"><i class="${x.a < S.goal ? 'low' : ''}" style="width:${x.a / 20 * 100}%"></i></div><b>${x.a.toFixed(2)}</b></div>`).join('');
  $('#gl').innerHTML = S.grades.map(x => `<div class="item"><span class="sp">${esc(x.subject)} — ${esc(x.mark)}/20 (×${esc(x.coef)})</span><button data-a="gdel" data-id="${x.id}">${t('del')}</button></div>`).join('');
}
$('#gf').onsubmit = e => {
  e.preventDefault();
  const m = Math.min(20, Math.max(0, +$('#gm').value)), c = Math.max(1, +$('#gc').value || 1);
  S.grades.push({ id: uid(), subject: $('#gs').value.trim(), mark: m, coef: c });
  e.target.reset(); $('#gc').value = 1; save(); render();
};
$('#goal').onchange = e => { S.goal = Math.min(20, Math.max(0, +e.target.value)); save(); render(); };

/* ===== Flashcards ===== */
function rCards() {
  $('#cl2').innerHTML = S.cards.map(c => `<div><button class="flip" data-a="cflip" data-q="${esc(c.q)}" data-ans="${esc(c.a)}" data-f="0">${esc(c.q)}</button>
    <div class="row"><button data-a="cdel" data-id="${c.id}">${t('del')}</button></div></div>`).join('') || `<p class="empty">${t('empty')}</p>`;
}
$('#cf').onsubmit = e => { e.preventDefault(); S.cards.push({ id: uid(), q: $('#cq').value.trim(), a: $('#ca').value.trim() }); e.target.reset(); save(); render(); };

/* ===== Actions (délégation des clics) ===== */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b) return;
  const id = b.dataset.id, a = b.dataset.a;
  if (a === 'nedit') { const n = S.notes.find(x => x.id === id); if (n) { editId = id; fillNote(n); $('#nt').focus(); window.scrollTo(0, 0); } return; }
  if (a === 'ndel') { const i = S.notes.findIndex(x => x.id === id); if (i > -1) S.trash.push({ ...S.notes.splice(i, 1)[0], del: Date.now() }); }
  if (a === 'nres') { const i = S.trash.findIndex(x => x.id === id); if (i > -1) { const { del, ...n } = S.trash.splice(i, 1)[0]; S.notes.push(n); } }
  if (a === 'tdone') { const x = S.tasks.find(y => y.id === id); if (x) x.done = b.checked; }
  if (a === 'tdel') S.tasks = S.tasks.filter(x => x.id !== id);
  if (a === 'gdel') S.grades = S.grades.filter(x => x.id !== id);
  if (a === 'cdel') S.cards = S.cards.filter(x => x.id !== id);
  if (a === 'cflip') { const f = b.dataset.f === '1'; b.textContent = f ? b.dataset.q : b.dataset.ans; b.dataset.f = f ? '0' : '1'; return; }
  save(); render();
});

/* ===== Sauvegarde / restauration JSON ===== */
$('#exp').onclick = () => download('studyhub-' + ymd(Date.now()) + '.json', JSON.stringify(S, null, 2), 'application/json');
$('#imp').onchange = async e => {
  try {
    const d = JSON.parse(await e.target.files[0].text());
    if (!d || typeof d !== 'object' || LISTS.some(k => d[k] !== undefined && !Array.isArray(d[k]))) throw 0;
    S = Object.assign(demo(), d); save(); document.body.dataset.theme = S.theme; applyLang(); toast(t('saved'));
  } catch (err) { toast(t('bad')); }
  e.target.value = '';
};

/* ===== Raccourcis clavier ===== */
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); $('#q').focus(); }
  if (e.altKey && e.key === 'n') { show('notes'); resetNote(); $('#nt').focus(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && $('#v-notes').hidden === false) { e.preventDefault(); $('#nf').requestSubmit(); }
});

/* ===== Démarrage ===== */
function render() { rDash(); rNotes(); rTasks(); rGrades(); rCards(); drawPomo(); }
document.body.dataset.theme = S.theme;
$('#snd').checked = S.sound;
if (S.draft) fillNote(S.draft); // restaure le brouillon non enregistré
applyLang(); show('dash'); tickClock(); setInterval(tickClock, 1000);
