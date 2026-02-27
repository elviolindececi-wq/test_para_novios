// app.js — El Violín de Ceci (Repo nuevo)
// ✅ 9 preguntas (incluye q9_focus_moment)
// ✅ Intro emocional + nombre opcional
// ✅ Resultados personalizados con nombre
// ✅ Payload alineado a Google Sheet "Leads" (columnas exactas)
// ✅ UTMs + source
// ✅ venue_normalizado + dias_hasta_boda + lead_id + intensity_votes
// ✅ Webhook nuevo

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyIEcKAHlnfrI9Ktb8qwdbls3p6A1oeKnbDqY6wd5raOacyiaYV1GIV6PkzVNyeSWYQ/exec";
const WHATSAPP_BASE = "https://wa.me/595985689454";
const INSTAGRAM_URL = "https://www.instagram.com/elviolindececi/";

const $ = (sel) => document.querySelector(sel);

function show(id){
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.add("hidden");
    s.setAttribute("hidden", "hidden");
  });
  const el = document.querySelector(id);
  if (!el) return console.error("No existe screen:", id);
  el.classList.remove("hidden");
  el.removeAttribute("hidden");
  window.scrollTo({ top:0, behavior:"smooth" });
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function firstNameFrom(full){
  const s = (full || "").trim();
  if(!s) return "";
  return s.split(/\s+/)[0];
}

function safeUUID(){
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  // fallback simple (no perfecto, pero suficiente)
  return "lead_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function getUTMParams_(){
  const p = new URLSearchParams(window.location.search);
  const utm_source = p.get("utm_source") || "";
  const utm_medium = p.get("utm_medium") || "";
  const utm_campaign = p.get("utm_campaign") || "";
  const utm_content = p.get("utm_content") || "";
  const utm_term = p.get("utm_term") || "";
  const source = p.get("source") || p.get("src") || ""; // opcional
  return { source, utm_source, utm_medium, utm_campaign, utm_content, utm_term };
}

// ================================
// QUESTIONS (9)
// ================================
const questions = [
  {
    id: "q1",
    type: "options",
    title: "🖼 Si su boda fuera una escena de película, sería…",
    hint: "Elegí una opción para habilitar “Siguiente”.",
    options: [
      { key:"A", text:"Una entrada majestuosa en un salón elegante. Todo se siente impecable.", music:"M2" },
      { key:"B", text:"Ceremonia al aire libre con luz dorada y emoción genuina.", music:"M1" },
      { key:"C", text:"Un concepto inesperado, editorial, con diseño y detalles únicos.", music:"M3" },
      { key:"D", text:"Celebración vibrante: aplausos, risas y energía desde el inicio.", music:"M3" },
      { key:"E", text:"Momento íntimo: silencio, respiración contenida, lágrimas sinceras.", music:"M1" }
    ]
  },
  {
    id: "q2",
    type: "options",
    title: "📍 Elijan el espacio que más los representa:",
    hint: "Elegí una opción para habilitar “Siguiente”.",
    options: [
      { key:"A", text:"Hotel clásico o salón con arquitectura imponente.", music:"M2" },
      { key:"B", text:"Jardín / quinta / entorno natural.", music:"M1" },
      { key:"C", text:"Galería / industrial / lugar poco convencional.", music:"M3" },
      { key:"D", text:"Salón amplio pensado para una fiesta inolvidable.", music:"M3" },
      { key:"E", text:"Espacio pequeño con significado emocional.", music:"M1" }
    ]
  },
  {
    id: "q3",
    type: "options",
    title: "🧩 Hoy, la planificación de su boda se siente más como…",
    hint: "Elegí lo que más se parezca a cómo lo están viviendo (no hay respuestas “malas”).",
    options: [
      { key:"A", text:"Un tablero ordenado: todo va encajando.", label:"Tablero ordenado (todo va encajando)" },
      { key:"B", text:"Un moodboard en construcción: estamos inspirándonos.", label:"Moodboard en construcción (inspiración)" },
      { key:"C", text:"Una lista infinita: hay mucho por resolver.", label:"Lista infinita (mucho por resolver)" },
      { key:"D", text:"Una aventura: vamos paso a paso.", label:"Aventura paso a paso (relajados)" }
    ]
  },
  {
    id: "q4",
    type: "options",
    title: "🎶 Su entrada debería sentirse como…",
    hint: "Elegí una opción para habilitar “Siguiente”.",
    options: [
      { key:"A", text:"Solemne y elegante, perfectamente sincronizada.", music:"M2" },
      { key:"B", text:"Dulce y romántica, sin forzar nada.", music:"M1" },
      { key:"C", text:"Sorprendente: un giro inesperado que define el tono.", music:"M3" },
      { key:"D", text:"Energética: aplausos, emoción y celebración.", music:"M3" },
      { key:"E", text:"Personal e íntima, como si el mundo se apagara.", music:"M1" }
    ]
  },
  {
    id: "q5",
    type: "options",
    title: "🎻 ¿Qué rol debería tener la música en su boda?",
    hint: "Elegí una opción para habilitar “Siguiente”.",
    options: [
      { key:"A", text:"Acompañar con sofisticación y marcar momentos importantes.", music:"M2" },
      { key:"B", text:"Crear atmósfera romántica sin invadir.", music:"M1" },
      { key:"C", text:"Ser parte del concepto y sorprender.", music:"M3" },
      { key:"D", text:"Encender la energía y marcar ritmo de celebración.", music:"M3" },
      { key:"E", text:"Intensificar los momentos más emocionales.", music:"M1" }
    ]
  },
  {
    id: "q6",
    type: "slider",
    title: "📊 En su boda, la música para ustedes es…",
    hint: "Mové el control si querés ajustarlo. Esto nos ayuda a personalizar el resultado.",
    slider: { min: 0, max: 10, step: 1, defaultValue: 5 },
    labels: { left: "Acompaña", right: "Es protagonista" }
  },
  {
    id: "q7",
    type: "options",
    title: "🥂 ¿Cómo imaginan el cóctel?",
    hint: "Elegí una opción para habilitar “Siguiente”.",
    options: [
      { key:"A", text:"Instrumental elegante para conversación y ambiente.", music:"M2" },
      { key:"B", text:"Melodías suaves que fluyan naturalmente.", music:"M1" },
      { key:"C", text:"Intervenciones inesperadas (momentos ‘wow’ sutiles).", music:"M3" },
      { key:"D", text:"Algo animado que empiece a subir la energía.", music:"M3" },
      { key:"E", text:"Íntimo y cálido, música que invita a abrazos.", music:"M1" }
    ]
  },
  {
    id: "q8",
    type: "options",
    title: "🎼 Para elegir las canciones, ustedes prefieren…",
    hint: "Lo importante es que sea fácil para ustedes (y que suene increíble).",
    options: [
      { key:"A", text:"Que Ceci lo resuelva por nosotros (cero estrés).", label:"Que Ceci lo resuelva (cero estrés)" },
      { key:"B", text:"Mitad y mitad: Ceci propone + nosotros elegimos.", label:"Mitad y mitad (Ceci propone + ustedes eligen)" },
      { key:"C", text:"Queremos involucrarnos y elegir con detalle.", label:"Quieren involucrarse (detalle)" }
    ]
  },
  {
    id: "q9",
    type: "options",
    title: "🎯 ¿En qué momento quieren que el violín tenga más protagonismo?",
    hint: "Esto nos ayuda a aterrizar tu propuesta más rápido.",
    options: [
      { key:"CER", text:"En la ceremonia (entrada, votos, momentos clave).", label:"Ceremonia" },
      { key:"COC", text:"En el cóctel/recepción (atmósfera y energía).", label:"Cóctel/Recepción" },
      { key:"AMB", text:"En ambos (ceremonia + cóctel).", label:"Ambos" },
      { key:"GUIA", text:"No sé todavía — quiero que Ceci me guíe.", label:"Quieren guía" }
    ]
  }
];

