import { useState, useEffect, useCallback, useMemo } from "react";

const TIERS = ["Ícono", "Super Premium", "Premium", "Gran Reserva", "Reserva", "Reserva Privada", "Varietal"];
const CAVAS = ["Cava 1", "Cava 2"];
const PRODUCCIONES = ["Ultra limitado", "Limitado", "Moderado", "Amplio"];
const CEPAS = [
  "Cabernet Sauvignon", "Carmenere", "Merlot", "Syrah", "Pinot Noir", "Malbec",
  "Cabernet Franc", "Petit Verdot", "Tempranillo", "Sangiovese", "Nebbiolo",
  "Garnacha", "Petite Sirah", "Pinotage", "Carignan",
  "Chardonnay", "Sauvignon Blanc", "Riesling", "Viognier", "Gewürztraminer",
  "Pinot Grigio", "Blend Tinto", "Blend Blanco", "Rosé", "Espumante", "Otro"
];
const PAISES = ["Chile", "Argentina", "Francia", "Italia", "España", "Australia", "USA", "Sudáfrica", "Nueva Zelanda", "Alemania", "Portugal", "Otro"];

const VINTAGE_QUALITY = {
  Chile: { 2022: 95, 2018: 95, 2019: 90, 2021: 91, 2020: 85, 2017: 78, 2016: 82, 2015: 88 },
  "Sudáfrica": { 2022: 88, 2021: 87, 2020: 86, 2019: 89, 2018: 90, 2017: 85 },
  Argentina: { 2022: 90, 2021: 88, 2020: 89, 2019: 92, 2018: 91, 2017: 93 },
  Francia: { 2022: 88, 2021: 86, 2020: 92, 2019: 90, 2018: 93, 2017: 85 },
  Italia: { 2022: 90, 2021: 88, 2020: 89, 2019: 93, 2018: 87, 2017: 85 },
  España: { 2022: 88, 2021: 87, 2020: 89, 2019: 91, 2018: 92, 2017: 90 },
};

const TIER_SCORES = { "Ícono": 100, "Super Premium": 82, "Premium": 65, "Gran Reserva": 48, "Reserva": 30, "Reserva Privada": 38, "Varietal": 15 };
const PROD_SCORES = { "Ultra limitado": 100, "Limitado": 72, "Moderado": 42, "Amplio": 12 };

function computeScore(w) {
  const cn = w.puntajeCriticos ? Math.min(100, Math.max(0, (w.puntajeCriticos - 85) / 12 * 100)) : 30;
  const ts = TIER_SCORES[w.tier] || 40;
  const ps = PROD_SCORES[w.produccion] || 40;
  const vs = (VINTAGE_QUALITY[w.pais] || {})[w.ano] ?? 85;
  const gy = w.fechaOptima ? Math.max(0, new Date(w.fechaOptima).getFullYear() - new Date().getFullYear()) : 3;
  return (cn * 0.30) + (ts * 0.25) + (ps * 0.20) + (vs * 0.15) + (Math.min(100, gy * 10) * 0.10);
}

function rankWines(wines) {
  const s = wines.map(w => ({ ...w, _score: computeScore(w) }));
  s.sort((a, b) => b._score - a._score);
  return s.map((w, i) => ({ ...w, ranking: i + 1 }));
}

const OCCASIONS = [
  { id: "formal", label: "Cena Formal", icon: "🎩", desc: "Para impresionar", filter: w => w.ranking <= 5 },
  { id: "asado", label: "Asado / BBQ", icon: "🔥", desc: "Parrilla y amigos", filter: w => w.maridaje && /asado|parrilla|costill|bbq|carne|res /i.test(w.maridaje) },
  { id: "romantica", label: "Cena Romántica", icon: "❤️", desc: "Algo especial", filter: w => w.ranking <= 7 && (TIER_SCORES[w.tier] || 0) >= 65 },
  { id: "regalo", label: "Para Regalar", icon: "🎁", desc: "Etiqueta top", filter: w => ["Ícono", "Super Premium"].includes(w.tier) },
  { id: "guardar", label: "Para Guardar", icon: "🏺", desc: "Olvidar en la cava", filter: w => { const y = w.fechaOptima ? new Date(w.fechaOptima).getFullYear() : 0; return y >= new Date().getFullYear() + 3; } },
  { id: "hoy", label: "Para Tomar Hoy", icon: "🥂", desc: "Ya en su punto", filter: w => { if (!w.fechaOptima) return true; return new Date(w.fechaOptima) <= new Date(); } },
  { id: "carnesrojas", label: "Carnes Rojas", icon: "🥩", desc: "Filete, cordero", filter: w => w.maridaje && /carne|filete|cordero|lomo|res|rib|costill|entrecot/i.test(w.maridaje) },
  { id: "pastas", label: "Pastas / Guisos", icon: "🍝", desc: "Ragú, estofados", filter: w => w.maridaje && /pasta|ragú|guiso|estofad|cazuela|risotto/i.test(w.maridaje) },
  { id: "quesos", label: "Quesos", icon: "🧀", desc: "Tabla de quesos", filter: w => w.maridaje && /queso/i.test(w.maridaje) },
  { id: "aves", label: "Aves / Cerdo", icon: "🍗", desc: "Pollo, pato, cerdo", filter: w => w.maridaje && /pollo|pato|cerdo|ave/i.test(w.maridaje) },
];

