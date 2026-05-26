// --- Configuración MQTT para HiveMQ ---
const brokerUrl = "broker.hivemq.com"; 
const port = 8884; // Puerto seguro para WebSockets en HiveMQ
const clientId = "WebApp_ETN801_" + Math.random().toString(16).substring(2, 10);

const topicSub_Voltaje = "esp32/etn801/voltaje";
const topicPub_Led = "esp32/etn801/led";

let client;
let isConnected = false;

// Referencias a la interfaz
const btnConnect = document.getElementById("btnConnect");
const lblVoltaje = document.getElementById("lblVoltaje");
const progressCircle = document.getElementById("progressCircle");
const chkLuces = document.getElementById("chkLuces");

// Evento: Botón Conectar/Desconectar
btnConnect.addEventListener("click", () => {
    if (!isConnected) {
        // Inicializar cliente Paho MQTT
        client = new Paho.MQTT.Client(brokerUrl, port, clientId);
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // Cambiar el texto mientras intenta conectar
        btnConnect.textContent = "CONECTANDO...";

        client.connect({
            onSuccess: onConnect,
            onFailure: onFailure,
            cleanSession: true,
            useSSL: true // OBLIGATORIO para HiveMQ por el puerto 8884 y Vercel
        });
        
    } else {
        client.disconnect();
        marcarDesconectado();
    }
});

function onConnect() {
    isConnected = true;
    btnConnect.textContent = "CONECTADO";
    btnConnect.classList.add("connected");

    client.subscribe(topicSub_Voltaje, { qos: 0 });
    console.log("Conectado y suscrito a: " + topicSub_Voltaje);
}

function onFailure(responseObject) {
    console.error("Fallo al conectar:", responseObject.errorMessage);
    alert("Error al conectar con HiveMQ. Revisa tu conexión a internet.");
    marcarDesconectado();
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.error("Conexión perdida:", responseObject.errorMessage);
    }
    marcarDesconectado();
}

function marcarDesconectado() {
    isConnected = false;
    btnConnect.textContent = "DESCONECTADO";
    btnConnect.classList.remove("connected");
}

// Evento: Mensaje Recibido
function onMessageArrived(message) {
    if (message.destinationName === topicSub_Voltaje) {
        let voltaje = parseFloat(message.payloadString);
        
        if (!isNaN(voltaje)) {
            lblVoltaje.textContent = voltaje.toFixed(2);
            
            let percent = Math.min(Math.max(voltaje / 3.3, 0), 1);
            let offset = 440 - (percent * 440);
            progressCircle.style.strokeDashoffset = offset;
        }
    }
}

// Evento: Switch de Luces
chkLuces.addEventListener("change", (e) => {
    if (isConnected) {
        let payload = e.target.checked ? "ON" : "OFF";
        
        let message = new Paho.MQTT.Message(payload);
        message.destinationName = topicPub_Led;
        message.qos = 0;
        client.send(message);
        console.log("Enviado a " + topicPub_Led + ": " + payload);
    } else {
        alert("Primero debes conectar el Monitor");
        e.target.checked = !e.target.checked; 
    }
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
        console.log('Service Worker registrado');
    }).catch((err) => {
        console.log('Fallo al registrar SW:', err);
    });
}