// ================================
// ARCHETYPES & MODULES
// ================================
const archetypes = {
  A: { name: "💎 Clásicos Elegantes", tagline: "La excelencia es el lenguaje del amor.", brief: "Orden, armonía y estética impecable. La emoción es contenida, refinada y profundamente intencional.", full: "Ustedes valoran coherencia y dirección. No improvisan momentos: los diseñan. La música ideal marca entradas y transiciones con elegancia, sin exageración.", set: ["Violín + piano (ideal con baby grand piano shell)","Ceremonia: clásico/romántico refinado","Cóctel: instrumental elegante con pop reinterpretado"] },
  B: { name: "🌿 Románticos Naturales", tagline: "Si no se siente auténtico, no es para nosotros.", brief: "Calidez, luz suave y emoción genuina. Menos show, más verdad.", full: "Priorizan conexión por encima del impacto. La música acompaña y sostiene la atmósfera sin invadir: romántica, orgánica, íntima.", set: ["Violín + piano íntimo","Ceremonia: romántico suave","Cóctel: indie/pop delicado instrumental"] },
  C: { name: "🎨 Creativos Vanguardistas", tagline: "No queremos una boda. Queremos una experiencia.", brief: "Editorial, audaz y con identidad propia. Un concepto, no un formato.", full: "Piensan en narrativa y diseño. La música puede sorprender con arreglos únicos y giros inesperados, siempre con estética cuidada.", set: ["Violín protagonista + piano","Arreglos exclusivos","Momento ‘wow’ elegante (performance breve)"] },
  D: { name: "🎉 Sociales Festivos", tagline: "Queremos que todos recuerden esta noche.", brief: "Celebración, energía y momentos compartidos. La emoción es expansiva.", full: "Diseñan pensando en la vibra del invitado. La música marca el ritmo y puede subir energía con inteligencia: transiciones hacia una fiesta inolvidable.", set: ["Violín con presencia escénica","Hits instrumental en cóctel","Performance sorpresa para activar"] },
  E: { name: "🤍 Íntimos Emocionales", tagline: "No buscamos espectáculo. Buscamos significado.", brief: "Profundidad, historia y emoción silenciosa. Momentos que se quedan en la piel.", full: "Priorizan lo verdadero. La música ideal es puente emocional: acompaña votos, lecturas y momentos simbólicos con sensibilidad.", set: ["Violín + piano minimalista","Canciones personalizadas","Momentos íntimos dirigidos con sensibilidad"] }
};

