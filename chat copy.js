document.addEventListener('DOMContentLoaded', () => {
    // 1. INYECTAR LA INTERFAZ DEL CHAT EN EL HTML
    const chatHTML = `
        <div class="chat-widget">
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <h3>Asistente FASE 59</h3>
                    <button class="close-chat" id="close-chat">&times;</button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="mensaje mensaje-bot">¡Hola! Soy el asistente virtual de FASE 59. ¿En qué te puedo ayudar hoy? (Servicios, ubicaciones, soporte técnico...)</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Escribe tu mensaje...">
                    <button id="send-chat">Enviar</button>
                </div>
            </div>
            <button class="chat-toggle-btn" id="chat-toggle-btn">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. CONFIGURACIÓN DE LA API DE GEMINI
    // ¡IMPORTANTE!: Para producción, la API Key no debe estar visible en el código frontend. 
    // Obtén tu API Key gratuita en: https://aistudio.google.com/
    const GEMINI_API_KEY = 'AQ.Ab8RN6J2WoEqXdx4onm1T6n7W2SBjxw7D_zL9A1XDj4-j4fOUg'; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Instrucciones base para que Gemini sepa quién es y cómo responder
    const INSTRUCCIONES_SISTEMA = `
        Eres el asistente virtual de atención al cliente de "FASE 59", una organización especializada en Tecnologías de Información y Comunicación (TIC).
        Tu tono debe ser amable, profesional, útil y conciso.
        
        INFORMACIÓN DE LA EMPRESA:
        - Ubicación: Privada Bernamirans 7, Fraccionamiento Rancho de la Luz, Tecámac, Edo. Méx.
        - WhatsApp: 044 551 176 5154
        - Correo: sergioeufracio@fase59.com
        - Servicios: Diseño Gráfico (comunicación visual), Diseño Web (sitios accesibles, UX, SEO), Reparación de Equipos Computacionales (diagnóstico y solución a hardware/software).
        
        REGLAS DE ATENCIÓN:
        1. Si el usuario pide información de contacto, entrégala claramente.
        2. Si el usuario tiene un problema técnico ("mi computadora no enciende", "va lenta"), dale 2 o 3 pasos de solución rápida (ej. revisar cables, reiniciar, verificar actualizaciones).
        3. Si el usuario pregunta por costos de reparación o servicios, diles que los costos varían según el problema exacto, dales un estimado general muy amplio si insisten (ej. revisión desde $200 MXN), pero SIEMPRE indícales que envíen un WhatsApp al 044 551 176 5154 para un diagnóstico y cotización exacta.
    `;

    // Historial de la conversación para mantener el contexto
    let chatHistory = [];

    // 3. ELEMENTOS DEL DOM
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat');
    const messagesContainer = document.getElementById('chat-messages');
    const inputField = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');

    // 4. FUNCIONES DE INTERFAZ
    toggleBtn.addEventListener('click', () => chatWindow.classList.add('active'));
    closeBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('mensaje', sender === 'user' ? 'mensaje-usuario' : 'mensaje-bot');
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
    }

    // 5. COMUNICACIÓN CON GEMINI
    async function sendMessage() {
        const userText = inputField.value.trim();
        if (!userText) return;

        // Mostrar mensaje del usuario
        addMessage(userText, 'user');
        inputField.value = '';
        inputField.disabled = true;
        sendBtn.disabled = true;
        
        // Añadir indicador de "Escribiendo..."
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.classList.add('mensaje', 'mensaje-bot');
        typingDiv.textContent = 'Escribiendo...';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Agregar mensaje al historial (formato requerido por Gemini)
        chatHistory.push({ role: "user", parts: [{ text: userText }] });

        try {
            const payload = {
                systemInstruction: { parts: [{ text: INSTRUCCIONES_SISTEMA }] },
                contents: chatHistory
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error?.message || 'Error de API');

            const botReply = data.candidates[0].content.parts[0].text;
            
            // Guardar respuesta en el historial
            chatHistory.push({ role: "model", parts: [{ text: botReply }] });

            // Mostrar respuesta
            document.getElementById(typingId).remove();
            addMessage(botReply, 'bot');

        } catch (error) {
            console.error("Error con Gemini:", error);
            document.getElementById(typingId).remove();
            addMessage("Lo siento, estoy teniendo problemas de conexión en este momento. Por favor contáctanos por WhatsApp.", 'bot');
        } finally {
            inputField.disabled = false;
            sendBtn.disabled = false;
            inputField.focus();
        }
    }

    // Eventos de envío
    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});