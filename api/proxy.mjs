// api/proxy.mjs
// Vercel Serverless Function - Proxy to Google Apps Script

export default async function handler(request, response) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Google Apps Script URL - REPLACE WITH YOURS
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyVWoq4ntRL4ljuH4bRjyrvLacMpLfSA8W73mY6S9pZ7g93A34X4W73AFIjbRZcBYza/exec';
  
  try {
    const url = new URL(GOOGLE_SCRIPT_URL);
    
    // Copy query params
    const { action } = request.query;
    if (action) {
      url.searchParams.append('action', action);
    }
    
    const fetchOptions = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (request.method === 'POST' && request.body) {
      fetchOptions.body = JSON.stringify(request.body);
    }
    
    console.log('Proxying to:', url.toString());
    
    const googleResponse = await fetch(url.toString(), fetchOptions);
    const data = await googleResponse.json();
    
    response.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
}