const musicModules = {
  M1: { name:"Acompañamiento Sutil", brief:"Presente, pero nunca compite.", full:"Ideal para atmósfera romántica e íntima. Violín + piano con arreglos suaves y transiciones fluidas." },
  M2: { name:"Protagonismo Sofisticado", brief:"Marca momentos clave con intención.", full:"La música guía entradas y clímax emocionales con coherencia estética. Violín + piano con arreglos personalizados." },
  M3: { name:"Momento WOW", brief:"Sorpresa elegante y memorable.", full:"Intervenciones breves y estratégicas para generar reacción. Performance sorpresa con estética cuidada." }
};

// ================================
// SETLISTS + ADDONS (igual a tu versión, resumido aquí)
// ================================
const setlists = {
  A: { title: "Setlist recomendado — Clásicos Elegantes", moments: [
    { name: "Ceremonia (clásico refinado + emoción contenida)", songs: ["Canon in D — Pachelbel","Clair de Lune — Debussy","A Thousand Years — Christina Perri (instrumental)","Perfect — Ed Sheeran (instrumental)","All of Me — John Legend (instrumental)"]},
    { name: "Cóctel / Recepción (luxury lounge, conversación)", songs: ["La Vie En Rose — Édith Piaf (instrumental)","Fly Me to the Moon — Sinatra (instrumental)","At Last — Etta James (instrumental)","Can’t Help Falling in Love — Elvis (instrumental)"]},
    { name: "Momento especial (firma Ceci)", songs: ["Viva la Vida — Coldplay (instrumental elegante)","Yellow — Coldplay (instrumental)"]}
  ]},
  B: { title: "Setlist recomendado — Románticos Naturales", moments: [
    { name: "Ceremonia (orgánico, cálido, auténtico)", songs: ["Turning Page — Sleeping At Last (instrumental)","I Get to Love You — Ruelle (instrumental)","You Are the Reason — Calum Scott (instrumental)","Bloom — The Paper Kites (instrumental)"]},
    { name: "Cóctel / Recepción (indie-pop delicado)", songs: ["Ho Hey — The Lumineers (instrumental)","Riptide — Vance Joy (instrumental)","Somewhere Only We Know — Keane (instrumental)","Photograph — Ed Sheeran (instrumental)"]},
    { name: "Cierre emotivo", songs: ["A Sky Full of Stars — Coldplay (instrumental suave)"]}
  ]},
  C: { title: "Setlist recomendado — Creativos Vanguardistas", moments: [
    { name: "Ceremonia (editorial, conceptual)", songs: ["Experience — Ludovico Einaudi","Nuvole Bianche — Ludovico Einaudi","Time — Hans Zimmer","Young and Beautiful — Lana del Rey (instrumental)"]},
    { name: "Cóctel / Recepción (curado, cool)", songs: ["Midnight City — M83 (instrumental)","Blinding Lights — The Weeknd (instrumental, classy)","Levitating — Dua Lipa (instrumental)","Take Five — Dave Brubeck (vibe)"]},
    { name: "Momento WOW (intervención)", songs: ["Titanium — David Guetta (instrumental épico)","Viva la Vida — Coldplay (arreglo sorpresa)"]}
  ]},
  D: { title: "Setlist recomendado — Sociales Festivos", moments: [
    { name: "Ceremonia (emocionante con ritmo)", songs: ["Marry You — Bruno Mars (instrumental)","I’m Yours — Jason Mraz (instrumental)","Love on Top — Beyoncé (instrumental)"]},
    { name: "Cóctel / Recepción (subiendo energía)", songs: ["Uptown Funk — Bruno Mars (instrumental)","September — Earth, Wind & Fire (instrumental)","Happy — Pharrell Williams (instrumental)"]},
    { name: "Activación / transición a fiesta", songs: ["Don’t Stop Me Now — Queen (instrumental)","Titanium — instrumental épico"]}
  ]},
  E: { title: "Setlist recomendado — Íntimos Emocionales", moments: [
    { name: "Ceremonia (minimalismo emocional)", songs: ["River Flows in You — Yiruma","Kiss the Rain — Yiruma","Comptine d’un autre été — Yann Tiersen","Clair de Lune — Debussy"]},
    { name: "Cóctel / Recepción (cálido y cercano)", songs: ["Make You Feel My Love — Adele (instrumental)","Hallelujah — instrumental","Stand By Me — instrumental suave"]},
    { name: "Momento simbólico", songs: ["A Thousand Years — instrumental (íntimo)"]}
  ]}
};

