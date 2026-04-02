export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' });
  }

  try {
    const { nombre, vina, cepa, ano, valle, pais, tier } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Investiga este vino: "${nombre}" de ${vina}, cepa ${cepa}, cosecha ${ano}, origen ${valle || pais}, categoría ${tier}.

Busca en la web información sobre este vino y devuelve SOLAMENTE un objeto JSON (sin markdown, sin backticks, sin explicación) con estos campos:

{
  "puntajeCriticos": número entre 85 y 100 (el puntaje más alto de un crítico reconocido como Tim Atkin, James Suckling, Wine Enthusiast, Descorchados, Wine Spectator, Wine Advocate, Vinous. Si no encuentras puntaje, estima basado en la calidad del productor y tier),
  "fuenteCriticos": string con el nombre del crítico que dio el puntaje,
  "produccion": string, uno de exactamente estos valores: "Ultra limitado", "Limitado", "Moderado", "Amplio",
  "maridaje": string de máximo 60 caracteres con sugerencia de maridaje,
  "fechaOptimaAno": número del año óptimo límite para consumir (ej: 2032)
}

IMPORTANTE: Responde SOLO el JSON. Sin texto antes ni después.`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Anthropic API error' });
    }

    const texts = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
    const clean = texts.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Research error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
