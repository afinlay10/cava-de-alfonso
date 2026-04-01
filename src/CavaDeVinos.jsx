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

// Vintage quality ratings (0-100) based on Jancis Robinson, James Suckling, Descorchados
const VINTAGE_QUALITY = {
  Chile: { 2022: 95, 2018: 95, 2019: 90, 2021: 91, 2020: 85, 2017: 78, 2016: 82, 2015: 88, 2014: 84, 2013: 86 },
  "Sudáfrica": { 2022: 88, 2021: 87, 2020: 86, 2019: 89, 2018: 90, 2017: 85 },
  Argentina: { 2022: 90, 2021: 88, 2020: 89, 2019: 92, 2018: 91, 2017: 93 },
  Francia: { 2022: 88, 2021: 86, 2020: 92, 2019: 90, 2018: 93, 2017: 85 },
  Italia: { 2022: 90, 2021: 88, 2020: 89, 2019: 93, 2018: 87, 2017: 85 },
  España: { 2022: 88, 2021: 87, 2020: 89, 2019: 91, 2018: 92, 2017: 90 },
};
const DEFAULT_VINTAGE = 85;

const TIER_SCORES = { "Ícono": 100, "Super Premium": 82, "Premium": 65, "Gran Reserva": 48, "Reserva": 30, "Reserva Privada": 38, "Varietal": 15 };
const PROD_SCORES = { "Ultra limitado": 100, "Limitado": 72, "Moderado": 42, "Amplio": 12 };

function computeScore(wine) {
  const criticNorm = wine.puntajeCriticos ? Math.min(100, Math.max(0, (wine.puntajeCriticos - 85) / 12 * 100)) : 30;
  const tierScore = TIER_SCORES[wine.tier] || 40;
  const prodScore = PROD_SCORES[wine.produccion] || 40;
  const countryVintages = VINTAGE_QUALITY[wine.pais] || {};
  const vintageScore = countryVintages[wine.ano] ?? DEFAULT_VINTAGE;
  const now = new Date().getFullYear();
  const guardYears = wine.fechaOptima ? Math.max(0, new Date(wine.fechaOptima).getFullYear() - now) : 3;
  const guardScore = Math.min(100, guardYears * 10);
  return (criticNorm * 0.30) + (tierScore * 0.25) + (prodScore * 0.20) + (vintageScore * 0.15) + (guardScore * 0.10);
}

function rankWines(wines) {
  const scored = wines.map(w => ({ ...w, _score: computeScore(w) }));
  scored.sort((a, b) => b._score - a._score);
  return scored.map((w, i) => ({ ...w, ranking: i + 1 }));
}