const intensityAddOns = {
  M1: { title: "Ajuste por intensidad (M1 — Acompañamiento sutil)", note: "Arreglos suaves, tempos moderados y prioridad a atmósfera. Menos cambios bruscos.", add: ["Clair de Lune — Debussy","Kiss the Rain — Yiruma","Turning Page — Sleeping At Last (instrumental)"] },
  M2: { title: "Ajuste por intensidad (M2 — Protagonismo sofisticado)", note: "Sumar piezas “ancla” para entradas y transiciones. Arreglos marcados y coordinación con timing.", add: ["Canon in D — Pachelbel","La Vie En Rose — instrumental","Viva la Vida — Coldplay (instrumental elegante)"] },
  M3: { title: "Ajuste por intensidad (M3 — Momento WOW)", note: "Agregar 1–2 intervenciones sorpresa cortas (60–90s) que generen reacción sin perder estética.", add: ["Titanium — instrumental épico","Blinding Lights — instrumental classy","Uptown Funk — instrumental (mini show)"] }
};

// ================================
// HELPERS (priority, venue, dates)
// ================================
function daysUntil(dateStr){
  if(!dateStr) return "";
  const [y,m,d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return "";
  const target = new Date(Date.UTC(y, m-1, d, 12, 0, 0));
  const now = new Date();
  const nowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  return String(Math.ceil((target.getTime() - nowUTC.getTime()) / (1000*60*60*24)));
}

function normalizeVenue(s){
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function computePriority(lead, intensity){
  let points = 0;

  if (intensity === "M1") points += 1;
  if (intensity === "M2") points += 2;
  if (intensity === "M3") points += 3;

  if (lead.invitados === "80 – 150") points += 1;
  if (lead.invitados === "150 – 250") points += 2;
  if (lead.invitados === "Más de 250") points += 3;

  const VENUE_POINTS = {
    "la riviere": 2,"es vedra": 2,"las takuaras": 2,"castillo remanso": 2,"casa puente": 2,"castillo": 2,"puerto liebig": 2,
    "talleryrand": 2,"talleryrand costanera": 2,"villa maria": 2,"casa corbellani": 2,"casita quinta": 2,
    "villa jardin": 1,"royal": 1,"royal eventos": 1,"soir": 1,"soir eventos": 1,"vista verde": 1,"la isabella": 1,
    "casa 1927": 1,"la glorieta": 1,"mantra salon boutique": 1,
    "rusticana": 0,"rusticana eventos": 0,"isabella": 0,"tiam eventos": 0,"mantra": 0
  };

  const v = normalizeVenue(lead.venue);
  if (!v || v.includes("otro")) points += 0;
  else points += (VENUE_POINTS[v] ?? 0);

  const days = Number(daysUntil(lead.fecha_boda));
  if (Number.isFinite(days)){
    if (days <= 90) points += 3;
    else if (days <= 180) points += 2;
    else if (days <= 365) points += 1;
  }

  const mi = Number(lead.q6_music_importance);
  if (Number.isFinite(mi)) {
    if (mi >= 8) points += 2;
    else if (mi >= 5) points += 1;
  }

  let prioridad = "C";
  if (points >= 8) prioridad = "A";
  else if (points >= 5) prioridad = "B";

  return { prioridad, points };
}

function getDesignIndex(prioridad){
  if (prioridad === "A") return 92;
  if (prioridad === "B") return 86;
  return 78;
}

function investmentBlock(intensity){
  if (intensity === "M1") return "Las parejas con su perfil priorizan sensibilidad, coherencia y una personalización moderada.";
  if (intensity === "M2") return "Las parejas con su perfil invierten estratégicamente en arreglos personalizados y coordinación musical.";
  return "Las parejas con su perfil suelen priorizar momentos sorpresa, arreglos exclusivos y elementos diferenciales.";
}

// ================================
// STATE
// ================================
let lead = {};
let currentQ = 0;
let answers = Array(questions.length).fill(null);          // respuestas crudas por pregunta
let intensityAnswers = Array(questions.length).fill(null); // votos M1/M2/M3 por pregunta (donde aplica)
let sending = false;
let locked = false;

let introName = "";

let q3_planning_label = "";
let q8_curation_label = "";
let q9_focus_label = "";

let musicImportance = questions.find(q => q.type === "slider")?.slider?.defaultValue ?? 5;

const tracking = getUTMParams_();
const lead_id = safeUUID();

// ================================
// ELEMENTS
// ================================
const btnStart = $("#btn-start");

const quizBar = $("#quiz-bar");
const qTitle = $("#q-title");
const qCount = $("#q-count");
const qHint = $("#q-hint");
const qOptions = $("#q-options");
const quizGreeting = $("#quiz-greeting");
const btnPrev = $("#btn-prev");
const btnNext = $("#btn-next");

const leadForm = $("#lead-form");
const btnBackToQuiz = $("#btn-back-to-quiz");
const btnShowResults = $("#btn-show-results");

const resultTitle = $("#result-title");
const resultSubtitle = $("#result-subtitle");
const resultBrief = $("#result-brief");
const resultDetails = $("#result-details");
const btnToggleDetails = $("#btn-toggle-details");
const btnRetry = $("#btn-retry");
const btnWA = $("#btn-wa");
const btnIG = $("#btn-ig");

// ================================
// EVENTS
// ================================
btnStart?.addEventListener("click", () => {
  lead = {};
  currentQ = 0;
  answers = Array(questions.length).fill(null);
  intensityAnswers = Array(questions.length).fill(null);
  sending = false;
  locked = false;

  q3_planning_label = "";
  q8_curation_label = "";
  q9_focus_label = "";

  musicImportance = questions.find(q => q.type === "slider")?.slider?.defaultValue ?? 5;

  introName = $("#nombre_intro")?.value?.trim() || "";

  const dateEl = $("#fecha_boda");
  if (dateEl) dateEl.min = new Date().toISOString().slice(0,10);

  renderQuestion();
  show("#screen-quiz");
});

btnPrev?.addEventListener("click", () => {
  if (locked) return;
  if (currentQ <= 0) return;
  currentQ--;
  renderQuestion();
});

btnNext?.addEventListener("click", () => {
  if (locked) return;

  const q = questions[currentQ];
  const isAnswered = q.type === "slider" ? true : !!answers[currentQ];
  if (!isAnswered) return;

  const isLast = currentQ === questions.length - 1;
  if (!isLast){
    currentQ++;
    renderQuestion();
    return;
  }

  // Prefill nombre si se dio al inicio
  const nameEl = $("#nombre");
  if (nameEl && introName && !String(nameEl.value || "").trim()){
    nameEl.value = introName;
  }

  show("#screen-lead");
});

btnBackToQuiz?.addEventListener("click", () => {
  renderQuestion();
  show("#screen-quiz");
});

leadForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = $("#nombre")?.value?.trim() || "";
  const telefono = $("#telefono")?.value?.trim() || "";
  const email = $("#email")?.value?.trim() || "";
  const fecha_boda = $("#fecha_boda")?.value || "";
  const venue = $("#venue")?.value?.trim() || "";
  const invitados = $("#invitados")?.value || "";

  if(!nombre || !telefono || !fecha_boda || !venue || !invitados){
    alert("Por favor completá todos los campos obligatorios.");
    return;
  }

  lead = { nombre, telefono, email, fecha_boda, venue, invitados };

  locked = true;
  if (btnShowResults){
    btnShowResults.disabled = true;
    btnShowResults.textContent = "Generando…";
  }

  const computed = computeArchetype(answers);

  const intensityPack = computeIntensityPack(intensityAnswers, lead, answers);
  const intensity = intensityPack.intensity;
  const intensity_votes = intensityPack.votesStr;

  const payloadBase = buildSheetPayloadBase(lead, answers, intensity_votes);
  const pr = computePriority(payloadBase, intensity);
  const indice = getDesignIndex(pr.prioridad);

  const payload = buildFinalPayload(payloadBase, computed, intensity, pr, indice);

  renderResult(payload, computed, intensity, pr.prioridad, indice);
  show("#screen-result");

  if (!sending){
    sending = true;
    try{
      await enviarLeadASheets(payload);
    } catch(err){
      console.error("Error guardando lead:", err);
      alert("Tus resultados están listos ✅ pero hubo un problema guardando tus datos. Escribinos por WhatsApp y lo resolvemos rápido 🙌");
    } finally{
      sending = false;
    }
  }

  locked = false;
  if (btnShowResults){
    btnShowResults.disabled = false;
    btnShowResults.textContent = "Ver mis resultados";
  }
});

