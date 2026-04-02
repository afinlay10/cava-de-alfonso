export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const { image, mediaType } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType || "image/jpeg", data: image }
            },
            {
              type: "text",
              text: `Analiza esta etiqueta de vino. Extrae toda la información visible.

Devuelve SOLAMENTE un JSON (sin markdown, sin backticks):
{
  "nombre": "nombre del vino tal como aparece en la etiqueta",
  "vina": "nombre de la viña/bodega/producer",
  "cepa": "variedad de uva (debe ser una de: Cabernet Sauvignon, Carmenere, Merlot, Syrah, Pinot Noir, Malbec, Cabernet Franc, Petit Verdot, Tempranillo, Sangiovese, Nebbiolo, Garnacha, Petite Sirah, Pinotage, Carignan, Chardonnay, Sauvignon Blanc, Riesling, Viognier, Gewürztraminer, Pinot Grigio, Blend Tinto, Blend Blanco, Rosé, Espumante, Otro)",
  "ano": número del año de cosecha,
  "valle": "valle o región de origen",
  "pais": "país (debe ser: Chile, Argentina, Francia, Italia, España, Australia, USA, Sudáfrica, Nueva Zelanda, Alemania, Portugal, Otro)",
  "tier": "categoría (debe ser una de: Ícono, Super Premium, Premium, Gran Reserva, Reserva, Reserva Privada, Varietal)"
}

Si un campo no es visible en la etiqueta, usa "" para strings y 0 para números. Para tier, infiere según el posicionamiento del vino si no aparece explícito. SOLO el JSON.`
            }
          ]
        }]
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
