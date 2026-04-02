export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const { nombre, vina, cepa, ano, valle, pais, tier } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: `Investiga este vino: "${nombre}" de ${vina}, cepa ${cepa}, cosecha ${ano}, origen ${valle || pais}, categoría ${tier}.

Busca en la web: puntajes de críticos, precio promedio de venta en Chile (CLP) o internacional (USD, convertir a CLP aprox ×950), nivel de producción, maridaje, y ventana óptima de consumo (año inicio y año fin).

Devuelve SOLAMENTE un JSON (sin markdown, sin backticks):
{
  "puntajeCriticos": número 85-100 (puntaje más alto de Tim Atkin, James Suckling, Wine Enthusiast, Descorchados, Wine Spectator, Wine Advocate, Vinous),
  "fuenteCriticos": "nombre del crítico",
  "produccion": "Ultra limitado" | "Limitado" | "Moderado" | "Amplio",
  "maridaje": "sugerencia máximo 60 caracteres",
  "ventanaDesdeAno": número del año en que el vino entra en su mejor momento,
  "ventanaHastaAno": número del año límite para consumirlo en su punto,
  "precioPromedio": número en CLP del precio promedio retail
}
SOLO el JSON.` }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    const texts = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
    return res.status(200).json(JSON.parse(texts.replace(/```json|```/g, "").trim()));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
