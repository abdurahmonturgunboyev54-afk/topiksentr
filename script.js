/* ===== SOZLAMALAR: ma’lumotlarni shu yerda o’zgartiring ===== */
const CONFIG = {
  address: "TOPIK_CENTER, Andijon, Andijon viloyati",
  phone: "[TELEFON]",     // masalan: "+998 90 123 45 67"
  since: "[YIL]"          // masalan: "2020"
};

/* Ariza paneli sozlamalari */
Object.assign(CONFIG, {
  telegram: "[TELEGRAM]",   // markazning Telegram foydalanuvchi nomi, @ belgisiz (masalan: topik_center)
  days: ["Dushanba, Chorshanba, Juma", "Seshanba, Payshanba, Shanba"],
  times: ["10:00–11:30", "11:30–13:00", "13:00–14:30", "14:30–16:00"]   // har bir dars 1,5 soat
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Aloqa ma’lumotlarini sahifaga qo’yish */
document.querySelectorAll("[data-fill]").forEach(el => {
  el.textContent = CONFIG[el.dataset.fill];
});
const phoneLink = document.getElementById("phoneLink");
if (/\d/.test(CONFIG.phone)) phoneLink.href = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
document.getElementById("year").textContent = new Date().getFullYear();

/* ===== RO’YXATDAN O’TISH PANELI ===== */
const TEACHERS = [
  { id: "temur", name: "Temur Ibragimov", note: "TOPIK 5-daraja, 6 yillik tajriba", ini: "TI" },
  { id: "mubina", name: "Mubina", note: "TOPIK 4-daraja, 3 yillik tajriba", ini: "M" },
  { id: "gulzira", name: "Gulzira", note: "TOPIK 5-daraja, 2 yillik tajriba", ini: "G" }
];
const LEVELS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
const reg = document.getElementById("reg");
const regBody = document.getElementById("regBody");
const regBar = document.getElementById("regBar");
let st, step;

function resetReg() {
  st = { teacher: null, studied: null, level: null, first: "", last: "", phone: "", days: [], times: [] };
  step = "teacher";
}
function stepsList() {
  return ["teacher", "studied"].concat(st.studied ? ["level"] : [], ["info", "schedule", "done"]);
}
function go(next) { step = next; renderReg(); reg.scrollTop = 0; }
function nextStep() { const l = stepsList(); go(l[l.indexOf(step) + 1]); }
function prevStep() {
  const l = stepsList(), i = l.indexOf(step);
  if (i <= 0) closeReg(); else go(l[i - 1]);
}
function closeReg() { location.hash = "#kirish"; }

/* Panelni hash orqali ochish/yopish (#royxat) */
function syncReg() {
  const open = location.hash === "#royxat";
  if (open && reg.hidden) {
    resetReg(); renderReg(); reg.hidden = false; document.body.style.overflow = "hidden";
  } else if (!open && !reg.hidden) {
    reg.hidden = true; document.body.style.overflow = "";
  }
}
window.addEventListener("hashchange", syncReg);
document.getElementById("regBack").addEventListener("click", prevStep);
document.getElementById("regClose").addEventListener("click", closeReg);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !reg.hidden) closeReg(); });

function ordered(chosen, all) { return all.filter(x => chosen.includes(x)).join(", "); }
function buildMsg() {
  const t = TEACHERS.find(x => x.id === st.teacher);
  return [
    "Topik Center, yangi ariza",
    "Ustoz: " + t.name,
    "Oldin o’qiganmi: " + (st.studied ? "Ha, " + st.level + " darajagacha" : "Yo’q"),
    "Ism: " + st.first,
    "Familiya: " + st.last,
    "Telefon: " + st.phone,
    "Kunlar: " + ordered(st.days, CONFIG.days),
    "Vaqt: " + ordered(st.times, CONFIG.times)
  ].join("\n");
}

function renderReg() {
  const l = stepsList();
  regBar.style.width = (l.indexOf(step) / (l.length - 1)) * 100 + "%";
  const R = { teacher: stepTeacher, studied: stepStudied, level: stepLevel, info: stepInfo, schedule: stepSchedule, done: stepDone };
  R[step]();
  const title = document.getElementById("regTitle");
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
}

