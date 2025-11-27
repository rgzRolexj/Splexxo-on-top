// ==================== CONFIG =====================
const YOUR_API_KEYS = ["SPLEXXO"];
const TARGET_API = "https://numinfo.gauravcyber0.workers.dev/";
const CACHE_TIME = 3600 * 1000;
// =================================================

const cache = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  const { mobile, phone, key } = req.query;
  const phoneNumber = mobile || phone;

  // Param check
  if (!phoneNumber || !key) {
    return res.status(400).json({ 
      error: "Missing parameters", 
      details: "Use: ?mobile=Number&key=SPLEXXO" 
    });
  }

  const cleanPhone = String(phoneNumber).replace(/\D/g, "");
  const cleanKey = String(key).trim();

  // API key check
  if (!YOUR_API_KEYS.includes(cleanKey)) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  // Cache check
  const now = Date.now();
  const cached = cache.get(cleanPhone);
  if (cached && now - cached.timestamp < CACHE_TIME) {
    res.setHeader('X-Proxy-Cache', 'HIT');
    return res.status(200).json(cached.data);
  }

  // Number Info API call
  const url = `${TARGET_API}?mobile=${cleanPhone}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(502).json({ 
        error: "Number API failed", 
        status: response.status
      });
    }

    const data = await response.json();

    // Add branding and format response
    const finalData = {
      ...data,
      number: cleanPhone,
      developer: "splexxo",
      powered_by: "splexxo Number Info API",
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Save to cache
    cache.set(cleanPhone, {
      timestamp: now,
      data: { ...finalData, cached: true }
    });

    res.setHeader('X-Proxy-Cache', 'MISS');
    return res.status(200).json(finalData);

  } catch (error) {
    return res.status(500).json({
      error: "API request failed",
      details: error.message,
      developer: "splexxo"
    });
  }
}