btnToggleDetails?.addEventListener("click", () => {
  const willShow = resultDetails.classList.contains("hidden") || resultDetails.hidden === true;
  resultDetails.hidden = !willShow;
  resultDetails.classList.toggle("hidden", !willShow);
  btnToggleDetails.textContent = willShow ? "Ocultar análisis completo" : "Ver análisis completo";
});

btnRetry?.addEventListener("click", () => {
  lead = {};
  currentQ = 0;
  answers = Array(questions.length).fill(null);
  intensityAnswers = Array(questions.length).fill(null);
  sending = false;
  locked = false;

  q3_planning_label = "";
  q8_curation_label = "";
  q9_focus_label = "";

  musicImportance = questions.find(q => q.type === "slider")?.slider?.defaultValue ?? 5;

  introName = "";
  const introEl = $("#nombre_intro");
  if (introEl) introEl.value = "";

  leadForm.reset();
  resultDetails.hidden = true;
  resultDetails.classList.add("hidden");
  btnToggleDetails.textContent = "Ver análisis completo";

  show("#screen-intro");
});

if (btnIG) btnIG.setAttribute("href", INSTAGRAM_URL);

// ================================
// RENDER QUESTION
// ================================
function setNextLabelAndHint(){
  const isLast = currentQ === questions.length - 1;
  btnNext.textContent = isLast ? "Quiero ver mis resultados" : "Siguiente";

  const q = questions[currentQ];
  qHint.textContent = q?.hint || (isLast
    ? "Elegí una opción y tocá “Quiero ver mis resultados”."
    : "Elegí una opción para habilitar “Siguiente”.");
}