const INITIAL_WINES = [
  { id: "w01", nombre: 'Maquis "Franco"', cepa: "Cabernet Franc", ano: 2019, vina: "Viña Maquis", valle: "Valle de Colchagua", pais: "Chile", tier: "Ícono", cava: "Cava 1", fechaOptima: "2039-01-01", maridaje: "Cordero, caza mayor, quesos añejos", puntajeCriticos: 97, fuenteCriticos: "Tim Atkin", produccion: "Ultra limitado" },
  { id: "w02", nombre: "Montes Alpha Ed. Limitada 30 Años", cepa: "Cabernet Sauvignon", ano: 2018, vina: "Viña Montes", valle: "Valle de Colchagua (Apalta)", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2033-01-01", maridaje: "Filete, entrecot, quesos duros añejos", puntajeCriticos: 93, fuenteCriticos: "Wine Enthusiast", produccion: "Ultra limitado" },
  { id: "w03", nombre: 'Santa Ema "Catalina"', cepa: "Blend Tinto", ano: 2017, vina: "Viña Santa Ema", valle: "Maipo Alto (Pirque)", pais: "Chile", tier: "Ícono", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Lomo de res, cordero al horno, risotto de hongos", puntajeCriticos: 95, fuenteCriticos: "Descorchados", produccion: "Moderado" },
  { id: "w04", nombre: 'Santa Rita "Bougainville" Petite Sirah', cepa: "Petite Sirah", ano: 2022, vina: "Viña Santa Rita", valle: "Maipo Alto (Alto Jahuel)", pais: "Chile", tier: "Ícono", cava: "Cava 1", fechaOptima: "2037-01-01", maridaje: "Estofado de res, costillas BBQ, queso azul", puntajeCriticos: 92, fuenteCriticos: "Promedio histórico", produccion: "Ultra limitado" },
  { id: "w05", nombre: 'VIK "Milla Cala"', cepa: "Blend Tinto", ano: 2021, vina: "Viña VIK", valle: "Millahue, Valle de Cachapoal", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2035-01-01", maridaje: "Carnes rojas, estofados, quesos semiduros", puntajeCriticos: 95, fuenteCriticos: "James Suckling", produccion: "Limitado" },
  { id: "w06", nombre: 'Tarapacá "Gran Reserva Etiqueta Azul"', cepa: "Blend Tinto", ano: 2021, vina: "Viña Tarapacá", valle: "Valle del Maipo (Isla de Maipo)", pais: "Chile", tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "2032-01-01", maridaje: "Asado, costillar, carnes a la parrilla", puntajeCriticos: 95, fuenteCriticos: "Descorchados", produccion: "Limitado" },
  { id: "w07", nombre: 'Concha y Toro "Terrunyo" Carmenère', cepa: "Carmenere", ano: 2021, vina: "Viña Concha y Toro", valle: "Valle de Cachapoal (Peumo)", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Cerdo glaseado, pato, pastas con ragú", puntajeCriticos: 95, fuenteCriticos: "Descorchados", produccion: "Limitado" },
  { id: "w08", nombre: 'Valdivieso "Caballo Loco Grand Cru"', cepa: "Blend Tinto", ano: 2020, vina: "Viña Valdivieso", valle: "Maipo Alto", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2032-01-01", maridaje: "Ciervo, jabalí, carnes de caza", puntajeCriticos: 93, fuenteCriticos: "Wine Enthusiast (est.)", produccion: "Limitado" },
  { id: "w09", nombre: 'Undurraga "Cauquén" Garnacha', cepa: "Garnacha", ano: 2020, vina: "Viña Undurraga", valle: "Valle del Maule (Cauquenes)", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2028-01-01", maridaje: "Paella, charcutería, tapas mediterráneas", puntajeCriticos: 92, fuenteCriticos: "Wine Enthusiast", produccion: "Ultra limitado" },
  { id: "w10", nombre: 'Undurraga "Red Field Blend"', cepa: "Blend Tinto", ano: 2020, vina: "Viña Undurraga", valle: "Valle del Maule (Cauquenes)", pais: "Chile", tier: "Super Premium", cava: "Cava 1", fechaOptima: "2029-01-01", maridaje: "Guisos campestres, empanadas, cazuela", puntajeCriticos: 91, fuenteCriticos: "James Suckling", produccion: "Ultra limitado" },
  { id: "w11", nombre: 'San Pedro "Sideral"', cepa: "Blend Tinto", ano: 2021, vina: "Viña San Pedro (Altair)", valle: "Cachapoal Andes (Alto Cachapoal)", pais: "Chile", tier: "Premium", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Rib eye, pasta al ragú, cordero", puntajeCriticos: 95, fuenteCriticos: "Vinous", produccion: "Amplio" },
  { id: "w12", nombre: 'Bestias "Bestia Negra"', cepa: "Carmenere", ano: 2017, vina: "Viña Requingua", valle: "Valle de Colchagua", pais: "Chile", tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "2028-01-01", maridaje: "Asado argentino, hamburguesas gourmet", puntajeCriticos: 93, fuenteCriticos: "Wine Diplomats", produccion: "Moderado" },
  { id: "w13", nombre: "Groot Constantia Pinotage", cepa: "Pinotage", ano: 2021, vina: "Groot Constantia Estate", valle: "Constantia", pais: "Sudáfrica", tier: "Gran Reserva", cava: "Cava 2", fechaOptima: "2029-01-01", maridaje: "Bobotie, carnes ahumadas, BBQ sudafricano", puntajeCriticos: 89, fuenteCriticos: "Tim Atkin", produccion: "Amplio" },
  { id: "w14", nombre: 'Garcés Silva "Boya" Cabernet Franc', cepa: "Cabernet Franc", ano: 2018, vina: "Viñedos Garcés Silva", valle: "Valle de Leyda", pais: "Chile", tier: "Reserva", cava: "Cava 2", fechaOptima: "2026-01-01", maridaje: "Pollo al horno, vegetales grillados, queso de cabra", puntajeCriticos: 92, fuenteCriticos: "ADEGA", produccion: "Amplio" },
];

const emptyWine = { id: "", nombre: "", cepa: "", ano: new Date().getFullYear(), vina: "", valle: "", pais: "Chile", tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "", maridaje: "", puntajeCriticos: "", fuenteCriticos: "", produccion: "Limitado" };
const STORAGE_KEY = "cava-wines-v6";

async function researchWine(wine) {
  // Try Vercel serverless function first, fallback to direct API call (Claude.ai)
  try {
    const vercelRes = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wine)
    });
    if (vercelRes.ok) return await vercelRes.json();
  } catch {}
  // Fallback: direct Anthropic call (works inside Claude.ai artifacts)
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Investiga este vino: "${wine.nombre}" de ${wine.vina}, cepa ${wine.cepa}, cosecha ${wine.ano}, origen ${wine.valle || wine.pais}, categoría ${wine.tier}.

Busca en la web y devuelve SOLAMENTE un JSON (sin markdown, sin backticks):
{
  "puntajeCriticos": número 85-100 (puntaje más alto de Tim Atkin, James Suckling, Wine Enthusiast, Descorchados, Wine Spectator, Wine Advocate, Vinous),
  "fuenteCriticos": "nombre del crítico",
  "produccion": "Ultra limitado" | "Limitado" | "Moderado" | "Amplio",
  "maridaje": "sugerencia máximo 60 caracteres",
  "fechaOptimaAno": número año límite para consumir
}
SOLO el JSON.` }]
    })
  });
  const data = await res.json();
  const texts = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
  return JSON.parse(texts.replace(/```json|```/g, "").trim());
}

export default function CavaDeVinos() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [editWine, setEditWine] = useState(null);
  const [form, setForm] = useState({ ...emptyWine });
  const [search, setSearch] = useState("");
  const [filterCepa, setFilterCepa] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [filterCava, setFilterCava] = useState("");
  const [sortBy, setSortBy] = useState("ranking");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [detailWine, setDetailWine] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showRecommender, setShowRecommender] = useState(false);
  const [recoResults, setRecoResults] = useState(null);
  const [researching, setResearching] = useState(false);
  const [researched, setResearched] = useState(false);

  useEffect(() => {
    const tryStorage = () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          window.storage.get(STORAGE_KEY).then(r => {
            if (r?.value) { const d = JSON.parse(r.value); if (d.length > 0) { setWines(d); setLoading(false); return; } }
            tryLocal();
          }).catch(tryLocal);
        } else tryLocal();
      } catch { tryLocal(); }
    };
    const tryLocal = () => {
      try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const d = JSON.parse(s); if (d.length > 0) { setWines(d); setLoading(false); return; } } } catch {}
      setShowImport(true); setLoading(false);
    };
    tryStorage();
  }, []);

  const persist = useCallback((data) => {
    try { if (window.storage) window.storage.set(STORAGE_KEY, JSON.stringify(data)).catch(() => {}); } catch {}
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, []);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const rankedWines = useMemo(() => rankWines(wines), [wines]);

  const handleImport = () => { setWines(INITIAL_WINES); persist(INITIAL_WINES); setShowImport(false); showToast(`✓ ${INITIAL_WINES.length} vinos importados`); };

  const handleResearch = async () => {
    if (!form.nombre || !form.vina) { showToast("⚠️ Nombre y Viña son obligatorios"); return; }
    setResearching(true);
    try {
      const result = await researchWine(form);
      setForm(f => ({
        ...f,
        puntajeCriticos: result.puntajeCriticos || f.puntajeCriticos,
        fuenteCriticos: result.fuenteCriticos || f.fuenteCriticos,
        produccion: PRODUCCIONES.includes(result.produccion) ? result.produccion : f.produccion,
        maridaje: result.maridaje || f.maridaje,
        fechaOptima: result.fechaOptimaAno ? `${result.fechaOptimaAno}-01-01` : f.fechaOptima,
      }));
      setResearched(true);
      showToast("✓ Investigación completada");
    } catch (e) {
      console.error(e);
      showToast("⚠️ Error al investigar. Intenta de nuevo.");
    }
    setResearching(false);
  };

  const handleSave = () => {
    if (!form.nombre || !form.vina) { showToast("⚠️ Nombre y Viña son obligatorios"); return; }
    const wd = { ...form, puntajeCriticos: form.puntajeCriticos ? parseInt(form.puntajeCriticos) : null };
    let updated;
    if (editWine) { updated = wines.map(w => w.id === editWine.id ? { ...wd, id: editWine.id } : w); }
    else { updated = [...wines, { ...wd, id: Date.now().toString() }]; }
    setWines(updated); persist(updated);
    setShowModal(false); setEditWine(null); setForm({ ...emptyWine }); setResearched(false);
    showToast(editWine ? "✓ Actualizado" : "✓ Vino agregado — ranking recalculado");
  };

  const handleDelete = (id) => {
    const u = wines.filter(w => w.id !== id); setWines(u); persist(u);
    setConfirmDelete(null); setDetailWine(null); showToast("Eliminado — ranking recalculado");
  };

  const openEdit = (w) => { setEditWine(w); setForm({ ...w, puntajeCriticos: w.puntajeCriticos ?? "" }); setResearched(true); setShowModal(true); setDetailWine(null); };
  const openAdd = () => { setEditWine(null); setForm({ ...emptyWine }); setResearched(false); setShowModal(true); };

  const filtered = useMemo(() => {
    let f = rankedWines.filter(w => {
      if (filterCepa && w.cepa !== filterCepa) return false;
      if (filterTier && w.tier !== filterTier) return false;
      if (filterCava && w.cava !== filterCava) return false;
      if (search) { const s = search.toLowerCase(); return w.nombre.toLowerCase().includes(s) || w.vina.toLowerCase().includes(s) || w.valle.toLowerCase().includes(s) || w.cepa.toLowerCase().includes(s); }
      return true;
    });
    if (sortBy !== "ranking") { const c = [...f]; c.sort((a, b) => sortBy === "ano" ? b.ano - a.ano : sortBy === "nombre" ? a.nombre.localeCompare(b.nombre) : sortBy === "tier" ? TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) : sortBy === "puntaje" ? (b.puntajeCriticos || 0) - (a.puntajeCriticos || 0) : 0); return c; }
    return f;
  }, [rankedWines, search, filterCepa, filterTier, filterCava, sortBy]);

  const stats = useMemo(() => {
    const cepas = {}, tiers = {}, paises = {}, cavas = { "Cava 1": 0, "Cava 2": 0 };
    rankedWines.forEach(w => { if (w.cepa) cepas[w.cepa] = (cepas[w.cepa] || 0) + 1; tiers[w.tier] = (tiers[w.tier] || 0) + 1; paises[w.pais] = (paises[w.pais] || 0) + 1; if (w.cava) cavas[w.cava] = (cavas[w.cava] || 0) + 1; });
    const alertas = rankedWines.filter(w => w.fechaOptima && new Date(w.fechaOptima) <= new Date());
    return { total: rankedWines.length, cepas, tiers, paises, cavas, alertas };
  }, [rankedWines]);

  const fY = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x) ? d : x.getFullYear().toString(); };
  const handleReco = (o) => setRecoResults({ occasion: o, matches: rankedWines.filter(o.filter).slice(0, 5) });

  if (loading) return <div style={S.loadingScreen}><div style={S.loadingText}>Cargando tu cava...</div></div>;

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:#1a1015}input,select,textarea{font-family:'DM Sans',sans-serif}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:rgba(30,20,25,0.5)}::-webkit-scrollbar-thumb{background:rgba(160,100,80,0.4);border-radius:3px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes toastIn{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 rgba(201,164,74,0)}50%{box-shadow:0 0 12px rgba(201,164,74,0.3)}}
        .wine-card:hover{border-color:rgba(201,164,74,0.35)!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
        .act-btn:hover{color:#e8ddd0!important}.nav-btn:hover{background:rgba(160,100,80,0.1);color:#c9b8a8}
        .fi:focus{border-color:rgba(201,164,74,0.4)!important}.top-row:hover{background:rgba(201,164,74,0.05)}
        .occ-card:hover{border-color:rgba(201,164,74,0.4)!important;transform:scale(1.03)}
        .ai-field{animation:glowPulse 2s ease 1;border-color:rgba(201,164,74,0.4)!important;background:rgba(201,164,74,0.06)!important}
      `}</style>

      {/* Header */}
      <div style={S.header}><div style={S.headerInner}>
        <div style={S.logoArea}><div style={{fontSize:26}}>🍷</div><div><div style={S.logoTitle}>La Cava de Alfonso</div><div style={S.logoSub}>{wines.length} vino{wines.length!==1?"s":""}</div></div></div>
        <div style={S.navArea}>
          {["dashboard","coleccion"].map(v=><button key={v} className="nav-btn" onClick={()=>setView(v)} style={{...S.navBtn,...(view===v?S.navBtnActive:{})}}>{v==="dashboard"?"Dashboard":"Colección"}</button>)}
          <button className="nav-btn" onClick={()=>setShowRecommender(true)} style={{...S.navBtn,background:"rgba(201,164,74,0.1)",color:"#c9a44a",borderColor:"rgba(201,164,74,0.3)"}}>🍽️ Recomendar</button>
          <button onClick={openAdd} style={S.addBtn}>+ Agregar</button>
        </div>
      </div></div>

      <div style={S.content}>
        {view === "dashboard" ? <DashboardView stats={stats} wines={rankedWines} onDetail={setDetailWine} fY={fY} /> :
          <CollectionView wines={filtered} search={search} setSearch={setSearch} filterCepa={filterCepa} setFilterCepa={setFilterCepa} filterTier={filterTier} setFilterTier={setFilterTier} filterCava={filterCava} setFilterCava={setFilterCava} sortBy={sortBy} setSortBy={setSortBy} onEdit={openEdit} onDelete={setConfirmDelete} onDetail={setDetailWine} fY={fY} />}
      </div>

      {/* Recommender */}
      {showRecommender && <div style={S.overlay} onClick={()=>{setShowRecommender(false);setRecoResults(null)}}><div style={{...S.modal,maxWidth:560}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHeader}><h2 style={S.modalTitle}>{recoResults?`${recoResults.occasion.icon} ${recoResults.occasion.label}`:"🍽️ ¿Qué Abrir Hoy?"}</h2><button onClick={()=>{setShowRecommender(false);setRecoResults(null)}} style={S.closeBtn}>✕</button></div>
        <div style={{padding:"20px",maxHeight:"65vh",overflowY:"auto"}}>
          {!recoResults ? <>
            <p style={{color:"#8a7a6a",fontSize:14,marginBottom:16}}>Selecciona ocasión o maridaje.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
              {OCCASIONS.map(o=><div key={o.id} className="occ-card" onClick={()=>handleReco(o)} style={{background:"rgba(40,28,35,0.7)",border:"1px solid rgba(160,100,80,0.15)",borderRadius:10,padding:"14px 12px",cursor:"pointer",transition:"all 0.2s",textAlign:"center"}}>
                <div style={{fontSize:26,marginBottom:4}}>{o.icon}</div>
                <div style={{fontSize:12,fontWeight:600,color:"#e8ddd0",marginBottom:2}}>{o.label}</div>
                <div style={{fontSize:10,color:"#6a5a4a"}}>{o.desc}</div>
              </div>)}
            </div>
          </> : <>
            <button onClick={()=>setRecoResults(null)} style={{...S.cancelBtn,marginBottom:14,fontSize:11,padding:"5px 12px"}}>← Volver</button>
            {recoResults.matches.length===0 ? <div style={{textAlign:"center",padding:"30px 0"}}><div style={{fontSize:40,marginBottom:8}}>🤷</div><p style={{color:"#8a7a6a",fontSize:13}}>No encontré vinos para esto. ¡Hora de comprar!</p></div> :
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {recoResults.matches.map((w,i)=><div key={w.id} onClick={()=>{setDetailWine(w);setShowRecommender(false);setRecoResults(null)}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 10px",background:i===0?"rgba(201,164,74,0.08)":"rgba(40,28,35,0.5)",border:`1px solid ${i===0?"rgba(201,164,74,0.25)":"rgba(160,100,80,0.1)"}`,borderRadius:10,cursor:"pointer"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:i===0?20:15,fontWeight:700,color:"#c9a44a",width:28,textAlign:"center"}}>{i===0?"★":`${i+1}`}</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#e8ddd0"}}>{w.nombre}</div><div style={{fontSize:11,color:"#8a7a6a",marginTop:1}}>{w.vina}·{w.cepa}·{w.ano}</div></div>
                <div style={{...S.tierBadge,background:tC(w.tier),fontSize:9}}>{w.tier}</div>
              </div>)}
              <div style={{marginTop:6,padding:"10px 12px",background:"rgba(201,164,74,0.05)",borderRadius:8,border:"1px solid rgba(201,164,74,0.1)"}}>
                <div style={{fontSize:12,color:"#c9a44a",fontWeight:600}}>Mi recomendación</div>
                <div style={{fontSize:13,color:"#c9b8a8",lineHeight:1.4,marginTop:3}}><strong>{recoResults.matches[0].nombre}</strong> ({recoResults.matches[0].ano}) — Ranking #{recoResults.matches[0].ranking}.{recoResults.matches[0].maridaje&&` ${recoResults.matches[0].maridaje}.`}</div>
              </div>
            </div>}
          </>}
        </div>
      </div></div>}

      {/* Import */}
      {showImport && <div style={S.overlay}><div style={{...S.modal,maxWidth:460}}><div style={{padding:"30px 24px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:14}}>🍷</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#e8ddd0",marginBottom:6}}>Bienvenido a tu Cava</h2>
        <p style={{color:"#8a7a6a",fontSize:13,lineHeight:1.5,marginBottom:20}}>{INITIAL_WINES.length} vinos con ranking automático listos.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>setShowImport(false)} style={S.cancelBtn}>Vacío</button>
          <button onClick={handleImport} style={{...S.saveBtn,padding:"11px 24px"}}>Importar {INITIAL_WINES.length} Vinos</button>
        </div>
      </div></div></div>}

      {/* Detail */}
      {detailWine && (()=>{ const r=rankedWines.find(w=>w.id===detailWine.id)||detailWine; return <div style={S.overlay} onClick={()=>setDetailWine(null)}><div style={{...S.modal,maxWidth:500}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"22px 22px 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:8}}><div style={{...S.tierBadge,background:tC(r.tier)}}>{r.tier}</div><div style={S.rankBadgeD}>#{r.ranking}</div><div style={{fontSize:10,color:"#6a5a4a",background:"rgba(60,40,50,0.5)",padding:"2px 7px",borderRadius:4}}>Score {r._score?.toFixed(1)}</div></div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#e8ddd0",fontWeight:700,lineHeight:1.3}}>{r.nombre}</h2>
            <div style={{color:"#9a8a7a",fontSize:14,marginTop:4}}>{r.vina}·{r.ano}</div>
          </div><button onClick={()=>setDetailWine(null)} style={S.closeBtn}>✕</button>
        </div></div>
        <div style={{padding:"18px 22px"}}>
          <div style={S.detailGrid}><DR l="Cepa" v={r.cepa}/><DR l="Valle" v={r.valle}/><DR l="País" v={r.pais}/><DR l="Cava" v={r.cava}/><DR l="Producción" v={r.produccion}/>{r.fechaOptima&&<DR l="Tomar antes de" v={fY(r.fechaOptima)} h={new Date(r.fechaOptima)<=new Date()}/>}</div>
          {r.puntajeCriticos&&<div style={{marginTop:12,padding:"10px 12px",background:"rgba(122,59,78,0.1)",borderRadius:8,border:"1px solid rgba(122,59,78,0.15)",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:26,fontFamily:"'Playfair Display',serif",fontWeight:700,color:"#e8ddd0"}}>{r.puntajeCriticos}</div>
            <div><div style={{fontSize:10,color:"#8a7a6a",textTransform:"uppercase",letterSpacing:0.5}}>Puntaje Críticos</div>{r.fuenteCriticos&&<div style={{fontSize:12,color:"#c9b8a8",marginTop:1}}>{r.fuenteCriticos}</div>}</div>
          </div>}
          {r.maridaje&&<div style={{marginTop:10,padding:"10px 12px",background:"rgba(201,164,74,0.06)",borderRadius:8,border:"1px solid rgba(201,164,74,0.1)"}}>
            <div style={{fontSize:10,color:"#c9a44a",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🍽️ Maridaje</div>
            <div style={{fontSize:13,color:"#c9b8a8",lineHeight:1.4}}>{r.maridaje}</div>
          </div>}
        </div>
        <div style={S.modalFooter}><button onClick={()=>setConfirmDelete(r)} style={{...S.cancelBtn,color:"#8b4050",borderColor:"rgba(139,64,80,0.3)"}}>Eliminar</button><button onClick={()=>openEdit(r)} style={S.saveBtn}>Editar</button></div>
      </div></div>})()}

      {/* Add/Edit Modal */}
      {showModal && <div style={S.overlay} onClick={()=>setShowModal(false)}><div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHeader}><h2 style={S.modalTitle}>{editWine?"Editar Vino":"Agregar Vino"}</h2><button onClick={()=>setShowModal(false)} style={S.closeBtn}>✕</button></div>
        <div style={S.modalBody}>
          {/* User fields */}
          <div style={{fontSize:11,color:"#c9a44a",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:600}}>Datos del vino</div>
          <div style={S.formGrid}>
            <FF l="Nombre *" s={2}><input className="fi" style={S.input} value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Don Melchor"/></FF>
            <FF l="Viña *"><input className="fi" style={S.input} value={form.vina} onChange={e=>setForm({...form,vina:e.target.value})} placeholder="Ej: Concha y Toro"/></FF>
            <FF l="Cepa"><select className="fi" style={S.input} value={form.cepa} onChange={e=>setForm({...form,cepa:e.target.value})}><option value="">Seleccionar</option>{CEPAS.map(c=><option key={c}>{c}</option>)}</select></FF>
            <FF l="Cosecha"><input className="fi" style={S.input} type="number" min="1900" max="2030" value={form.ano} onChange={e=>setForm({...form,ano:parseInt(e.target.value)||2024})}/></FF>
            <FF l="Valle / Región"><input className="fi" style={S.input} value={form.valle} onChange={e=>setForm({...form,valle:e.target.value})} placeholder="Ej: Valle del Maipo"/></FF>
            <FF l="País"><select className="fi" style={S.input} value={form.pais} onChange={e=>setForm({...form,pais:e.target.value})}>{PAISES.map(p=><option key={p}>{p}</option>)}</select></FF>
            <FF l="Categoría"><select className="fi" style={S.input} value={form.tier} onChange={e=>setForm({...form,tier:e.target.value})}>{TIERS.map(t=><option key={t}>{t}</option>)}</select></FF>
            <FF l="Cava"><select className="fi" style={S.input} value={form.cava} onChange={e=>setForm({...form,cava:e.target.value})}>{CAVAS.map(c=><option key={c}>{c}</option>)}</select></FF>
          </div>

          {/* Research button */}
          {!editWine && <div style={{marginTop:18,textAlign:"center"}}>
            <button onClick={handleResearch} disabled={researching||!form.nombre||!form.vina} style={{...S.saveBtn,padding:"12px 28px",fontSize:14,opacity:researching||!form.nombre||!form.vina?0.5:1,cursor:researching?"wait":"pointer",width:"100%",background:researched?"linear-gradient(135deg,#3a6b3e,#2a5a2e)":"linear-gradient(135deg,#7a3b4e,#5a2838)"}}>
              {researching ? <><span style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite",verticalAlign:"middle",marginRight:8}}/>Investigando...</> : researched ? "✓ Investigado — Revisar abajo" : "🔍 Investigar Vino (IA + Web)"}
            </button>
            {!researched && <p style={{fontSize:10,color:"#6a5a4a",marginTop:6}}>Completa nombre y viña, luego investiga. La IA busca puntajes, maridaje y ventana óptima.</p>}
          </div>}

          {/* AI-researched fields */}
          {(researched || editWine) && <>
            <div style={{fontSize:11,color:"#c9a44a",textTransform:"uppercase",letterSpacing:1,marginTop:20,marginBottom:10,fontWeight:600}}>{editWine?"Datos investigados":"✨ Investigado por IA"}</div>
            <div style={S.formGrid}>
              <FF l="Puntaje Críticos"><input className={`fi ${!editWine&&researched?"ai-field":""}`} style={S.input} type="number" min="85" max="100" value={form.puntajeCriticos} onChange={e=>setForm({...form,puntajeCriticos:e.target.value})} placeholder="95"/></FF>
              <FF l="Fuente"><input className={`fi ${!editWine&&researched?"ai-field":""}`} style={S.input} value={form.fuenteCriticos} onChange={e=>setForm({...form,fuenteCriticos:e.target.value})} placeholder="James Suckling"/></FF>
              <FF l="Producción"><select className={`fi ${!editWine&&researched?"ai-field":""}`} style={S.input} value={form.produccion} onChange={e=>setForm({...form,produccion:e.target.value})}>{PRODUCCIONES.map(p=><option key={p}>{p}</option>)}</select></FF>
              <FF l="Tomar antes de (año)"><input className={`fi ${!editWine&&researched?"ai-field":""}`} style={S.input} type="number" min="2024" max="2060" value={form.fechaOptima?new Date(form.fechaOptima).getFullYear()||"":""} onChange={e=>{const y=parseInt(e.target.value);setForm({...form,fechaOptima:y?`${y}-01-01`:""})}} placeholder="2032"/></FF>
              <FF l="Maridaje" s={2}><input className={`fi ${!editWine&&researched?"ai-field":""}`} style={S.input} value={form.maridaje} onChange={e=>setForm({...form,maridaje:e.target.value})} placeholder="Cordero, quesos duros"/></FF>
            </div>
            {form.nombre && form.vina && <div style={{marginTop:14,padding:"10px 12px",background:"rgba(201,164,74,0.06)",borderRadius:8,border:"1px solid rgba(201,164,74,0.1)",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#c9a44a",textTransform:"uppercase",letterSpacing:1}}>Score estimado</div>
              <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:700,color:"#e8ddd0"}}>{computeScore({...form,puntajeCriticos:form.puntajeCriticos?parseInt(form.puntajeCriticos):null}).toFixed(1)}</div>
            </div>}
          </>}
        </div>
        <div style={S.modalFooter}>
          <button onClick={()=>setShowModal(false)} style={S.cancelBtn}>Cancelar</button>
          <button onClick={handleSave} disabled={!researched&&!editWine} style={{...S.saveBtn,opacity:!researched&&!editWine?0.4:1}}>{editWine?"Guardar":"Agregar a la Cava"}</button>
        </div>
      </div></div>}

      {/* Confirm Delete */}
      {confirmDelete && <div style={S.overlay} onClick={()=>setConfirmDelete(null)}><div style={{...S.modal,maxWidth:400}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"24px 20px",textAlign:"center"}}><div style={{fontSize:34,marginBottom:10}}>🗑️</div><p style={{color:"#e8ddd0",fontSize:15}}>¿Eliminar <strong>{confirmDelete.nombre}</strong>?</p></div>
        <div style={S.modalFooter}><button onClick={()=>setConfirmDelete(null)} style={S.cancelBtn}>Cancelar</button><button onClick={()=>handleDelete(confirmDelete.id)} style={{...S.saveBtn,background:"linear-gradient(135deg,#8b3040,#6b2030)"}}>Eliminar</button></div>
      </div></div>}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

function FF({l,s,children}){return<div style={{gridColumn:s===2?"1/-1":undefined}}><label style={S.label}>{l}</label>{children}</div>}
function DR({l,v,h}){if(!v)return null;return<div style={{marginBottom:12}}><div style={{fontSize:10,color:"#6a5a4a",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{l}</div><div style={{fontSize:14,color:h?"#c9a44a":"#e8ddd0",fontWeight:h?600:400}}>{h?"⏰ ":""}{v}</div></div>}
function tC(t){return{"Ícono":"#c9a44a","Super Premium":"#9b6b3d","Premium":"#8b5e3c","Gran Reserva":"#7a3b4e","Reserva":"#5e3a50","Reserva Privada":"#6e4a5a","Varietal":"#4a3545"}[t]||"#5e3a50"}
function SC({icon,label,value,accent}){return<div style={{...S.statCard,...(accent&&value>0?{border:"1px solid #c9a44a55"}:{})}}><div style={{fontSize:22}}>{icon}</div><div style={{fontSize:24,fontFamily:"'Playfair Display',serif",fontWeight:700,color:accent&&value>0?"#c9a44a":"#e8ddd0"}}>{value}</div><div style={{fontSize:10,color:"#8a7a6a",textTransform:"uppercase",letterSpacing:1}}>{label}</div></div>}

function DashboardView({stats,wines,onDetail,fY}){
  const ce=Object.entries(stats.cepas).sort((a,b)=>b[1]-a[1]),te=Object.entries(stats.tiers).sort((a,b)=>TIERS.indexOf(a[0])-TIERS.indexOf(b[0])),mc=ce.length?ce[0][1]:1,pe=Object.entries(stats.paises).sort((a,b)=>b[1]-a[1]);
  return<div style={{animation:"fadeIn 0.4s ease"}}>
    <div style={S.statsRow}><SC icon="🍾" label="Total" value={stats.total}/><SC icon="🌍" label="Países" value={Object.keys(stats.paises).length}/><SC icon="📦" label="Cava 1" value={stats.cavas["Cava 1"]||0}/><SC icon="📦" label="Cava 2" value={stats.cavas["Cava 2"]||0}/><SC icon="⏰" label="Para Tomar" value={stats.alertas.length} accent/></div>
    <div style={S.dashGrid}>
      <div style={{...S.card,gridColumn:"1/-1"}}><h3 style={S.cardTitle}>🏆 Ranking Automático <span style={{fontSize:10,color:"#6a5a4a",fontWeight:400,fontFamily:"'DM Sans',sans-serif"}}>— puntaje, tier, cosecha, rareza, guarda</span></h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:0}}>
          {wines.map(w=><div key={w.id} className="top-row" style={S.topWineRow} onClick={()=>onDetail(w)}>
            <div style={S.topRank}>#{w.ranking}</div>
            <div style={{flex:1,minWidth:0,overflow:"hidden"}}><div style={S.topName}>{w.nombre}</div><div style={S.topMeta}>{w.vina}·{w.cepa}·{w.ano}{w.puntajeCriticos?` ·${w.puntajeCriticos}pts`:""}</div></div>
            <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}><div style={{fontSize:10,color:"#6a5a4a"}}>{w._score?.toFixed(0)}</div><div style={{...S.tierBadge,background:tC(w.tier),fontSize:9}}>{w.tier}</div></div>
          </div>)}
        </div>
      </div>
      <div style={S.card}><h3 style={S.cardTitle}>🍇 Por Cepa</h3>{ce.map(([c,n])=><div key={c} style={S.barRow}><div style={S.barLabel}>{c}</div><div style={S.barTrack}><div style={{...S.barFill,width:`${(n/mc)*100}%`}}/></div><div style={S.barValue}>{n}</div></div>)}</div>
      <div style={S.card}><h3 style={S.cardTitle}>🏷️ Categoría</h3>{te.map(([t,n])=><div key={t} style={S.tierRow}><div style={{...S.tierDot,background:tC(t)}}/><div style={{flex:1,color:"#c9b8a8",fontSize:13}}>{t}</div><div style={{color:"#e8ddd0",fontWeight:600,fontSize:14}}>{n}</div></div>)}
        {pe.length>0&&<><div style={{borderTop:"1px solid rgba(160,100,80,0.1)",margin:"12px 0",paddingTop:12}}><div style={{fontSize:12,color:"#8a7a6a",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Por País</div></div>
        {pe.map(([p,n])=><div key={p} style={S.tierRow}><div style={{fontSize:15,width:22,textAlign:"center"}}>{p==="Chile"?"🇨🇱":p==="Sudáfrica"?"🇿🇦":p==="Argentina"?"🇦🇷":p==="Francia"?"🇫🇷":"🌍"}</div><div style={{flex:1,color:"#c9b8a8",fontSize:13}}>{p}</div><div style={{color:"#e8ddd0",fontWeight:600,fontSize:14}}>{n}</div></div>)}</>}
      </div>
      <div style={S.card}><h3 style={S.cardTitle}>🔔 Ventana Óptima</h3>{stats.alertas.length===0?<p style={S.emptyText}>Sin vinos en ventana óptima</p>:stats.alertas.sort((a,b)=>new Date(a.fechaOptima)-new Date(b.fechaOptima)).map(w=><div key={w.id} className="top-row" style={S.alertRow} onClick={()=>onDetail(w)}><div style={{flex:1}}><div style={S.topName}>{w.nombre}</div><div style={S.topMeta}>Antes de {fY(w.fechaOptima)}</div></div><div style={{color:"#c9a44a",fontSize:16}}>⏰</div></div>)}</div>
    </div>
  </div>;
}

function CollectionView({wines,search,setSearch,filterCepa,setFilterCepa,filterTier,setFilterTier,filterCava,setFilterCava,sortBy,setSortBy,onEdit,onDelete,onDetail,fY}){
  return<div style={{animation:"fadeIn 0.4s ease"}}>
    <div style={S.filtersBar}>
      <input className="fi" style={{...S.input,flex:2,minWidth:150}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <select className="fi" style={{...S.input,flex:1,minWidth:110}} value={filterCepa} onChange={e=>setFilterCepa(e.target.value)}><option value="">Cepas</option>{CEPAS.map(c=><option key={c}>{c}</option>)}</select>
      <select className="fi" style={{...S.input,flex:1,minWidth:100}} value={filterTier} onChange={e=>setFilterTier(e.target.value)}><option value="">Tiers</option>{TIERS.map(t=><option key={t}>{t}</option>)}</select>
      <select className="fi" style={{...S.input,flex:1,minWidth:90}} value={filterCava} onChange={e=>setFilterCava(e.target.value)}><option value="">Cavas</option>{CAVAS.map(c=><option key={c}>{c}</option>)}</select>
      <select className="fi" style={{...S.input,flex:1,minWidth:110}} value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="ranking">Ranking</option><option value="puntaje">Puntaje</option><option value="ano">Cosecha</option><option value="nombre">Nombre</option><option value="tier">Tier</option></select>
    </div>
    <div style={{color:"#8a7a6a",fontSize:12,marginBottom:14}}>{wines.length} vino{wines.length!==1?"s":""}</div>
    {wines.length===0?<div style={S.emptyState}><div style={{fontSize:44,marginBottom:10}}>🍇</div><div style={{color:"#8a7a6a",fontSize:15}}>Sin resultados</div></div>:
    <div style={S.wineGrid}>{wines.map((w,i)=><div key={w.id} className="wine-card" onClick={()=>onDetail(w)} style={{...S.wineCard,animationDelay:`${i*0.04}s`,cursor:"pointer"}}>
      <div style={S.wineCardTop}><div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{...S.tierBadge,background:tC(w.tier)}}>{w.tier}</div><div style={S.rankBadge}>#{w.ranking}</div></div><div style={{fontSize:11,color:"#6a5a4a"}}>📍{w.cava}</div></div>
      <div style={S.wineName}>{w.nombre}</div>
      <div style={S.wineMeta}>{w.vina}·{w.ano}</div>
      <div style={S.wineMeta}>{w.cepa}{w.pais!=="Chile"?` ·${w.pais}`:""}</div>
      {w.puntajeCriticos&&<div style={{marginTop:5,fontSize:11,color:"#c9a44a"}}>⭐ {w.puntajeCriticos}pts {w.fuenteCriticos?`(${w.fuenteCriticos})`:""}</div>}
      <div style={{marginTop:6,display:"flex",gap:5,flexWrap:"wrap"}}>
        {w.produccion&&<span style={{...S.badge,background:"rgba(100,100,120,0.12)",color:"#8a7a6a"}}>{w.produccion}</span>}
        {w.fechaOptima&&new Date(w.fechaOptima)<=new Date()&&<span style={{...S.badge,background:"rgba(201,164,74,0.15)",color:"#c9a44a"}}>⏰ Listo</span>}
        {w.fechaOptima&&new Date(w.fechaOptima)>new Date()&&<span style={{...S.badge,background:"rgba(100,100,120,0.1)",color:"#7a6a5a"}}>📅{fY(w.fechaOptima)}</span>}
      </div>
      <div style={S.wineActions}><button className="act-btn" onClick={e=>{e.stopPropagation();onEdit(w)}} style={S.actionBtn}>Editar</button><button className="act-btn" onClick={e=>{e.stopPropagation();onDelete(w)}} style={{...S.actionBtn,color:"#8b4050"}}>Eliminar</button></div>
    </div>)}</div>}
  </div>;
}

const S={
  app:{fontFamily:"'DM Sans',sans-serif",background:"linear-gradient(170deg,#1a1015 0%,#2a1a20 40%,#1e1520 100%)",minHeight:"100vh",color:"#e8ddd0"},
  loadingScreen:{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#1a1015"},
  loadingText:{fontFamily:"'Playfair Display',serif",color:"#c9a44a",fontSize:20,animation:"pulse 1.5s infinite"},
  header:{background:"rgba(20,12,16,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(160,100,80,0.15)",position:"sticky",top:0,zIndex:100},
  headerInner:{maxWidth:1200,margin:"0 auto",padding:"11px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8},
  logoArea:{display:"flex",alignItems:"center",gap:10},
  logoTitle:{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#e8ddd0"},
  logoSub:{fontSize:11,color:"#8a7a6a"},
  navArea:{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"},
  navBtn:{background:"transparent",border:"1px solid rgba(160,100,80,0.2)",color:"#8a7a6a",padding:"6px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:500,transition:"all 0.2s"},
  navBtnActive:{background:"rgba(160,100,80,0.15)",color:"#e8ddd0",borderColor:"rgba(160,100,80,0.4)"},
  addBtn:{background:"linear-gradient(135deg,#7a3b4e,#5a2838)",color:"#e8ddd0",border:"none",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600},
  content:{maxWidth:1200,margin:"0 auto",padding:"22px 18px"},
  statsRow:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:9,marginBottom:18},
  statCard:{background:"rgba(40,28,35,0.7)",borderRadius:10,padding:"12px 10px",textAlign:"center",border:"1px solid rgba(160,100,80,0.1)",display:"flex",flexDirection:"column",gap:2,alignItems:"center"},
  dashGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12},
  card:{background:"rgba(40,28,35,0.6)",borderRadius:12,padding:"18px 16px",border:"1px solid rgba(160,100,80,0.1)"},
  cardTitle:{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"#e8ddd0",marginBottom:12},
  topWineRow:{display:"flex",alignItems:"center",gap:9,padding:"8px 6px",borderBottom:"1px solid rgba(160,100,80,0.08)",cursor:"pointer",transition:"background 0.2s",borderRadius:6},
  topRank:{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#c9a44a",width:28,flexShrink:0,textAlign:"center"},
  topName:{fontSize:12,fontWeight:600,color:"#e8ddd0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  topMeta:{fontSize:10,color:"#8a7a6a",marginTop:1},
  tierBadge:{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:600,color:"#fff",letterSpacing:0.4,textTransform:"uppercase",whiteSpace:"nowrap"},
  rankBadge:{padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700,color:"#c9a44a",background:"rgba(201,164,74,0.1)",border:"1px solid rgba(201,164,74,0.2)",fontFamily:"'Playfair Display',serif"},
  rankBadgeD:{padding:"3px 9px",borderRadius:4,fontSize:13,fontWeight:700,color:"#c9a44a",background:"rgba(201,164,74,0.1)",border:"1px solid rgba(201,164,74,0.2)",fontFamily:"'Playfair Display',serif"},
  barRow:{display:"flex",alignItems:"center",gap:7,marginBottom:7},barLabel:{width:95,fontSize:11,color:"#c9b8a8",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  barTrack:{flex:1,height:6,background:"rgba(60,40,50,0.5)",borderRadius:4,overflow:"hidden"},barFill:{height:"100%",background:"linear-gradient(90deg,#7a3b4e,#c9a44a)",borderRadius:4,transition:"width 0.6s ease"},
  barValue:{width:20,fontSize:11,color:"#e8ddd0",fontWeight:600,textAlign:"right"},
  tierRow:{display:"flex",alignItems:"center",gap:9,padding:"5px 0",borderBottom:"1px solid rgba(160,100,80,0.06)"},tierDot:{width:10,height:10,borderRadius:"50%",flexShrink:0},
  alertRow:{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderBottom:"1px solid rgba(160,100,80,0.08)",cursor:"pointer",borderRadius:6,transition:"background 0.2s"},
  filtersBar:{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12},
  wineGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11},
  wineCard:{background:"rgba(40,28,35,0.65)",borderRadius:12,padding:"15px 13px",border:"1px solid rgba(160,100,80,0.1)",animation:"slideUp 0.4s ease both",transition:"all 0.3s ease"},
  wineCardTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},
  wineName:{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:"#e8ddd0",marginBottom:2,lineHeight:1.3},
  wineMeta:{fontSize:11,color:"#8a7a6a",lineHeight:1.4},badge:{padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:600},
  wineActions:{display:"flex",gap:6,marginTop:10,paddingTop:9,borderTop:"1px solid rgba(160,100,80,0.1)"},
  actionBtn:{background:"transparent",border:"none",color:"#8a7a6a",cursor:"pointer",fontSize:11,fontWeight:500,padding:"3px 5px",borderRadius:4,transition:"color 0.2s"},
  emptyState:{textAlign:"center",padding:"45px 18px"},emptyText:{color:"#6a5a4a",fontSize:12},
  overlay:{position:"fixed",inset:0,background:"rgba(10,6,8,0.85)",backdropFilter:"blur(8px)",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"28px 12px",zIndex:200,overflowY:"auto"},
  modal:{background:"linear-gradient(170deg,#2e2028,#1e1520)",borderRadius:14,width:"100%",maxWidth:640,border:"1px solid rgba(160,100,80,0.2)",animation:"slideUp 0.3s ease"},
  modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"15px 18px",borderBottom:"1px solid rgba(160,100,80,0.1)"},
  modalTitle:{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,color:"#e8ddd0"},
  closeBtn:{background:"transparent",border:"none",color:"#8a7a6a",fontSize:17,cursor:"pointer",padding:3},
  modalBody:{padding:"16px 18px",maxHeight:"62vh",overflowY:"auto"},
  modalFooter:{display:"flex",justifyContent:"flex-end",gap:8,padding:"12px 18px",borderTop:"1px solid rgba(160,100,80,0.1)"},
  formGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11},
  label:{display:"block",fontSize:10,color:"#8a7a6a",marginBottom:3,textTransform:"uppercase",letterSpacing:0.5,fontWeight:500},
  input:{width:"100%",padding:"8px 10px",background:"rgba(20,14,18,0.6)",border:"1px solid rgba(160,100,80,0.2)",borderRadius:6,color:"#e8ddd0",fontSize:13,outline:"none",transition:"border-color 0.2s"},
  cancelBtn:{background:"transparent",border:"1px solid rgba(160,100,80,0.2)",color:"#8a7a6a",padding:"8px 16px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500},
  saveBtn:{background:"linear-gradient(135deg,#7a3b4e,#5a2838)",color:"#e8ddd0",border:"none",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600},
  detailGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3},
  toast:{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",background:"rgba(40,28,35,0.95)",border:"1px solid rgba(200,164,74,0.3)",color:"#e8ddd0",padding:"10px 22px",borderRadius:8,fontSize:13,zIndex:300,animation:"toastIn 0.3s ease",backdropFilter:"blur(10px)"},
};
