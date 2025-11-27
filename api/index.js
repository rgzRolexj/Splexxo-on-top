// ==================== CONFIG =====================
const YOUR_API_KEYS = ["SPLEXXO"];
const TARGET_API = "https://numinfo.gauravcyber0.workers.dev/";
// =================================================

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf GET allow karo
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    });
  }

  // Query parameters lo
  const { mobile, key } = req.query;

  // Check parameters
  if (!mobile) {
    return res.status(400).json({ 
      success: false,
      error: "Mobile number is required",
      example: "?mobile=9919471212&key=SPLEXXO"
    });
  }

  if (!key) {
    return res.status(400).json({ 
      success: false,
      error: "API key is required",
      example: "?mobile=9919471212&key=SPLEXXO"
    });
  }

  // API key verify karo
  if (!YOUR_API_KEYS.includes(key)) {
    return res.status(403).json({ 
      success: false,
      error: "Invalid API key"
    });
  }

  // Mobile number clean karo
  const cleanMobile = mobile.toString().replace(/\D/g, '');

  // Target API call karo
  try {
    const apiUrl = `${TARGET_API}?mobile=${cleanMobile}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(500).json({ 
        success: false,
        error: "Number info service unavailable",
        status: response.status
      });
    }

    const data = await response.json();

    // Success response with branding
    return res.status(200).json({
      success: true,
      ...data,
      developer: "splexxo",
      powered_by: "splexxo Number Info API"
    });

  } catch (error) {
    // Error handling
    return res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
}