function renderQuestion(){
  const q = questions[currentQ];

  if (quizGreeting){
    const fn = firstNameFrom(introName);
    quizGreeting.textContent = fn
      ? `Vamos juntos, ${fn} ✨ Elegí lo que más los represente.`
      : `Vamos juntos ✨ Elegí lo que más los represente.`;
  }

  const parts = q.title.split(" ");
  const icon = parts.shift() || "";
  const rest = parts.join(" ");

  qTitle.innerHTML =
    `<span class="q-icon-badge" aria-hidden="true">${escapeHtml(icon)}</span>` +
    `<span class="q-title-text">${escapeHtml(rest)}</span>`;

  qCount.textContent = `${currentQ + 1} de ${questions.length}`;
  const quizProgress = Math.round(((currentQ + 1) / questions.length) * 90);
  quizBar.style.width = `${quizProgress}%`;

  qOptions.innerHTML = "";
  btnPrev.disabled = currentQ === 0;

  setNextLabelAndHint();

  if (q.type === "slider"){
    btnNext.disabled = false;

    const wrap = document.createElement("div");
    wrap.className = "slider-wrap";

    const top = document.createElement("div");
    top.className = "slider-top";

    const val = document.createElement("div");
    val.className = "slider-value";
    val.textContent = String(musicImportance);

    const range = document.createElement("input");
    range.type = "range";
    range.className = "slider";
    range.min = String(q.slider.min);
    range.max = String(q.slider.max);
    range.step = String(q.slider.step);
    range.value = String(musicImportance);

    range.addEventListener("input", () => {
      musicImportance = Number(range.value);
      val.textContent = String(musicImportance);
    });

    top.appendChild(document.createTextNode("Nivel: "));
    top.appendChild(val);

    const bottom = document.createElement("div");
    bottom.className = "slider-labels";
    bottom.innerHTML = `<span>${escapeHtml(q.labels.left)}</span><span>${escapeHtml(q.labels.right)}</span>`;

    wrap.appendChild(top);
    wrap.appendChild(range);
    wrap.appendChild(bottom);

    qOptions.appendChild(wrap);
    return;
  }

  btnNext.disabled = !answers[currentQ];

  q.options.forEach((opt) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (answers[currentQ] === opt.key ? " selected" : "");
    b.innerHTML = `<span class="k">${escapeHtml(opt.key)}</span>${escapeHtml(opt.text)}`;

    b.addEventListener("click", () => {
      answers[currentQ] = opt.key;
      intensityAnswers[currentQ] = opt.music || null;

      if (q.id === "q3") q3_planning_label = opt.label || "";
      if (q.id === "q8") q8_curation_label = opt.label || "";
      if (q.id === "q9") q9_focus_label = opt.label || "";

      qOptions.querySelectorAll(".opt").forEach(el => el.classList.remove("selected"));
      b.classList.add("selected");

      btnNext.disabled = false;
    });

    qOptions.appendChild(b);
  });
}

// ================================
// COMPUTE ARCHETYPE (solo q1,q2,q4,q5,q7)
// ================================
function computeArchetype(ans){
  const scores = {A:0, B:0, C:0, D:0, E:0};
  const includeIdx = [0, 1, 3, 4, 6];
  includeIdx.forEach(i => {
    const a = ans[i];
    if (a && scores[a] !== undefined) scores[a]++;
  });

  const entries = Object.entries(scores);
  const max = Math.max(...entries.map(([,v]) => v));
  let tied = entries.filter(([,v]) => v === max).map(([k]) => k);

  if (tied.length > 1){
    for (let i = includeIdx.length - 1; i >= 0; i--){
      const idx = includeIdx[i];
      if (tied.includes(ans[idx])) { tied = [ans[idx]]; break; }
    }
  }
  const primary = tied[0] || "B";

  const remaining = entries.filter(([k]) => k !== primary).sort((a,b)=>b[1]-a[1]);
  const secMax = remaining[0][1];
  let secTied = remaining.filter(([,v]) => v === secMax).map(([k]) => k);

  if (secTied.length > 1){
    for (let i = includeIdx.length - 1; i >= 0; i--){
      const idx = includeIdx[i];
      if (secTied.includes(ans[idx])) { secTied = [ans[idx]]; break; }
    }
  }
  return { scores, primary, secondary: secTied[0] || "A" };
}

// ================================
// INTENSITY PACK (devuelve intensidad + votes)
// ================================
function computeIntensityPack(intensityArr, lead, answers){
  const counts = {M1:0, M2:0, M3:0};
  intensityArr.forEach(x => { if(x && counts[x] !== undefined) counts[x]++; });

  // Ajustes por invitados
  if (lead.invitados === "150 – 250") counts.M2 += 1;
  if (lead.invitados === "Más de 250") counts.M3 += 2;
  if (lead.invitados === "Menos de 80") counts.M1 += 1;

  // Ajustes por venue texto
  const v = normalizeVenue(lead.venue);
  if (v.includes("hotel")) counts.M2 += 1;
  if (v.includes("salon")) counts.M2 += 1;
  if (v.includes("quinta") || v.includes("estancia")) counts.M2 += 1;
  if (v.includes("playa") || v.includes("destino")) counts.M3 += 1;
  if (v.includes("iglesia") || v.includes("capilla")) counts.M1 += 1;

  // Ajuste por slider (importancia música)
  const mi = Number(musicImportance);
  if (Number.isFinite(mi)) {
    if (mi >= 9) counts.M3 += 2;
    else if (mi >= 8) counts.M3 += 1;
    else if (mi <= 3) counts.M1 += 1;
  }

  // Ajuste por q9 (momento principal)
  const q9 = answers[8]; // CER/COC/AMB/GUIA
  if (q9 === "COC") counts.M3 += 1;
  if (q9 === "AMB") counts.M2 += 1;
  if (q9 === "CER") counts.M2 += 1;

  const entries = Object.entries(counts);
  const max = Math.max(...entries.map(([,v]) => v));
  let tied = entries.filter(([,v]) => v === max).map(([k]) => k);

  // desempate: último voto explícito en intensidadArr
  if (tied.length > 1){
    for (let i = intensityArr.length - 1; i >= 0; i--){
      const val = intensityArr[i];
      if (val && tied.includes(val)) { tied = [val]; break; }
    }
  }

  const intensity = tied[0] || "M2";
  const votesStr = `M1:${counts.M1},M2:${counts.M2},M3:${counts.M3}`;

  return { intensity, votesStr, counts };
}