function stepTeacher() {
  regBody.innerHTML = `<h2 id="regTitle">Ustozni tanlang</h2>
    <div class="opt-list">${TEACHERS.map(t => `
      <button type="button" class="opt${st.teacher === t.id ? " on" : ""}" data-id="${t.id}">
        <span class="avatar">${t.ini}</span><span><strong>${t.name}</strong><small>${t.note}</small></span>
      </button>`).join("")}</div>`;
  regBody.querySelectorAll(".opt").forEach(b => b.onclick = () => { st.teacher = b.dataset.id; nextStep(); });
}

function stepStudied() {
  regBody.innerHTML = `<h2 id="regTitle">Oldin koreys tilini o’qiganmisiz?</h2>
    <div class="yn">
      <button type="button" class="opt big${st.studied === true ? " on" : ""}" data-v="1">Ha, o’qiganman</button>
      <button type="button" class="opt big${st.studied === false ? " on" : ""}" data-v="0">Yo’q, endi boshlayman</button>
    </div>`;
  regBody.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    st.studied = b.dataset.v === "1";
    if (!st.studied) st.level = null;
    nextStep();
  });
}

function stepLevel() {
  const rows = [1, 2, 3, 4, 5].map(n => `<div class="rung"><span>${n}-daraja</span>
    ${["A", "B"].map(x => `<button type="button" class="lv" data-l="${n}${x}">${n}${x}</button>`).join("")}</div>`).join("");
  regBody.innerHTML = `<h2 id="regTitle">Qaysi darajagacha o’qigansiz?</h2>
    <p class="hint">Tugatgan oxirgi darajangizni belgilang.</p>
    <div class="ladder">${rows}</div>
    <button type="button" class="btn next" id="lvNext">Davom etish</button>`;
  const next = document.getElementById("lvNext");
  const paint = () => {
    const sel = LEVELS.indexOf(st.level);
    regBody.querySelectorAll(".lv").forEach(b => {
      const i = LEVELS.indexOf(b.dataset.l);
      b.classList.toggle("on", i === sel);
      b.classList.toggle("past", sel > -1 && i < sel);
      b.setAttribute("aria-pressed", i === sel);
    });
    next.disabled = sel < 0;
  };
  regBody.querySelectorAll(".lv").forEach(b => b.onclick = () => { st.level = b.dataset.l; paint(); });
  next.onclick = nextStep;
  paint();
}

function stepInfo() {
  regBody.innerHTML = `<h2 id="regTitle">Ma’lumotlaringiz</h2>
    <label>Ism<input id="fFirst" autocomplete="given-name"></label>
    <label>Familiya<input id="fLast" autocomplete="family-name"></label>
    <label>Telefon raqam<input id="fPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67"></label>
    <p class="err" id="fErr" role="alert"></p>
    <button type="button" class="btn next" id="infoNext">Keyingisi</button>`;
  const f = document.getElementById("fFirst"), s = document.getElementById("fLast"), p = document.getElementById("fPhone");
  f.value = st.first; s.value = st.last; p.value = st.phone;
  const err = document.getElementById("fErr");
  document.getElementById("infoNext").onclick = () => {
    const bad = (el, msg) => { err.textContent = msg; el.focus(); };
    if (f.value.trim().length < 2) return bad(f, "Ismingizni kiriting.");
    if (s.value.trim().length < 2) return bad(s, "Familiyangizni kiriting.");
    if (p.value.replace(/\D/g, "").length < 9) return bad(p, "Telefon raqamni to’liq kiriting.");
    st.first = f.value.trim(); st.last = s.value.trim(); st.phone = p.value.trim();
    nextStep();
  };
}

