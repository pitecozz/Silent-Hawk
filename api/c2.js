module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        const { command, params } = req.body
        console.log('🎮 C2 Command Received:', command, params)
        
        // Basic commands
        switch (command) {
            case 'ping':
                res.json({ response: 'pong', timestamp: new Date().toISOString() })
                break
            case 'get_info':
                res.json({ userAgent: req.headers['user-agent'], ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress })
                break
            default:
                res.json({ error: 'Comando desconhecido' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
