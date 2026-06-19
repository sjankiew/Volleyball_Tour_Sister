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
    
    console.log('Proxying to:', url.toString());
    console.log('Method:', request.method);
    
    const googleResponse = await fetch(url.toString(), fetchOptions);
    
    // ตรวจสอบว่า response เป็น JSON หรือ redirect
    const contentType = googleResponse.headers.get('content-type');
    console.log('Google response content-type:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await googleResponse.json();
    } else {
      // ถ้าไม่ใช่ JSON ให้อ่านเป็น text
      const text = await googleResponse.text();
      console.log('Google response text:', text.substring(0, 200));
      
      // ลอง parse เป็น JSON
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: 'Invalid response from Google Script', raw: text.substring(0, 500) };
      }
    }
    
    // ส่ง response กลับไปยัง browser
    response.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({
      error: 'Proxy Error',
      message: error.message,
      stack: error.stack
    });
  }
}