function chips(items, chosen, id) {
  return `<div class="chips" id="${id}">${items.map(x =>
    `<button type="button" class="chip" aria-pressed="${chosen.includes(x)}" data-v="${x}">${x}</button>`).join("")}</div>`;
}
function stepSchedule() {
  regBody.innerHTML = `<h2 id="regTitle">O’qish kunlari va vaqti</h2>
    <p class="hint">Sizga qulay kunlar guruhini tanlang. Vaqtdan bir nechtasini belgilash mumkin.</p>
    <h3>Kunlar</h3>${chips(CONFIG.days, st.days, "dayChips")}
    <h3>Vaqt</h3>${chips(CONFIG.times, st.times, "timeChips")}
    <p class="err" id="sErr" role="alert"></p>
    <button type="button" class="btn next" id="send">Yuborish</button>`;
  const wire = (id, arr) => document.getElementById(id).querySelectorAll(".chip").forEach(c => c.onclick = () => {
    const i = arr.indexOf(c.dataset.v);
    if (i > -1) arr.splice(i, 1); else arr.push(c.dataset.v);
    c.setAttribute("aria-pressed", i === -1);
  });
  wire("timeChips", st.times);
  document.querySelectorAll("#dayChips .chip").forEach(c => c.onclick = () => {
    st.days = [c.dataset.v];
    document.querySelectorAll("#dayChips .chip").forEach(x => x.setAttribute("aria-pressed", x === c));
  });
  document.getElementById("send").onclick = () => {
    if (!st.days.length) return void (document.getElementById("sErr").textContent = "Kunlar guruhini tanlang.");
    if (!st.times.length) return void (document.getElementById("sErr").textContent = "Kamida bitta vaqt tanlang.");
    nextStep();
  };
}

function stepDone() {
  const msg = buildMsg();
  const tg = /^[A-Za-z0-9_]{5,}$/.test(CONFIG.telegram) ? "https://t.me/" + CONFIG.telegram + "?text=" + encodeURIComponent(msg) : "";
  const tel = /\d{7,}/.test(CONFIG.phone) ? "tel:" + CONFIG.phone.replace(/[^\d+]/g, "") : "";
  regBody.innerHTML = `<h2 id="regTitle">Arizangiz tayyor</h2>
    <p class="hint">Quyidagi ma’lumot markazga yuboriladi.</p>
    <pre class="msg" id="msgBox"></pre>
    <div class="done-actions">
      ${tg ? `<a class="btn" href="${tg}" target="_blank" rel="noopener">Telegram orqali yuborish</a>` : ""}
      <button type="button" class="btn ghost next" id="copyBtn">Nusxalash</button>
      ${tel ? `<a class="btn ghost" href="${tel}">Markazga qo’ng’iroq qilish</a>` : ""}
      <button type="button" class="btn ghost next" id="doneClose">Yopish</button>
    </div>`;
  document.getElementById("msgBox").textContent = msg;
  const copy = document.getElementById("copyBtn");
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(msg); copy.textContent = "Nusxalandi"; }
    catch (e) { copy.textContent = "Matnni belgilab nusxalang"; }
  };
  document.getElementById("doneClose").onclick = closeReg;
}

syncReg();

/* Burger menyu */
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}));

/* Skroll paytida navbar soyasi */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 10), { passive: true });

/* Tushib turuvchi sakura gulbarglari */
if (!reduceMotion) {
  const petals = document.getElementById("petals");
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("span");
    const s = 8 + Math.random() * 7;
    p.className = "petal";
    p.style.width = s + "px";
    p.style.height = s * 1.4 + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 9 + Math.random() * 9 + "s";
    p.style.animationDelay = -Math.random() * 15 + "s";
    p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    petals.appendChild(p);
  }
}

/* Typed.js: yozilib chiqadigan matn */
if (window.Typed && !reduceMotion) {
  new Typed("#typed", {
    strings: ["안녕하세요!", "Koreys tilini biz bilan o’rganing", "TOPIK’ga ishonch bilan tayyorlaning"],
    typeSpeed: 55, backSpeed: 28, backDelay: 1600, loop: true
  });
}

/* AOS: skroll paytida kartalar paydo bo’lishi */
if (window.AOS && !reduceMotion) AOS.init({ duration: 800, once: true, offset: 80 });
else document.querySelectorAll("[data-aos]").forEach(el => el.removeAttribute("data-aos"));

/* GSAP: hero sarlavhasi va parallax */
if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero h1 .line", { y: 40, opacity: 0, duration: .9, stagger: .2, ease: "power3.out" });
}