// ================================
// PAYLOAD (alineado a tu Sheet)
// ================================
function buildSheetPayloadBase(lead, answers, intensity_votes){
  const q = (i) => answers[i] || "";

  const venue_normalizado = normalizeVenue(lead.venue);
  const dias_hasta_boda = daysUntil(lead.fecha_boda);

  return {
    // tracking
    lead_id,
    source: tracking.source,
    utm_source: tracking.utm_source,
    utm_medium: tracking.utm_medium,
    utm_campaign: tracking.utm_campaign,
    utm_content: tracking.utm_content,
    utm_term: tracking.utm_term,

    // lead
    nombre: lead.nombre,
    telefono: lead.telefono,
    email: lead.email || "",

    // evento
    fecha_boda: lead.fecha_boda,
    dias_hasta_boda,
    venue: lead.venue,
    venue_normalizado,
    invitados: lead.invitados,

    // respuestas (con nombres de columnas del Sheet)
    q1_escena: q(0),
    q2_espacio: q(1),

    q3_planning_vibe: q(2),
    q3_planning_label: q3_planning_label || "",

    q4_entrada: q(3),
    q5_rol_musica: q(4),

    q6_music_importance: String(musicImportance),

    q7_coctel: q(6),

    q8_curation_style: q(7),
    q8_curation_label: q8_curation_label || "",

    q9_focus_moment: q(8),
    q9_focus_label: q9_focus_label || "",

    // debug
    intensity_votes,

    // pipeline defaults
    estado: "Nuevo",
    fecha_contacto: "",
    notas: ""
  };
}

function buildFinalPayload(base, computed, intensity, pr, indice){
  return {
    ...base,

    arquetipo_primary: archetypes[computed.primary].name,
    arquetipo_secondary: archetypes[computed.secondary].name,
    intensidad_musical: intensity,

    prioridad: pr.prioridad,
    prioridad_points: pr.points,
    indice_diseno: indice
  };
}

async function enviarLeadASheets(payload){
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text;
}

// ================================
// SETLIST HELPERS
// ================================
function getSetlistTeasers_(primaryKey, intensity, max = 2){
  const sl = setlists[primaryKey];
  const addOn = intensityAddOns[intensity];
  const picks = [];
  if (sl?.moments?.[0]?.songs?.[0]) picks.push(sl.moments[0].songs[0]);
  if (picks.length < max && addOn?.add?.[0]) picks.push(addOn.add[0]);
  else if (picks.length < max && sl?.moments?.[1]?.songs?.[0]) picks.push(sl.moments[1].songs[0]);
  return picks.slice(0, max);
}

function renderSetlistHTML_(primaryKey, intensity){
  const sl = setlists[primaryKey];
  const addOn = intensityAddOns[intensity];
  if (!sl) return `<p class="muted">No encontramos setlist para este perfil.</p>`;

  const momentsHtml = sl.moments.map(m => {
    const items = m.songs.map(s => `<li>${escapeHtml(s)}</li>`).join("");
    return `
      <div class="result-box" style="margin-top:12px;">
        <h4>${escapeHtml(m.name)}</h4>
        <ul>${items}</ul>
      </div>
    `;
  }).join("");

  const addOnHtml = addOn ? `
    <div class="gold-card" style="margin-top:14px;">
      <div class="gold-title">${escapeHtml(addOn.title)}</div>
      <div class="gold-text">${escapeHtml(addOn.note)}</div>
      <hr/>
      <h4 style="margin:0 0 8px;">+3 temas sugeridos para tu intensidad</h4>
      <ul>${addOn.add.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  ` : "";

  return `
    <p class="muted">${escapeHtml(sl.title)}</p>
    ${momentsHtml}
    ${addOnHtml}
    <p class="fineprint">*El setlist es una guía. Se ajusta a timing real y canciones significativas de la pareja.</p>
  `;
}

