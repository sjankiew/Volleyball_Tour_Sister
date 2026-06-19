// api/proxy.mjs
// Vercel Serverless Function - Proxy ไปยัง Google Apps Script

export default async function handler(request, response) {
  // ตั้งค่า CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // จัดการ OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // URL ของ Google Apps Script (ใส่ของคุณตรงนี้)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVWoq4ntRL4ljuH4bRjyrvLacMpLfSA8W73mY6S9pZ7g93A34X4W73AFIjbRZcBYza/exec';
  
  try {
    // สร้าง URL ใหม่พร้อม query parameters
    const url = new URL(GOOGLE_SCRIPT_URL);
    
    // คัดลอก query parameters จาก request มาที่นี่
    const { action } = request.query;
    if (action) {
      url.searchParams.append('action', action);
    }
    
    // ส่ง request ไปยัง Google Apps Script
    const fetchOptions = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // ถ้าเป็น POST ให้ส่ง body ไปด้วย
    if (request.method === 'POST' && request.body) {
      fetchOptions.body = JSON.stringify(request.body);
    }
    
    const googleResponse = await fetch(url.toString(), fetchOptions);
    const data = await googleResponse.json();
    
    // ส่ง response กลับไปยัง browser
    response.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
}
