import { useState, useEffect, useCallback, useMemo } from "react";

const TIERS = ["Ícono", "Super Premium", "Premium", "Gran Reserva", "Reserva", "Reserva Privada", "Varietal"];
const CAVAS = ["Cava 1", "Cava 2"];
const CEPAS = [
  "Cabernet Sauvignon", "Carmenere", "Merlot", "Syrah", "Pinot Noir", "Malbec",
  "Cabernet Franc", "Petit Verdot", "Tempranillo", "Sangiovese", "Nebbiolo",
  "Garnacha", "Petite Sirah", "Pinotage", "Carignan",
  "Chardonnay", "Sauvignon Blanc", "Riesling", "Viognier", "Gewürztraminer",
  "Pinot Grigio", "Blend Tinto", "Blend Blanco", "Rosé", "Espumante", "Otro"
];
const PAISES = ["Chile", "Argentina", "Francia", "Italia", "España", "Australia", "USA", "Sudáfrica", "Nueva Zelanda", "Alemania", "Portugal", "Otro"];

const INITIAL_WINES = [
  { id: "w01", nombre: 'Maquis "Franco"', cepa: "Cabernet Franc", ano: 2019, vina: "Viña Maquis", valle: "Valle de Colchagua", pais: "Chile", ranking: 1, tier: "Ícono", cava: "Cava 1", fechaOptima: "2035-01-01", maridaje: "Cordero, caza mayor, quesos añejos" },
  { id: "w02", nombre: 'VIK "Milla Cala"', cepa: "Blend Tinto", ano: 2021, vina: "Viña VIK", valle: "Millahue, Valle de Cachapoal", pais: "Chile", ranking: 2, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2035-01-01", maridaje: "Carnes rojas, estofados, quesos semiduros" },
  { id: "w03", nombre: 'Santa Ema "Catalina"', cepa: "Blend Tinto", ano: 2017, vina: "Viña Santa Ema", valle: "Maipo Alto (Pirque)", pais: "Chile", ranking: 3, tier: "Ícono", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Lomo de res, cordero al horno, risotto de hongos" },
  { id: "w04", nombre: 'Tarapacá "Gran Reserva Etiqueta Azul"', cepa: "Blend Tinto", ano: 2021, vina: "Viña Tarapacá", valle: "Valle del Maipo (Isla de Maipo)", pais: "Chile", ranking: 4, tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "2032-01-01", maridaje: "Asado, costillar, carnes a la parrilla" },
  { id: "w05", nombre: "Montes Alpha Ed. Limitada 30 Años", cepa: "Cabernet Sauvignon", ano: 2018, vina: "Viña Montes", valle: "Valle de Colchagua (Apalta)", pais: "Chile", ranking: 5, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2032-01-01", maridaje: "Filete, entrecot, quesos duros añejos" },
  { id: "w06", nombre: 'Valdivieso "Caballo Loco Grand Cru"', cepa: "Blend Tinto", ano: 2020, vina: "Viña Valdivieso", valle: "Maipo Alto", pais: "Chile", ranking: 6, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2032-01-01", maridaje: "Ciervo, jabalí, carnes de caza" },
  { id: "w07", nombre: 'Concha y Toro "Terrunyo" Carmenère', cepa: "Carmenere", ano: 2021, vina: "Viña Concha y Toro", valle: "Valle de Cachapoal (Peumo)", pais: "Chile", ranking: 7, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Cerdo glaseado, pato, pastas con ragú" },
  { id: "w08", nombre: 'Santa Rita "Bougainville" Petite Sirah', cepa: "Petite Sirah", ano: 2022, vina: "Viña Santa Rita", valle: "Maipo Alto (Alto Jahuel)", pais: "Chile", ranking: 8, tier: "Ícono", cava: "Cava 1", fechaOptima: "2037-01-01", maridaje: "Estofado de res, costillas BBQ, queso azul" },
  { id: "w09", nombre: 'Undurraga "Cauquén" Garnacha', cepa: "Garnacha", ano: 2020, vina: "Viña Undurraga", valle: "Valle del Maule (Cauquenes)", pais: "Chile", ranking: 9, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2028-01-01", maridaje: "Paella, charcutería, tapas mediterráneas" },
  { id: "w10", nombre: 'Undurraga "Red Field Blend"', cepa: "Blend Tinto", ano: 2020, vina: "Viña Undurraga", valle: "Valle del Maule (Cauquenes)", pais: "Chile", ranking: 10, tier: "Super Premium", cava: "Cava 1", fechaOptima: "2029-01-01", maridaje: "Guisos campestres, empanadas, cazuela" },
  { id: "w11", nombre: 'Bestias "Bestia Negra"', cepa: "Carmenere", ano: 2017, vina: "Viña Requingua", valle: "Valle de Colchagua", pais: "Chile", ranking: 11, tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "2028-01-01", maridaje: "Asado argentino, hamburguesas gourmet" },
  { id: "w12", nombre: 'San Pedro "Sideral"', cepa: "Blend Tinto", ano: 2021, vina: "Viña San Pedro (Altair)", valle: "Cachapoal Andes (Alto Cachapoal)", pais: "Chile", ranking: 12, tier: "Premium", cava: "Cava 1", fechaOptima: "2030-01-01", maridaje: "Rib eye, pasta al ragú, cordero" },
  { id: "w13", nombre: "Groot Constantia Pinotage", cepa: "Pinotage", ano: 2021, vina: "Groot Constantia Estate", valle: "Constantia", pais: "Sudáfrica", ranking: 13, tier: "Gran Reserva", cava: "Cava 2", fechaOptima: "2032-01-01", maridaje: "Bobotie, carnes ahumadas, BBQ sudafricano" },
  { id: "w14", nombre: 'Garcés Silva "Boya" Cabernet Franc', cepa: "Cabernet Franc", ano: 2018, vina: "Viñedos Garcés Silva", valle: "Valle de Leyda", pais: "Chile", ranking: 14, tier: "Reserva", cava: "Cava 2", fechaOptima: "2026-01-01", maridaje: "Pollo al horno, vegetales grillados, queso de cabra" },
];

const emptyWine = {
  id: "", nombre: "", cepa: "", ano: new Date().getFullYear(), vina: "", valle: "", pais: "Chile",
  ranking: "", tier: "Gran Reserva", cava: "Cava 1", fechaOptima: "", maridaje: ""
};

const STORAGE_KEY = "cava-wines-v4";

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.length > 0) { setWines(data); setLoading(false); return; }
      }
    } catch { }
    setShowImport(true);
    setLoading(false);
  }, []);

  const persist = useCallback((data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleImport = () => {
    setWines(INITIAL_WINES);
    persist(INITIAL_WINES);
    setShowImport(false);
    showToast(`✓ ${INITIAL_WINES.length} vinos importados exitosamente`);
  };

  const handleSkipImport = () => { setShowImport(false); };

  const handleSave = () => {
    if (!form.nombre || !form.vina) { showToast("⚠️ Nombre y Viña son obligatorios"); return; }
    const rankNum = form.ranking === "" ? null : parseInt(form.ranking);
    const wineData = { ...form, ranking: rankNum };
    let updated;
    if (editWine) {
      updated = wines.map(w => w.id === editWine.id ? { ...wineData, id: editWine.id } : w);
    } else {
      updated = [...wines, { ...wineData, id: Date.now().toString() }];
    }
    setWines(updated);
    persist(updated);
    setShowModal(false);
    setEditWine(null);
    setForm({ ...emptyWine });
    showToast(editWine ? "✓ Vino actualizado" : "✓ Vino agregado a la cava");
  };

  const handleDelete = (id) => {
    const updated = wines.filter(w => w.id !== id);
    setWines(updated);
    persist(updated);
    setConfirmDelete(null);
    setDetailWine(null);
    showToast("Vino eliminado");
  };

  const openEdit = (wine) => { setEditWine(wine); setForm({ ...wine, ranking: wine.ranking ?? "" }); setShowModal(true); setDetailWine(null); };
  const openAdd = () => {
    const nextRank = wines.length > 0 ? Math.max(...wines.map(w => w.ranking || 0)) + 1 : 1;
    setEditWine(null);
    setForm({ ...emptyWine, ranking: nextRank });
    setShowModal(true);
  };

  const filtered = useMemo(() => {
    let f = wines.filter(w => {
      if (filterCepa && w.cepa !== filterCepa) return false;
      if (filterTier && w.tier !== filterTier) return false;
      if (filterCava && w.cava !== filterCava) return false;
      if (search) {
        const s = search.toLowerCase();
        return w.nombre.toLowerCase().includes(s) || w.vina.toLowerCase().includes(s) || w.valle.toLowerCase().includes(s) || w.cepa.toLowerCase().includes(s);
      }
      return true;
    });
    f.sort((a, b) => {
      if (sortBy === "ranking") return (a.ranking || 999) - (b.ranking || 999);
      if (sortBy === "ano") return b.ano - a.ano;
      if (sortBy === "nombre") return a.nombre.localeCompare(b.nombre);
      if (sortBy === "tier") return TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier);
      return 0;
    });
    return f;
  }, [wines, search, filterCepa, filterTier, filterCava, sortBy]);

  const stats = useMemo(() => {
    const total = wines.length;
    const cepas = {};
    const tiers = {};
    const paises = {};
    const cavas = { "Cava 1": 0, "Cava 2": 0 };
    wines.forEach(w => {
      if (w.cepa) cepas[w.cepa] = (cepas[w.cepa] || 0) + 1;
      tiers[w.tier] = (tiers[w.tier] || 0) + 1;
      paises[w.pais] = (paises[w.pais] || 0) + 1;
      if (w.cava) cavas[w.cava] = (cavas[w.cava] || 0) + 1;
    });
    const now = new Date();
    const alertas = wines.filter(w => {
      if (!w.fechaOptima) return false;
      return new Date(w.fechaOptima) <= now;
    });
    return { total, cepas, tiers, paises, cavas, alertas };
  }, [wines]);

  const fmtYear = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.getFullYear().toString();
  };

  if (loading) return <div style={S.loadingScreen}><div style={S.loadingText}>Cargando tu cava...</div></div>;

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(30,20,25,0.5); }
        ::-webkit-scrollbar-thumb { background: rgba(160,100,80,0.4); border-radius: 3px; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes toastIn { from { opacity:0; transform: translate(-50%,20px); } to { opacity:1; transform: translate(-50%,0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .wine-card:hover { border-color: rgba(201,164,74,0.35) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .action-btn:hover { color: #e8ddd0 !important; }
        .nav-btn:hover { background: rgba(160,100,80,0.1); color: #c9b8a8; }
        .filter-input:focus { border-color: rgba(201,164,74,0.4) !important; }
        .top-row:hover { background: rgba(201,164,74,0.05); }
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
            {["dashboard", "coleccion"].map(v => (
              <button key={v} className="nav-btn" onClick={() => setView(v)} style={{ ...S.navBtn, ...(view === v ? S.navBtnActive : {}) }}>
                {v === "dashboard" ? "Dashboard" : "Colección"}
              </button>
            ))}
            <button onClick={openAdd} style={S.addBtn}>+ Agregar Vino</button>
          </div>
        </div>
      </div>

      <div style={S.content}>
        {view === "dashboard" ? (
          <DashboardView stats={stats} wines={wines} onEdit={openEdit} onDetail={setDetailWine} fmtYear={fmtYear} />
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

      {/* Import Dialog */}
      {showImport && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: 480 }}>
            <div style={{ padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#e8ddd0", marginBottom: 8 }}>Bienvenido a tu Cava</h2>
              <p style={{ color: "#8a7a6a", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                Tengo {INITIAL_WINES.length} vinos de tu ranking listos para cargar. ¿Importar la colección?
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={handleSkipImport} style={S.cancelBtn}>Empezar Vacío</button>
                <button onClick={handleImport} style={{ ...S.saveBtn, padding: "12px 28px", fontSize: 14 }}>Importar {INITIAL_WINES.length} Vinos</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wine Detail Panel */}
      {detailWine && (
        <div style={S.overlay} onClick={() => setDetailWine(null)}>
          <div style={{ ...S.modal, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "24px 24px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ ...S.tierBadge, background: tierColor(detailWine.tier) }}>{detailWine.tier}</div>
                    <div style={S.rankBadgeDetail}>#{detailWine.ranking}</div>
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#e8ddd0", fontWeight: 700, lineHeight: 1.3 }}>{detailWine.nombre}</h2>
                  <div style={{ color: "#9a8a7a", fontSize: 15, marginTop: 6 }}>{detailWine.vina} · {detailWine.ano}</div>
                </div>
                <button onClick={() => setDetailWine(null)} style={S.closeBtn}>✕</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={S.detailGrid}>
                <DetailRow label="Cepa" value={detailWine.cepa} />
                <DetailRow label="Valle / Región" value={detailWine.valle} />
                <DetailRow label="País" value={detailWine.pais} />
                <DetailRow label="Cava" value={detailWine.cava} />
                {detailWine.fechaOptima && (
                  <DetailRow label="Tomar antes de" value={fmtYear(detailWine.fechaOptima)} highlight={new Date(detailWine.fechaOptima) <= new Date()} />
                )}
              </div>
              {detailWine.maridaje && (
                <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(201,164,74,0.06)", borderRadius: 8, border: "1px solid rgba(201,164,74,0.1)" }}>
                  <div style={{ fontSize: 11, color: "#c9a44a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🍽️ Maridaje</div>
                  <div style={{ fontSize: 14, color: "#c9b8a8", lineHeight: 1.5 }}>{detailWine.maridaje}</div>
                </div>
              )}
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setConfirmDelete(detailWine)} style={{ ...S.cancelBtn, color: "#8b4050", borderColor: "rgba(139,64,80,0.3)" }}>Eliminar</button>
              <button onClick={() => openEdit(detailWine)} style={S.saveBtn}>Editar</button>
            </div>
          </div>
        </div>
      )}

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
                <FormField label="Nombre del Vino *" span={2}>
                  <input className="filter-input" style={S.input} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder='Ej: Don Melchor' />
                </FormField>
                <FormField label="Viña *">
                  <input className="filter-input" style={S.input} value={form.vina} onChange={e => setForm({ ...form, vina: e.target.value })} placeholder="Ej: Concha y Toro" />
                </FormField>
                <FormField label="Cepa">
                  <select className="filter-input" style={S.input} value={form.cepa} onChange={e => setForm({ ...form, cepa: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {CEPAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Cosecha (Año)">
                  <input className="filter-input" style={S.input} type="number" min="1900" max="2030" value={form.ano} onChange={e => setForm({ ...form, ano: parseInt(e.target.value) || 2024 })} />
                </FormField>
                <FormField label="Valle / Región">
                  <input className="filter-input" style={S.input} value={form.valle} onChange={e => setForm({ ...form, valle: e.target.value })} placeholder="Ej: Valle del Maipo" />
                </FormField>
                <FormField label="País">
                  <select className="filter-input" style={S.input} value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })}>
                    {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormField>
                <FormField label="Categoría / Tier">
                  <select className="filter-input" style={S.input} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}>
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Ranking (1 = mejor)">
                  <input className="filter-input" style={S.input} type="number" min="1" max="999" value={form.ranking} onChange={e => setForm({ ...form, ranking: e.target.value })} placeholder="Ej: 1" />
                </FormField>
                <FormField label="Cava">
                  <select className="filter-input" style={S.input} value={form.cava} onChange={e => setForm({ ...form, cava: e.target.value })}>
                    {CAVAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Tomar antes de (año)">
                  <input className="filter-input" style={S.input} type="number" min="2024" max="2060" value={form.fechaOptima ? new Date(form.fechaOptima).getFullYear() || "" : ""} onChange={e => {
                    const yr = parseInt(e.target.value);
                    setForm({ ...form, fechaOptima: yr ? `${yr}-01-01` : "" });
                  }} placeholder="Ej: 2032" />
                </FormField>
                <FormField label="Maridaje" span={2}>
                  <input className="filter-input" style={S.input} value={form.maridaje} onChange={e => setForm({ ...form, maridaje: e.target.value })} placeholder="Ej: Cordero, quesos duros, pastas" />
                </FormField>
              </div>
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancelar</button>
              <button onClick={handleSave} style={S.saveBtn}>{editWine ? "Guardar Cambios" : "Agregar a la Cava"}</button>
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
              <p style={{ color: "#e8ddd0", fontSize: 16, lineHeight: 1.6 }}>¿Eliminar <strong>{confirmDelete.nombre}</strong> de tu cava?</p>
              <p style={{ color: "#6a5a4a", fontSize: 13, marginTop: 8 }}>Esta acción no se puede deshacer.</p>
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

function FormField({ label, span, children }) {
  return (
    <div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#6a5a4a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, color: highlight ? "#c9a44a" : "#e8ddd0", fontWeight: highlight ? 600 : 400 }}>
        {highlight ? "⏰ " : ""}{value}
      </div>
    </div>
  );
}

function DashboardView({ stats, wines, onEdit, onDetail, fmtYear }) {
  const topWines = [...wines].sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).slice(0, 6);
  const cepaEntries = Object.entries(stats.cepas).sort((a, b) => b[1] - a[1]);
  const tierEntries = Object.entries(stats.tiers).sort((a, b) => TIERS.indexOf(a[0]) - TIERS.indexOf(b[0]));
  const maxCepa = cepaEntries.length ? cepaEntries[0][1] : 1;
  const paisEntries = Object.entries(stats.paises).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={S.statsRow}>
        <StatCard icon="🍾" label="Total Vinos" value={stats.total} />
        <StatCard icon="🌍" label="Países" value={Object.keys(stats.paises).length} />
        <StatCard icon="📦" label="Cava 1" value={stats.cavas["Cava 1"] || 0} />
        <StatCard icon="📦" label="Cava 2" value={stats.cavas["Cava 2"] || 0} />
        <StatCard icon="⏰" label="Para Tomar Ya" value={stats.alertas.length} accent />
      </div>

      <div style={S.dashGrid}>
        {/* Ranking completo */}
        <div style={{ ...S.card, gridColumn: "1 / -1" }}>
          <h3 style={S.cardTitle}>🏆 Ranking Completo</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 0 }}>
            {[...wines].sort((a, b) => (a.ranking || 999) - (b.ranking || 999)).map((w) => (
              <div key={w.id} className="top-row" style={S.topWineRow} onClick={() => onDetail(w)}>
                <div style={S.topRank}>#{w.ranking}</div>
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <div style={S.topName}>{w.nombre}</div>
                  <div style={S.topMeta}>{w.vina} · {w.cepa} · {w.ano}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ ...S.tierBadge, background: tierColor(w.tier), fontSize: 10 }}>{w.tier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por cepa */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>🍇 Por Cepa</h3>
          {cepaEntries.length === 0 ? (
            <p style={S.emptyText}>Sin datos aún</p>
          ) : cepaEntries.map(([cepa, count]) => (
            <div key={cepa} style={S.barRow}>
              <div style={S.barLabel}>{cepa}</div>
              <div style={S.barTrack}>
                <div style={{ ...S.barFill, width: `${(count / maxCepa) * 100}%` }} />
              </div>
              <div style={S.barValue}>{count}</div>
            </div>
          ))}
        </div>

        {/* Por tier */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>🏷️ Por Categoría</h3>
          {tierEntries.length === 0 ? (
            <p style={S.emptyText}>Sin datos aún</p>
          ) : tierEntries.map(([tier, count]) => (
            <div key={tier} style={S.tierRow}>
              <div style={{ ...S.tierDot, background: tierColor(tier) }} />
              <div style={{ flex: 1, color: "#c9b8a8", fontSize: 14 }}>{tier}</div>
              <div style={{ color: "#e8ddd0", fontWeight: 600, fontSize: 15 }}>{count}</div>
            </div>
          ))}
          {paisEntries.length > 0 && (
            <>
              <div style={{ borderTop: "1px solid rgba(160,100,80,0.1)", margin: "14px 0", paddingTop: 14 }}>
                <div style={{ fontSize: 13, color: "#8a7a6a", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Por País</div>
              </div>
              {paisEntries.map(([pais, count]) => (
                <div key={pais} style={S.tierRow}>
                  <div style={{ fontSize: 16, width: 24, textAlign: "center" }}>{pais === "Chile" ? "🇨🇱" : pais === "Argentina" ? "🇦🇷" : pais === "Francia" ? "🇫🇷" : pais === "Sudáfrica" ? "🇿🇦" : pais === "Italia" ? "🇮🇹" : pais === "España" ? "🇪🇸" : "🌍"}</div>
                  <div style={{ flex: 1, color: "#c9b8a8", fontSize: 14 }}>{pais}</div>
                  <div style={{ color: "#e8ddd0", fontWeight: 600, fontSize: 15 }}>{count}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Alertas */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>🔔 Ventana Óptima Activa</h3>
          {stats.alertas.length === 0 ? (
            <p style={S.emptyText}>No hay vinos en su ventana óptima aún</p>
          ) : stats.alertas.sort((a, b) => new Date(a.fechaOptima) - new Date(b.fechaOptima)).map(w => (
            <div key={w.id} className="top-row" style={S.alertRow} onClick={() => onDetail(w)}>
              <div style={{ flex: 1 }}>
                <div style={S.topName}>{w.nombre}</div>
                <div style={S.topMeta}>{w.vina} · Tomar antes de {fmtYear(w.fechaOptima)}</div>
              </div>
              <div style={{ color: "#c9a44a", fontSize: 18 }}>⏰</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tierColor(tier) {
  const m = { "Ícono": "#c9a44a", "Super Premium": "#9b6b3d", "Premium": "#8b5e3c", "Gran Reserva": "#7a3b4e", "Reserva": "#5e3a50", "Reserva Privada": "#6e4a5a", "Varietal": "#4a3545" };
  return m[tier] || "#5e3a50";
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div style={{ ...S.statCard, ...(accent && value > 0 ? { border: "1px solid #c9a44a55" } : {}) }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: accent && value > 0 ? "#c9a44a" : "#e8ddd0" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#8a7a6a", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

function CollectionView({ wines, search, setSearch, filterCepa, setFilterCepa, filterTier, setFilterTier, filterCava, setFilterCava, sortBy, setSortBy, onEdit, onDelete, onDetail, fmtYear }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={S.filtersBar}>
        <input className="filter-input" style={{ ...S.input, flex: 2, minWidth: 180 }} placeholder="Buscar por nombre, viña, valle o cepa..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 130 }} value={filterCepa} onChange={e => setFilterCepa(e.target.value)}>
          <option value="">Todas las cepas</option>
          {CEPAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 120 }} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
          <option value="">Todos los tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 100 }} value={filterCava} onChange={e => setFilterCava(e.target.value)}>
          <option value="">Ambas cavas</option>
          {CAVAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-input" style={{ ...S.input, flex: 1, minWidth: 130 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="ranking">Ordenar: Ranking</option>
          <option value="ano">Ordenar: Cosecha</option>
          <option value="nombre">Ordenar: Nombre</option>
          <option value="tier">Ordenar: Tier</option>
        </select>
      </div>

      <div style={{ color: "#8a7a6a", fontSize: 13, marginBottom: 16 }}>{wines.length} vino{wines.length !== 1 ? "s" : ""}</div>

      {wines.length === 0 ? (
        <div style={S.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍇</div>
          <div style={{ color: "#8a7a6a", fontSize: 16 }}>No hay vinos que coincidan con tu búsqueda</div>
        </div>
      ) : (
        <div style={S.wineGrid}>
          {wines.map((w, i) => (
            <div key={w.id} className="wine-card" onClick={() => onDetail(w)}
              style={{ ...S.wineCard, animationDelay: `${i * 0.04}s`, cursor: "pointer" }}>
              <div style={S.wineCardTop}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ ...S.tierBadge, background: tierColor(w.tier) }}>{w.tier}</div>
                  {w.ranking && <div style={S.rankBadge}>#{w.ranking}</div>}
                </div>
                <div style={{ fontSize: 12, color: "#6a5a4a" }}>📍 {w.cava}</div>
              </div>
              <div style={S.wineName}>{w.nombre}</div>
              <div style={S.wineMeta}>{w.vina} · {w.ano}</div>
              <div style={S.wineMeta}>{w.cepa}{w.pais !== "Chile" ? ` · ${w.pais}` : ""}</div>
              {w.valle && <div style={{ ...S.wineMeta, fontSize: 12 }}>{w.valle}</div>}
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {w.fechaOptima && (
                  <span style={{ ...S.badge, background: new Date(w.fechaOptima) <= new Date() ? "rgba(201,164,74,0.15)" : "rgba(100,100,120,0.1)", color: new Date(w.fechaOptima) <= new Date() ? "#c9a44a" : "#7a6a5a" }}>
                    {new Date(w.fechaOptima) <= new Date() ? "⏰" : "📅"} {fmtYear(w.fechaOptima)}
                  </span>
                )}
              </div>
              {w.maridaje && <div style={{ marginTop: 8, fontSize: 12, color: "#7a6a5a" }}>🍽️ {w.maridaje}</div>}
              <div style={S.wineActions}>
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); onEdit(w); }} style={S.actionBtn}>Editar</button>
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); onDelete(w); }} style={{ ...S.actionBtn, color: "#8b4050" }}>Eliminar</button>
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
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  logoArea: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 28 },
  logoTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#e8ddd0", letterSpacing: 0.5 },
  logoSub: { fontSize: 12, color: "#8a7a6a", letterSpacing: 1 },
  navArea: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  navBtn: { background: "transparent", border: "1px solid rgba(160,100,80,0.2)", color: "#8a7a6a", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s" },
  navBtnActive: { background: "rgba(160,100,80,0.15)", color: "#e8ddd0", borderColor: "rgba(160,100,80,0.4)" },
  addBtn: { background: "linear-gradient(135deg, #7a3b4e, #5a2838)", color: "#e8ddd0", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  content: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 },
  statCard: { background: "rgba(40,28,35,0.7)", borderRadius: 10, padding: "16px 14px", textAlign: "center", border: "1px solid rgba(160,100,80,0.1)", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" },
  dashGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 },
  card: { background: "rgba(40,28,35,0.6)", borderRadius: 12, padding: "22px 20px", border: "1px solid rgba(160,100,80,0.1)" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: "#e8ddd0", marginBottom: 16, letterSpacing: 0.3 },
  topWineRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: "1px solid rgba(160,100,80,0.08)", cursor: "pointer", transition: "background 0.2s", borderRadius: 6 },
  topRank: { fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#c9a44a", width: 32, flexShrink: 0, textAlign: "center" },
  topName: { fontSize: 14, fontWeight: 600, color: "#e8ddd0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  topMeta: { fontSize: 12, color: "#8a7a6a", marginTop: 2 },
  tierBadge: { padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 600, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" },
  rankBadge: { padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.2)", fontFamily: "'Playfair Display', serif" },
  rankBadgeDetail: { padding: "4px 10px", borderRadius: 4, fontSize: 14, fontWeight: 700, color: "#c9a44a", background: "rgba(201,164,74,0.1)", border: "1px solid rgba(201,164,74,0.2)", fontFamily: "'Playfair Display', serif" },
  barRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  barLabel: { width: 110, fontSize: 13, color: "#c9b8a8", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  barTrack: { flex: 1, height: 8, background: "rgba(60,40,50,0.5)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg, #7a3b4e, #c9a44a)", borderRadius: 4, transition: "width 0.6s ease" },
  barValue: { width: 24, fontSize: 13, color: "#e8ddd0", fontWeight: 600, textAlign: "right" },
  tierRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(160,100,80,0.06)" },
  tierDot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
  alertRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: "1px solid rgba(160,100,80,0.08)", cursor: "pointer", borderRadius: 6, transition: "background 0.2s" },
  filtersBar: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 },
  wineGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 },
  wineCard: { background: "rgba(40,28,35,0.65)", borderRadius: 12, padding: "18px 16px", border: "1px solid rgba(160,100,80,0.1)", animation: "slideUp 0.4s ease both", transition: "all 0.3s ease" },
  wineCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  wineName: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: "#e8ddd0", marginBottom: 4, lineHeight: 1.3 },
  wineMeta: { fontSize: 13, color: "#8a7a6a", lineHeight: 1.5 },
  badge: { padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  wineActions: { display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(160,100,80,0.1)" },
  actionBtn: { background: "transparent", border: "none", color: "#8a7a6a", cursor: "pointer", fontSize: 12, fontWeight: 500, padding: "4px 8px", borderRadius: 4, transition: "color 0.2s" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyText: { color: "#6a5a4a", fontSize: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(10,6,8,0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px 16px", zIndex: 200, overflowY: "auto" },
  modal: { background: "linear-gradient(170deg, #2e2028, #1e1520)", borderRadius: 14, width: "100%", maxWidth: 640, border: "1px solid rgba(160,100,80,0.2)", animation: "slideUp 0.3s ease" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 22px", borderBottom: "1px solid rgba(160,100,80,0.1)" },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#e8ddd0" },
  closeBtn: { background: "transparent", border: "none", color: "#8a7a6a", fontSize: 18, cursor: "pointer", padding: 4 },
  modalBody: { padding: "20px 22px", maxHeight: "60vh", overflowY: "auto" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: "1px solid rgba(160,100,80,0.1)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  label: { display: "block", fontSize: 12, color: "#8a7a6a", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 500 },
  input: { width: "100%", padding: "10px 12px", background: "rgba(20,14,18,0.6)", border: "1px solid rgba(160,100,80,0.2)", borderRadius: 6, color: "#e8ddd0", fontSize: 14, outline: "none", transition: "border-color 0.2s" },
  cancelBtn: { background: "transparent", border: "1px solid rgba(160,100,80,0.2)", color: "#8a7a6a", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 },
  saveBtn: { background: "linear-gradient(135deg, #7a3b4e, #5a2838)", color: "#e8ddd0", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(40,28,35,0.95)", border: "1px solid rgba(200,164,74,0.3)", color: "#e8ddd0", padding: "12px 24px", borderRadius: 8, fontSize: 14, zIndex: 300, animation: "toastIn 0.3s ease", backdropFilter: "blur(10px)" },
};