// ================================
// RESULT RENDER
// ================================
function renderResult(payload, computed, intensity, prioridad, indice){
  const a1 = archetypes[computed.primary];
  const a2 = archetypes[computed.secondary];
  const m = musicModules[intensity];
  const teasers = getSetlistTeasers_(computed.primary, intensity, 2);

  const nameForUI = firstNameFrom(payload.nombre) || firstNameFrom(introName);
  const hello = nameForUI ? `Gracias, ${nameForUI} 💛` : `Gracias 💛`;

  const planningText = payload.q3_planning_label ? ` · 🧩 Planificación: ${payload.q3_planning_label}` : "";
  const curationText = payload.q8_curation_label ? ` · 🎼 Selección: ${payload.q8_curation_label}` : "";
  const focusText = payload.q9_focus_label ? ` · 🎯 Protagonismo: ${payload.q9_focus_label}` : "";

  resultTitle.textContent = nameForUI ? `${hello} — tu resultado` : `Tu resultado`;
  resultSubtitle.textContent =
    `Intensidad musical: ${m.name} · Importancia música: ${payload.q6_music_importance}/10 · Prioridad interna: ${prioridad}`;

  resultBrief.innerHTML = `
    <p class="muted" style="margin:0 0 10px 0;">
      ${escapeHtml(hello)} Este perfil está pensado para que su música “cuente” lo que viven.
    </p>

    <h3>${escapeHtml(a1.tagline)}</h3>
    <p>${escapeHtml(a1.brief)}</p>

    <p class="muted" style="margin-top:8px;">
      📍 Lugar: ${escapeHtml(payload.venue || "—")} · 👥 Invitados: ${escapeHtml(payload.invitados || "—")}
      ${planningText}${curationText}${focusText}
    </p>

    <hr/>
    <h3>🎻 Estilo musical: ${escapeHtml(m.name)}</h3>
    <p>${escapeHtml(m.brief)}</p>

    <hr/>
    <h3>🎵 Teaser de setlist (ideal para ustedes)</h3>
    <ul>${teasers.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    <p class="muted" style="margin-top:10px;">En el análisis completo está el setlist por momentos (ceremonia, cóctel y wow).</p>
  `;

  const gold = `
    <div class="gold-card">
      <div class="gold-title">Índice de Diseño Emocional</div>
      <div class="gold-percentage">${indice}%</div>
      <div class="gold-text">
        Su perfil muestra una fuerte orientación hacia experiencias musicales diseñadas con intención.
        <br><br>
        Las parejas con este nivel de afinidad suelen planificar con anticipación para garantizar coherencia estética y disponibilidad.
        <br><br>
        <strong>Recomendamos agendar con tiempo.</strong>
      </div>
    </div>
  `;

  const curationBlock = payload.q8_curation_label ? `
    <hr/>
    <h3>🎼 Cómo les conviene elegir las canciones</h3>
    <p>${
      payload.q8_curation_label.includes("cero estrés")
        ? "Les conviene un set completo propuesto por Ceci para aprobar en un solo paso: rápido, hermoso y sin carga mental."
        : payload.q8_curation_label.includes("Mitad")
          ? "Les conviene un proceso mixto: Ceci propone 2–3 opciones por momento y ustedes eligen sin perder tiempo."
          : "Les conviene una selección más curada: Ceci guía el criterio y ustedes eligen con detalle para que todo sea 100% ustedes."
    }</p>
  ` : "";

  resultDetails.innerHTML = `
    <h3>🔎 Lo que esto dice sobre ustedes</h3>
    <p>${escapeHtml(a1.full)}</p>

    <hr/>

    <h3>✨ Matiz secundario</h3>
    <p><strong>${escapeHtml(a2.name)}</strong> — ${escapeHtml(a2.tagline)}</p>

    <hr/>

    <h3>🎶 Cómo debería vivirse su música</h3>
    <p>${escapeHtml(m.full)}</p>

    ${gold}

    <hr/>

    <h3>💎 Perfil de inversión</h3>
    <p>${escapeHtml(investmentBlock(intensity))}</p>

    ${curationBlock}

    <hr/>

    <h3>🎼 Set recomendado (formato)</h3>
    <ul>${a1.set.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

    <hr/>

    <h3>🎵 Setlist sugerido (canciones ideales)</h3>
    ${renderSetlistHTML_(computed.primary, intensity)}
  `;

  resultDetails.hidden = true;
  resultDetails.classList.add("hidden");
  btnToggleDetails.textContent = "Ver análisis completo";

  const text =
    `Hola Ceci! ${nameForUI ? "Soy " + nameForUI + " y " : ""}hicimos el test y nos salió: ${a1.name} (secundario: ${a2.name}). ` +
    `Intensidad: ${m.name}. Importancia música: ${payload.q6_music_importance}/10. ` +
    `Momento principal: ${payload.q9_focus_label || "-"} · Invitados: ${payload.invitados || "-"} · Lugar: ${payload.venue || "-"}. ` +
    `${payload.q3_planning_label ? "Planificación: " + payload.q3_planning_label + ". " : ""}` +
    `${payload.q8_curation_label ? "Selección: " + payload.q8_curation_label + ". " : ""}` +
    `Prioridad interna: ${prioridad}. Queremos una propuesta personalizada 🙌`;

  btnWA.setAttribute("href", `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`);
}

// ================================
// INIT
// ================================
show("#screen-intro");
console.log("✅ app.js (repo nuevo) cargado OK", { tracking, lead_id });
