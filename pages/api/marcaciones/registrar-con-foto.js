// pages/api/marcaciones/registrar-con-foto.js - API Route proxy para registrar marcación con foto
// Esta ruta actúa como proxy entre el frontend y el VPS para evitar problemas de timeout de Vercel

import axios from 'axios';

// URL del VPS
const VPS_API_URL = process.env.VPS_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://mycarrito.com.ar/api/planificador';

export const config = {
  api: {
    bodyParser: false, // Deshabilitar bodyParser para manejar FormData manualmente
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido' 
    });
  }

  try {
    // Leer el body completo como buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Obtener headers del request original
    const contentType = req.headers['content-type'];
    const contentLength = buffer.length;
    
    console.log('📤 Proxy: Reenviando petición al VPS...', {
      contentType,
      contentLength: `${(contentLength / 1024).toFixed(2)}KB`,
      vpsUrl: `${VPS_API_URL}/marcaciones/registrar-con-foto`
    });
    
    // Reenviar la petición directamente al VPS con el buffer
    const vpsResponse = await axios.post(
      `${VPS_API_URL}/marcaciones/registrar-con-foto`,
      buffer,
      {
        headers: {
          'Content-Type': contentType,
          'Content-Length': contentLength,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000, // 120 segundos
      }
    );

    console.log('✅ Proxy: Respuesta recibida del VPS', {
      status: vpsResponse.status,
      success: vpsResponse.data?.success
    });

    // Retornar la respuesta del VPS al frontend
    return res.status(vpsResponse.status).json(vpsResponse.data);
    
  } catch (error) {
    console.error('❌ Error en proxy de marcación:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    // Si el error viene del VPS, retornarlo
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.message || 'Error al registrar marcación',
        ...error.response.data
      });
    }
    
    // Error de red, timeout o conexión
    const errorMessage = error.code === 'ECONNABORTED' 
      ? 'La petición tardó demasiado. Por favor, intenta nuevamente.'
      : error.message || 'Error al conectar con el servidor';
    
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
}