const OCCASIONS = [
  { id: "formal", label: "Cena Formal", icon: "🎩", desc: "Para impresionar", filter: w => w.ranking <= 5 },
  { id: "asado", label: "Asado / BBQ", icon: "🔥", desc: "Parrilla y amigos", filter: w => w.maridaje && /asado|parrilla|costill|bbq|carne/i.test(w.maridaje) },
  { id: "romantica", label: "Cena Romántica", icon: "❤️", desc: "Algo especial", filter: w => w.ranking <= 7 && (TIER_SCORES[w.tier] || 0) >= 65 },
  { id: "regalo", label: "Para Regalar", icon: "🎁", desc: "Etiqueta impresionante", filter: w => ["Ícono", "Super Premium"].includes(w.tier) },
  { id: "guardar", label: "Para Guardar", icon: "🏺", desc: "Olvidar en la cava", filter: w => { const fy = w.fechaOptima ? new Date(w.fechaOptima).getFullYear() : 0; return fy >= new Date().getFullYear() + 3; } },
  { id: "hoy", label: "Para Tomar Hoy", icon: "🥂", desc: "Ya en su punto", filter: w => { if (!w.fechaOptima) return true; return new Date(w.fechaOptima) <= new Date(); } },
  { id: "carnesrojas", label: "Carnes Rojas", icon: "🥩", desc: "Filete, cordero, lomo", filter: w => w.maridaje && /carne|filete|cordero|lomo|res|rib|costill|entrecot/i.test(w.maridaje) },
  { id: "pastas", label: "Pastas / Guisos", icon: "🍝", desc: "Ragú, estofados", filter: w => w.maridaje && /pasta|ragú|guiso|estofad|cazuela|risotto/i.test(w.maridaje) },
  { id: "quesos", label: "Quesos", icon: "🧀", desc: "Tabla de quesos", filter: w => w.maridaje && /queso|cheese/i.test(w.maridaje) },
  { id: "aves", label: "Aves / Cerdo", icon: "🍗", desc: "Pollo, pato, cerdo", filter: w => w.maridaje && /pollo|pato|cerdo|ave|pavo/i.test(w.maridaje) },
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

const emptyWine = {
  id: "", nombre: "", cepa: "", ano: new Date().getFullYear(), vina: "", valle: "", pais: "Chile",
  tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "", maridaje: "",
  puntajeCriticos: "", fuenteCriticos: "", produccion: "Limitado"
};

const STORAGE_KEY = "cava-wines-v5";

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

  // Load
  useEffect(() => {
    const load = () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          window.storage.get(STORAGE_KEY).then(r => {
            if (r && r.value) { const d = JSON.parse(r.value); if (d.length > 0) { setWines(d); setLoading(false); return; } }
            setShowImport(true); setLoading(false);
          }).catch(() => { tryLocal(); });
        } else { tryLocal(); }
      } catch { tryLocal(); }
    };
    const tryLocal = () => {
      try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) { const d = JSON.parse(s); if (d.length > 0) { setWines(d); setLoading(false); return; } }
      } catch { }
      setShowImport(true); setLoading(false);
    };
    load();
  }, []);

  const persist = useCallback((data) => {
    try {
      if (typeof window !== 'undefined' && window.storage) {
        window.storage.set(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Ranked wines
  const rankedWines = useMemo(() => rankWines(wines), [wines]);

  const handleImport = () => {
    setWines(INITIAL_WINES);
    persist(INITIAL_WINES);
    setShowImport(false);
    showToast(`✓ ${INITIAL_WINES.length} vinos importados`);
  };

  const handleSave = () => {
    if (!form.nombre || !form.vina) { showToast("⚠️ Nombre y Viña son obligatorios"); return; }
    const wineData = { ...form, puntajeCriticos: form.puntajeCriticos ? parseInt(form.puntajeCriticos) : null };
    let updated;
    if (editWine) {
      updated = wines.map(w => w.id === editWine.id ? { ...wineData, id: editWine.id } : w);
    } else {
      updated = [...wines, { ...wineData, id: Date.now().toString() }];
    }
    setWines(updated);
    persist(updated);
    setShowModal(false); setEditWine(null); setForm({ ...emptyWine });
    showToast(editWine ? "✓ Vino actualizado — ranking recalculado" : "✓ Vino agregado — ranking recalculado");
  };

  const handleDelete = (id) => {
    const updated = wines.filter(w => w.id !== id);
    setWines(updated); persist(updated);
    setConfirmDelete(null); setDetailWine(null);
    showToast("Vino eliminado — ranking recalculado");
  };

  const openEdit = (wine) => { setEditWine(wine); setForm({ ...wine, puntajeCriticos: wine.puntajeCriticos ?? "" }); setShowModal(true); setDetailWine(null); };
  const openAdd = () => { setEditWine(null); setForm({ ...emptyWine }); setShowModal(true); };

  const filtered = useMemo(() => {
    let f = rankedWines.filter(w => {
      if (filterCepa && w.cepa !== filterCepa) return false;
      if (filterTier && w.tier !== filterTier) return false;
      if (filterCava && w.cava !== filterCava) return false;
      if (search) {
        const s = search.toLowerCase();
        return w.nombre.toLowerCase().includes(s) || w.vina.toLowerCase().includes(s) || w.valle.toLowerCase().includes(s) || w.cepa.toLowerCase().includes(s);
      }
      return true;
    });
    if (sortBy === "ranking") return f;
    const copy = [...f];
    copy.sort((a, b) => {
      if (sortBy === "ano") return b.ano - a.ano;
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "tier") return TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier);
      if (sortBy === "puntaje") return (b.puntajeCriticos || 0) - (a.puntajeCriticos || 0);
      return 0;
    });
    return copy;
  }, [rankedWines, search, filterCepa, filterTier, filterCava, sortBy]);

  const stats = useMemo(() => {
    const total = rankedWines.length;
    const cepas = {}, tiers = {}, paises = {};
    const cavas = { "Cava 1": 0, "Cava 2": 0 };
    rankedWines.forEach(w => {
      if (w.cepa) cepas[w.cepa] = (cepas[w.cepa] || 0) + 1;
      tiers[w.tier] = (tiers[w.tier] || 0) + 1;
      paises[w.pais] = (paises[w.pais] || 0) + 1;
      if (w.cava) cavas[w.cava] = (cavas[w.cava] || 0) + 1;
    });
    const now = new Date();
    const alertas = rankedWines.filter(w => w.fechaOptima && new Date(w.fechaOptima) <= now);
    return { total, cepas, tiers, paises, cavas, alertas };
  }, [rankedWines]);

  const fmtYear = (d) => { if (!d) return ""; const x = new Date(d); return isNaN(x.getTime()) ? d : x.getFullYear().toString(); };

  const handleRecommend = (occasion) => {
    const matches = rankedWines.filter(occasion.filter).slice(0, 5);
    setRecoResults({ occasion, matches });
  };

  if (loading) return <div style={S.loadingScreen}><div style={S.loadingText}>Cargando tu cava...</div></div>;

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1015; }
        input, select, textarea { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(30,20,25,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(160,100,80,0.4); border-radius: 3px; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes toastIn { from { opacity:0; transform: translate(-50%,20px); } to { opacity:1; transform: translate(-50%,0); } }
        .wine-card:hover { border-color: rgba(201,164,74,0.35) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .action-btn:hover { color: #e8ddd0 !important; }
        .nav-btn:hover { background: rgba(160,100,80,0.1); color: #c9b8a8; }
        .filter-input:focus { border-color: rgba(201,164,74,0.4) !important; }
        .top-row:hover { background: rgba(201,164,74,0.05); }
        .occ-card:hover { border-color: rgba(201,164,74,0.4) !important; transform: scale(1.03); }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logoArea}>
            <div style={S.logoIcon}>🍷</div>
            <div>
              <div style={S.logoTitle}>La Cava de Alfonso</div>
              <div style={S.logoSub}>{wines.length} vino{wines.length !== 1 ? "s" : ""} en colección</div>
            </div>
          </div>
          <div style={S.navArea}>
            {["dashboard", "coleccion", "recomendar"].map(v => (
              <button key={v} className="nav-btn" onClick={() => v === "recomendar" ? setShowRecommender(true) : setView(v)} style={{ ...S.navBtn, ...(view === v && v !== "recomendar" ? S.navBtnActive : {}), ...(v === "recomendar" ? { background: "rgba(201,164,74,0.1)", color: "#c9a44a", borderColor: "rgba(201,164,74,0.3)" } : {}) }}>
                {v === "dashboard" ? "Dashboard" : v === "coleccion" ? "Colección" : "🍽️ Recomendar"}
              </button>
            ))}
            <button onClick={openAdd} style={S.addBtn}>+ Agregar</button>
          </div>
        </div>
      </div>

      <div style={S.content}>
        {view === "dashboard" ? (
          <DashboardView stats={stats} wines={rankedWines} onDetail={setDetailWine} fmtYear={fmtYear} />
        ) : (
          <CollectionView
            wines={filtered} search={search} setSearch={setSearch}
            filterCepa={filterCepa} setFilterCepa={setFilterCepa}
            filterTier={filterTier} setFilterTier={setFilterTier}
            filterCava={filterCava} setFilterCava={setFilterCava}
            sortBy={sortBy} setSortBy={setSortBy}
            onEdit={openEdit} onDelete={setConfirmDelete} onDetail={setDetailWine}
            fmtYear={fmtYear}
          />
        )}
      </div>

      {/* Recommender Modal */}
      {showRecommender && (
        <div style={S.overlay} onClick={() => { setShowRecommender(false); setRecoResults(null); }}>
          <div style={{ ...S.modal, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>{recoResults ? `${recoResults.occasion.icon} ${recoResults.occasion.label}` : "🍽️ ¿Qué Abrir Hoy?"}</h2>
              <button onClick={() => { setShowRecommender(false); setRecoResults(null); }} style={S.closeBtn}>✕</button>
            </div>
            <div style={{ padding: "20px 22px", maxHeight: "65vh", overflowY: "auto" }}>
              {!recoResults ? (
                <>
                  <p style={{ color: "#8a7a6a", fontSize: 14, marginBottom: 18 }}>Selecciona la ocasión o maridaje y te recomiendo el mejor vino de tu cava.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                    {OCCASIONS.map(occ => (
                      <div key={occ.id} className="occ-card" onClick={() => handleRecommend(occ)}
                        style={{ background: "rgba(40,28,35,0.7)", border: "1px solid rgba(160,100,80,0.15)", borderRadius: 10, padding: "16px 14px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>{occ.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e8ddd0", marginBottom: 3 }}>{occ.label}</div>
                        <div style={{ fontSize: 11, color: "#6a5a4a" }}>{occ.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setRecoResults(null)} style={{ ...S.cancelBtn, marginBottom: 16, fontSize: 12, padding: "6px 14px" }}>← Volver a ocasiones</button>
                  {recoResults.matches.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🤷</div>
                      <p style={{ color: "#8a7a6a", fontSize: 14 }}>No encontré vinos para esta ocasión en tu cava. ¡Hora de comprar!</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {recoResults.matches.map((w, i) => (
                        <div key={w.id} onClick={() => { setDetailWine(w); setShowRecommender(false); setRecoResults(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 12px", background: i === 0 ? "rgba(201,164,74,0.08)" : "rgba(40,28,35,0.5)", border: `1px solid ${i === 0 ? "rgba(201,164,74,0.25)" : "rgba(160,100,80,0.1)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: i === 0 ? 22 : 16, fontWeight: 700, color: "#c9a44a", width: 32, textAlign: "center" }}>
                            {i === 0 ? "★" : `#${i + 1}`}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#e8ddd0" }}>{w.nombre}</div>
                            <div style={{ fontSize: 12, color: "#8a7a6a", marginTop: 2 }}>{w.vina} · {w.cepa} · {w.ano}</div>
                            {w.maridaje && <div style={{ fontSize: 11, color: "#6a5a4a", marginTop: 3 }}>🍽️ {w.maridaje}</div>}
                          </div>
                          <div style={{ ...S.tierBadge, background: tierColor(w.tier), fontSize: 9 }}>{w.tier}</div>
                        </div>
                      ))}
                      {recoResults.matches.length > 0 && (
                        <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(201,164,74,0.05)", borderRadius: 8, border: "1px solid rgba(201,164,74,0.1)" }}>
                          <div style={{ fontSize: 12, color: "#c9a44a", fontWeight: 600, marginBottom: 4 }}>Mi recomendación</div>
                          <div style={{ fontSize: 13, color: "#c9b8a8", lineHeight: 1.5 }}>
                            <strong>{recoResults.matches[0].nombre}</strong> ({recoResults.matches[0].ano}) — Es tu mejor opción por ranking #{recoResults.matches[0].ranking} en la cava.
                            {recoResults.matches[0].maridaje && ` Ideal con ${recoResults.matches[0].maridaje.toLowerCase()}.`}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImport && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: 480 }}>
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#e8ddd0", marginBottom: 8 }}>Bienvenido a tu Cava</h2>
              <p style={{ color: "#8a7a6a", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Tengo {INITIAL_WINES.length} vinos listos para cargar con ranking automático.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={() => setShowImport(false)} style={S.cancelBtn}>Empezar Vacío</button>
                <button onClick={handleImport} style={{ ...S.saveBtn, padding: "12px 28px", fontSize: 14 }}>Importar {INITIAL_WINES.length} Vinos</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wine Detail */}
      {detailWine && (() => {
        const ranked = rankedWines.find(w => w.id === detailWine.id) || detailWine;
        return (
          <div style={S.overlay} onClick={() => setDetailWine(null)}>
            <div style={{ ...S.modal, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "24px 24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                      <div style={{ ...S.tierBadge, background: tierColor(ranked.tier) }}>{ranked.tier}</div>
                      <div style={S.rankBadgeDetail}>#{ranked.ranking}</div>
                      <div style={{ fontSize: 11, color: "#6a5a4a", background: "rgba(60,40,50,0.5)", padding: "3px 8px", borderRadius: 4 }}>Score: {ranked._score?.toFixed(1)}</div>
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#e8ddd0", fontWeight: 700, lineHeight: 1.3 }}>{ranked.nombre}</h2>
                    <div style={{ color: "#9a8a7a", fontSize: 15, marginTop: 6 }}>{ranked.vina} · {ranked.ano}</div>
                  </div>
                  <button onClick={() => setDetailWine(null)} style={S.closeBtn}>✕</button>
                </div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={S.detailGrid}>
                  <DRow label="Cepa" value={ranked.cepa} />
                  <DRow label="Valle" value={ranked.valle} />
                  <DRow label="País" value={ranked.pais} />
                  <DRow label="Cava" value={ranked.cava} />
                  <DRow label="Producción" value={ranked.produccion} />
                  {ranked.fechaOptima && <DRow label="Tomar antes de" value={fmtYear(ranked.fechaOptima)} highlight={new Date(ranked.fechaOptima) <= new Date()} />}
                </div>
                {ranked.puntajeCriticos && (
                  <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(122,59,78,0.1)", borderRadius: 8, border: "1px solid rgba(122,59,78,0.15)", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#e8ddd0" }}>{ranked.puntajeCriticos}</div>
                    <div>
                      <div style={{ fontSize: 11, color: "#8a7a6a", textTransform: "uppercase", letterSpacing: 0.5 }}>Puntaje Críticos</div>
                      {ranked.fuenteCriticos && <div style={{ fontSize: 13, color: "#c9b8a8", marginTop: 2 }}>{ranked.fuenteCriticos}</div>}
                    </div>
                  </div>
                )}
                {ranked.maridaje && (
                  <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(201,164,74,0.06)", borderRadius: 8, border: "1px solid rgba(201,164,74,0.1)" }}>
                    <div style={{ fontSize: 11, color: "#c9a44a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🍽️ Maridaje</div>
                    <div style={{ fontSize: 14, color: "#c9b8a8", lineHeight: 1.5 }}>{ranked.maridaje}</div>
                  </div>
                )}
              </div>
              <div style={S.modalFooter}>
                <button onClick={() => setConfirmDelete(ranked)} style={{ ...S.cancelBtn, color: "#8b4050", borderColor: "rgba(139,64,80,0.3)" }}>Eliminar</button>
                <button onClick={() => openEdit(ranked)} style={S.saveBtn}>Editar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>{editWine ? "Editar Vino" : "Agregar Vino"}</h2>
              <button onClick={() => setShowModal(false)} style={S.closeBtn}>✕</button>
            </div>
            <div style={S.modalBody}>
              <div style={S.formGrid}>
                <FF label="Nombre del Vino *" span={2}><input className="filter-input" style={S.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Don Melchor" /></FF>
                <FF label="Viña *"><input className="filter-input" style={S.input} value={form.vina} onChange={e => setForm({ ...form, vina: e.target.value })} placeholder="Ej: Concha y Toro" /></FF>
                <FF label="Cepa"><select className="filter-input" style={S.input} value={form.cepa} onChange={e => setForm({ ...form, cepa: e.target.value })}><option value="">Seleccionar</option>{CEPAS.map(c => <option key={c}>{c}</option>)}</select></FF>
                <FF label="Cosecha (Año)"><input className="filter-input" style={S.input} type="number" min="1900" max="2030" value={form.ano} onChange={e => setForm({ ...form, ano: parseInt(e.target.value) || 2024 })} /></FF>
                <FF label="Valle / Región"><input className="filter-input" style={S.input} value={form.valle} onChange={e => setForm({ ...form, valle: e.target.value })} placeholder="Ej: Valle del Maipo" /></FF>
                <FF label="País"><select className="filter-input" style={S.input} value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })}>{PAISES.map(p => <option key={p}>{p}</option>)}</select></FF>
                <FF label="Categoría / Tier"><select className="filter-input" style={S.input} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>{TIERS.map(t => <option key={t}>{t}</option>)}</select></FF>
                <FF label="Producción"><select className="filter-input" style={S.input} value={form.produccion} onChange={e => setForm({ ...form, produccion: e.target.value })}>{PRODUCCIONES.map(p => <option key={p}>{p}</option>)}</select></FF>
                <FF label="Puntaje Críticos (85-100)"><input className="filter-input" style={S.input} type="number" min="85" max="100" value={form.puntajeCriticos} onChange={e => setForm({ ...form, puntajeCriticos: e.target.value })} placeholder="Ej: 95" /></FF>
                <FF label="Fuente del Puntaje"><input className="filter-input" style={S.input} value={form.fuenteCriticos} onChange={e => setForm({ ...form, fuenteCriticos: e.target.value })} placeholder="Ej: James Suckling" /></FF>
                <FF label="Cava"><select className="filter-input" style={S.input} value={form.cava} onChange={e => setForm({ ...form, cava: e.target.value })}>{CAVAS.map(c => <option key={c}>{c}</option>)}</select></FF>
                <FF label="Tomar antes de (año)"><input className="filter-input" style={S.input} type="number" min="2024" max="2060" value={form.fechaOptima ? new Date(form.fechaOptima).getFullYear() || "" : ""} onChange={e => { const y = parseInt(e.target.value); setForm({ ...form, fechaOptima: y ? `${y}-01-01` : "" }); }} placeholder="Ej: 2032" /></FF>
                <FF label="Maridaje" span={2}><input className="filter-input" style={S.input} value={form.maridaje} onChange={e => setForm({ ...form, maridaje: e.target.value })} placeholder="Ej: Cordero, quesos duros, pastas" /></FF>
              </div>
              {form.nombre && form.vina && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(201,164,74,0.06)", borderRadius: 8, border: "1px solid rgba(201,164,74,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#c9a44a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Score estimado</div>
                  <div style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#e8ddd0" }}>{computeScore({ ...form, puntajeCriticos: form.puntajeCriticos ? parseInt(form.puntajeCriticos) : null }).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: "#6a5a4a", marginTop: 2 }}>El ranking se calcula automáticamente al guardar</div>
                </div>
              )}
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancelar</button>
              <button onClick={handleSave} style={S.saveBtn}>{editWine ? "Guardar" : "Agregar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={S.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...S.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "28px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
              <p style={{ color: "#e8ddd0", fontSize: 16, lineHeight: 1.6 }}>¿Eliminar <strong>{confirmDelete.nombre}</strong>?</p>
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setConfirmDelete(null)} style={S.cancelBtn}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ ...S.saveBtn, background: "linear-gradient(135deg, #8b3040, #6b2030)" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

function FF({ label, span, children }) { return <div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}><label style={S.label}>{label}</label>{children}</div>; }
function DRow({ label, value, highlight }) { if (!value) return null; return <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: "#6a5a4a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 15, color: highlight ? "#c9a44a" : "#e8ddd0", fontWeight: highlight ? 600 : 400 }}>{highlight ? "⏰ " : ""}{value}</div></div>; }

function DashboardView({ stats, wines, onDetail, fmtYear }) {
  const cepaEntries = Object.entries(stats.cepas).sort((a, b) => b[1] - a[1]);
  const tierEntries = Object.entries(stats.tiers).sort((a, b) => TIERS.indexOf(a[0]) - TIERS.indexOf(b[0]));
  const maxCepa = cepaEntries.length ? cepaEntries[0][1] : 1;
  const paisEntries = Object.entries(stats.paises).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={S.statsRow}>
        <SC icon="🍾" label="Total Vinos" value={stats.total} />
        <SC icon="🌍" label="Países" value={Object.keys(stats.paises).length} />
        <SC icon="📦" label="Cava 1" value={stats.cavas["Cava 1"] || 0} />
        <SC icon="📦" label="Cava 2" value={stats.cavas["Cava 2"] || 0} />
        <SC icon="⏰" label="Para Tomar Ya" value={stats.alertas.length} accent />
      </div>
      <div style={S.dashGrid}>
        <div style={{ ...S.card, gridColumn: "1 / -1" }}>
          <h3 style={S.cardTitle}>🏆 Ranking Automático <span style={{ fontSize: 11, color: "#6a5a4a", fontWeight: 400, fontFamily: "'DM Sans', sans-serif" }}> — calculado por puntaje críticos, tier, cosecha, rareza y guarda</span></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 0 }}>
            {wines.map(w => (
              <div key={w.id} className="top-row" style={S.topWineRow} onClick={() => onDetail(w)}>
                <div style={S.topRank}>#{w.ranking}</div>
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <div style={S.topName}>{w.nombre}</div>
                  <div style={S.topMeta}>{w.vina} · {w.cepa} · {w.ano}{w.puntajeCriticos ? ` · ${w.puntajeCriticos}pts` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#6a5a4a" }}>{w._score?.toFixed(0)}</div>
                  <div style={{ ...S.tierBadge, background: tierColor(w.tier), fontSize: 9 }}>{w.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <h3 style={S.cardTitle}>🍇 Por Cepa</h3>
          {cepaEntries.map(([cepa, count]) => (
            <div key={cepa} style={S.barRow}><div style={S.barLabel}>{cepa}</div><div style={S.barTrack}><div style={{ ...S.barFill, width: `${(count / maxCepa) * 100}%` }} /></div><div style={S.barValue}>{count}</div></div>
          ))}
        </div>
        <div style={S.card}>
          <h3 style={S.cardTitle}>🏷️ Por Categoría</h3>
          {tierEntries.map(([tier, count]) => (
            <div key={tier} style={S.tierRow}><div style={{ ...S.tierDot, background: tierColor(tier) }} /><div style={{ flex: 1, color: "#c9b8a8", fontSize: 14 }}>{tier}</div><div style={{ color: "#e8ddd0", fontWeight: 600, fontSize: 15 }}>{count}</div></div>
          ))}
          {paisEntries.length > 0 && (<><div style={{ borderTop: "1px solid rgba(160,100,80,0.1)", margin: "14px 0", paddingTop: 14 }}><div style={{ fontSize: 13, color: "#8a7a6a", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Por País</div></div>
          {paisEntries.map(([pais, count]) => (
            <div key={pais} style={S.tierRow}><div style={{ fontSize: 16, width: 24, textAlign: "center" }}>{pais === "Chile" ? "🇨🇱" : pais === "Sudáfrica" ? "🇿🇦" : pais === "Argentina" ? "🇦🇷" : pais === "Francia" ? "🇫🇷" : pais === "Italia" ? "🇮🇹" : pais === "España" ? "🇪🇸" : "🌍"}</div><div style={{ flex: 1, color: "#c9b8a8", fontSize: 14 }}>{pais}</div><div style={{ color: "#e8ddd0", fontWeight: 600, fontSize: 15 }}>{count}</div></div>
          ))}</>)}
        </div>
        <div style={S.card}>
          <h3 style={S.cardTitle}>🔔 Ventana Óptima Activa</h3>
          {stats.alertas.length === 0 ? <p style={S.emptyText}>No hay vinos en su ventana óptima aún</p> :
            stats.alertas.sort((a, b) => new Date(a.fechaOptima) - new Date(b.fechaOptima)).map(w => (
              <div key={w.id} className="top-row" style={S.alertRow} onClick={() => onDetail(w)}>
                <div style={{ flex: 1 }}><div style={S.topName}>{w.nombre}</div><div style={S.topMeta}>{w.vina} · Tomar antes de {fmtYear(w.fechaOptima)}</div></div>
                <div style={{ color: "#c9a44a", fontSize: 18 }}>⏰</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function tierColor(t) { return { "Ícono": "#c9a44a", "Super Premium": "#9b6b3d", "Premium": "#8b5e3c", "Gran Reserva": "#7a3b4e", "Reserva": "#5e3a50", "Reserva Privada": "#6e4a5a", "Varietal": "#4a3545" }[t] || "#5e3a50"; }
function SC({ icon, label, value, accent }) { return <div style={{ ...S.statCard, ...(accent && value > 0 ? { border: "1px solid #c9a44a55" } : {}) }}><div style={{ fontSize: 22 }}>{icon}</div><div style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: accent && value > 0 ? "#c9a44a" : "#e8ddd0" }}>{value}</div><div style={{ fontSize: 11, color: "#8a7a6a", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div></div>; }

function CollectionView({ wines, search, setSearch, filterCepa, setFilterCepa, filterTier, setFilterTier, filterCava, setFilterCava, sortBy, setSortBy, onEdit, onDelete, onDetail, fmtYear }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={S.filtersBar}>
        <input className="filter-input" style={{ ...S.input, flex: 2, minWidth: 160 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 120 }} value={filterCepa} onChange={e => setFilterCepa(e.target.value)}><option value="">Todas las cepas</option>{CEPAS.map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 110 }} value={filterTier} onChange={e => setFilterTier(e.target.value)}><option value="">Todos los tiers</option>{TIERS.map(t => <option key={t}>{t}</option>)}</select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 95 }} value={filterCava} onChange={e => setFilterCava(e.target.value)}><option value="">Ambas</option>{CAVAS.map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 120 }} value={sortBy} onChange={e => setSortBy(e.target.value)}><option value="ranking">Ranking</option><option value="puntaje">Puntaje</option><option value="ano">Cosecha</option><option value="nombre">Nombre</option><option value="tier">Tier</option></select>
      </div>
      <div style={{ color: "#8a7a6a", fontSize: 13, marginBottom: 16 }}>{wines.length} vino{wines.length !== 1 ? "s" : ""}</div>
      {wines.length === 0 ? <div style={S.emptyState}><div style={{ fontSize: 48, marginBottom: 12 }}>🍇</div><div style={{ color: "#8a7a6a", fontSize: 16 }}>Sin resultados</div></div> : (
        <div style={S.wineGrid}>
          {wines.map((w, i) => (
            <div key={w.id} className="wine-card" onClick={() => onDetail(w)} style={{ ...S.wineCard, animationDelay: `${i * 0.04}s`, cursor: "pointer" }}>
              <div style={S.wineCardTop}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ ...S.tierBadge, background: tierColor(w.tier) }}>{w.tier}</div>
                  <div style={S.rankBadge}>#{w.ranking}</div>
                </div>
                <div style={{ fontSize: 12, color: "#6a5a4a" }}>📍 {w.cava}</div>
              </div>
              <div style={S.wineName}>{w.nombre}</div>
              <div style={S.wineMeta}>{w.vina} · {w.ano}</div>
              <div style={S.wineMeta}>{w.cepa}{w.pais !== "Chile" ? ` · ${w.pais}` : ""}</div>
              {w.puntajeCriticos && <div style={{ marginTop: 6, fontSize: 12, color: "#c9a44a" }}>⭐ {w.puntajeCriticos} pts {w.fuenteCriticos ? `(${w.fuenteCriticos})` : ""}</div>}
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {w.produccion && <span style={{ ...S.badge, background: "rgba(100,100,120,0.12)", color: "#8a7a6a" }}>{w.produccion}</span>}
                {w.fechaOptima && new Date(w.fechaOptima) <= new Date() && <span style={{ ...S.badge, background: "rgba(201,164,74,0.15)", color: "#c9a44a" }}>⏰ Listo</span>}
                {w.fechaOptima && new Date(w.fechaOptima) > new Date() && <span style={{ ...S.badge, background: "rgba(100,100,120,0.1)", color: "#7a6a5a" }}>📅 {fmtYear(w.fechaOptima)}</span>}
              </div>
              <div style={S.wineActions}>
                <button className="action-btn" onClick={e => { e.stopPropagation(); onEdit(w); }} style={S.actionBtn}>Editar</button>
                <button className="action-btn" onClick={e => { e.stopPropagation(); onDelete(w); }} style={{ ...S.actionBtn, color: "#8b4050" }}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  app: { fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(170deg, #1a1015 0%, #2a1a20 40%, #1e1520 100%)", minHeight: "100vh", color: "#e8ddd0" },
  loadingScreen: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#1a1015" },
  loadingText: { fontFamily: "'Playfair Display', serif", color: "#c9a44a", fontSize: 20, animation: "pulse 1.5s infinite" },
  header: { background: "rgba(20,12,16,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(160,100,80,0.15)", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  logoArea: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 26 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8ddd0" },
  logoSub: { fontSize: 11, color: "#8a7a6a", letterSpacing: 1 },
  navArea: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  navBtn: { background: "transparent", border: "1px solid rgba(160,100,80,0.2)", color: "#8a7a6a", padding: "7px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.2s" },
  navBtnActive: { background: "rgba(160,100,80,0.15)", color: "#e8ddd0", borderColor: "rgba(160,100,80,0.4)" },
  addBtn: { background: "linear-gradient(135deg, #7a3b4e, #5a2838)", color: "#e8ddd0", border: "none", padding: "7px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  content: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 },
  statCard: { background: "rgba(40,28,35,0.7)", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: "1px solid rgba(160,100,80,0.1)", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" },
  dashGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 14 },
  card: { background: "rgba(40,28,35,0.6)", borderRadius: 12, padding: "20px 18px", border: "1px solid rgba(160,100,80,0.1)" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#e8ddd0", marginBottom: 14 },
  topWineRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderBottom: "1px solid rgba(160,100,80,0.08)", cursor: "pointer", transition: "background 0.2s", borderRadius: 6 },
  topRank: { fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: "#c9a44a", width: 30, flexShrink: 0, textAlign: "center" },
  topName: { fontSize: 13, fontWeight: 600, color: "#e8ddd0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topMeta: { fontSize: 11, color: "#8a7a6a", marginTop: 1 },
  tierBadge: { padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, color: "#fff", letterSpacing: 0.4, textTransform: "uppercase", whiteSpace: "nowrap" },
  rankBadge: { padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.2)", fontFamily: "'Playfair Display', serif" },
  rankBadgeDetail: { padding: "3px 10px", borderRadius: 4, fontSize: 14, fontWeight: 700, color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.2)", fontFamily: "'Playfair Display', serif" },
  barRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  barLabel: { width: 100, fontSize: 12, color: "#c9b8a8", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  barTrack: { flex: 1, height: 7, background: "rgba(60,40,50,0.5)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg, #7a3b4e, #c9a44a)", borderRadius: 4, transition: "width 0.6s ease" },
  barValue: { width: 22, fontSize: 12, color: "#e8ddd0", fontWeight: 600, textAlign: "right" },
  tierRow: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(160,100,80,0.06)" },
  tierDot: { width: 11, height: 11, borderRadius: "50%", flexShrink: 0 },
  alertRow: { display: "flex", alignItems: "center", gap: 12, padding: "9px 8px", borderBottom: "1px solid rgba(160,100,80,0.08)", cursor: "pointer", borderRadius: 6, transition: "background 0.2s" },
  filtersBar: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  wineGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  wineCard: { background: "rgba(40,28,35,0.65)", borderRadius: 12, padding: "16px 14px", border: "1px solid rgba(160,100,80,0.1)", animation: "slideUp 0.4s ease both", transition: "all 0.3s ease" },
  wineCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  wineName: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#e8ddd0", marginBottom: 3, lineHeight: 1.3 },
  wineMeta: { fontSize: 12, color: "#8a7a6a", lineHeight: 1.4 },
  badge: { padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600 },
  wineActions: { display: "flex", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(160,100,80,0.1)" },
  actionBtn: { background: "transparent", border: "none", color: "#8a7a6a", cursor: "pointer", fontSize: 11, fontWeight: 500, padding: "3px 6px", borderRadius: 4, transition: "color 0.2s" },
  emptyState: { textAlign: "center", padding: "50px 20px" },
  emptyText: { color: "#6a5a4a", fontSize: 13 },
  overlay: { position: "fixed", inset: 0, background: "rgba(10,6,8,0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "30px 14px", zIndex: 200, overflowY: "auto" },
  modal: { background: "linear-gradient(170deg, #2e2028, #1e1520)", borderRadius: 14, width: "100%", maxWidth: 640, border: "1px solid rgba(160,100,80,0.2)", animation: "slideUp 0.3s ease" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderBottom: "1px solid rgba(160,100,80,0.1)" },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: "#e8ddd0" },
  closeBtn: { background: "transparent", border: "none", color: "#8a7a6a", fontSize: 18, cursor: "pointer", padding: 4 },
  modalBody: { padding: "18px 20px", maxHeight: "60vh", overflowY: "auto" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid rgba(160,100,80,0.1)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { display: "block", fontSize: 11, color: "#8a7a6a", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 },
  input: { width: "100%", padding: "9px 11px", background: "rgba(20,14,18,0.6)", border: "1px solid rgba(160,100,80,0.2)", borderRadius: 6, color: "#e8ddd0", fontSize: 13, outline: "none", transition: "border-color 0.2s" },
  cancelBtn: { background: "transparent", border: "1px solid rgba(160,100,80,0.2)", color: "#8a7a6a", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  saveBtn: { background: "linear-gradient(135deg, #7a3b4e, #5a2838)", color: "#e8ddd0", border: "none", padding: "9px 22px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(40,28,35,0.95)", border: "1px solid rgba(200,164,74,0.3)", color: "#e8ddd0", padding: "12px 24px", borderRadius: 8, fontSize: 14, zIndex: 300, animation: "toastIn 0.3s ease", backdropFilter: "blur(10px)" },
};
