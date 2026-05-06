import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

// ─────────────────────────────────────────────────────────────────
// CareerHub Latam — WhatsApp Bot (sin Meta, sin API)
// Solo escaneás el QR con tu teléfono y listo ✅
// ─────────────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth(),        // guarda sesión localmente
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",        // necesario en servidores Linux
      "--disable-gpu",
    ],
  },
});

// ─── Mostrar QR para conectar ─────────────────────────────────────
client.on("qr", (qr) => {
  console.log("\n📱 Escaneá este QR con tu WhatsApp:");
  qrcode.generate(qr, { small: true });
  console.log("(Abrí WhatsApp → Dispositivos vinculados → Vincular dispositivo)\n");
});

client.on("ready", () => {
  console.log("✅ Bot de CareerHub conectado y listo para recibir mensajes!");
});

client.on("auth_failure", () => {
  console.log("❌ Error de autenticación — volvé a escanear el QR");
});

// ─── Base de conocimiento CareerHub ──────────────────────────────
const INFO = {
  bienvenida: `¡Hola! 👋 Bienvenido/a a *CareerHub Latam*.

Tu próximo trabajo no es suerte — es estrategia. 🌿

Escribí una opción:
• *servicios* — Qué ofrecemos
• *precios* — Costos de cada sesión
• *agendar* — Reservar tu sesión
• *orientacion* — Ayuda para elegir
• *pago* — Formas de pago
• *empresas* — Servicios corporativos
• *ayuda* — Hablar con el equipo`,

  menu: `📋 *Menú CareerHub Latam*

1️⃣ *servicios*
2️⃣ *precios*
3️⃣ *agendar*
4️⃣ *orientacion*
5️⃣ *idioma*
6️⃣ *pago*
7️⃣ *empresas*
8️⃣ *ayuda*`,

  servicios: `🎯 *Servicios CareerHub Latam*

*Sesiones individuales:*
• Asesoría con Caro — 30 min
• Crear un Nuevo CV — 1 hora
• LinkedIn: Perfil Efectivo — 1 hora
• Preparación para Entrevistas — 1 hora (2 partes)
• Práctica para Entrevistas + Feedback — 1 hora

*Programas:*
• Impulso Exprés — 3 sesiones
• Personal Job Seeker — suscripción mensual
• The NGO Career Project — 2 sesiones
• Outplacement: Camino al Éxito — 3 meses

100% virtuales, en español o inglés 💻
Escribí *precios* para ver los costos.`,

  precios: `💰 *Precios CareerHub Latam*

*Sesiones individuales:*
• Asesoría con Caro → $95
• Crear un Nuevo CV → $65
• LinkedIn: Perfil Efectivo → $65
• Preparación para Entrevistas → $85
• Práctica + Feedback → $50

*Programas:*
• Impulso Exprés (3 sesiones) → $180
• Personal Job Seeker → ₡35.000/mes
• NGO Career Project → ₡59.900
• Outplacement 3 meses → $550

Escribí *agendar* para reservar 📅`,

  agendar: `📅 *Reservar tu sesión*

👉 https://calendly.com/jobs-careerhub

Elegís el servicio y el horario que más te convenga.

¿No sabés cuál elegir? Escribí *orientacion* 😊`,

  orientacion: `🧭 *¿Cuál sesión es para vos?*

1️⃣ Busco trabajo activamente
2️⃣ Quiero mejorar mi CV
3️⃣ Tengo una entrevista pronto
4️⃣ Quiero mejorar mi LinkedIn
5️⃣ No sé por dónde empezar
6️⃣ Quiero trabajar en ONG
7️⃣ Que busquen trabajo por mí

Respondé con el número 👆`,

  orientacion_1: `🚀 *Para vos: Impulso Exprés o Outplacement*\n\n• Impulso Exprés — 3 sesiones ($180)\n• Outplacement — 3 meses completos ($550)\n\n👉 https://calendly.com/jobs-careerhub`,
  orientacion_2: `📄 *Para vos: Crear un Nuevo CV*\n\nCV listo en la sesión. En inglés o español.\n💰 $65 · 👉 https://calendly.com/jobs-careerhub/crear-un-nuevo-cv`,
  orientacion_3: `🎤 *Para vos: Práctica para Entrevistas + Feedback*\n\nSimulación real + feedback personalizado.\n💰 $50 · 👉 https://calendly.com/jobs-careerhub/practica-entrevistas`,
  orientacion_4: `💼 *Para vos: LinkedIn: Perfil Efectivo*\n\nPerfil completo y efectivo con tips de búsqueda.\n💰 $65 · 👉 https://calendly.com/jobs-careerhub/linkedin-perfil-efectivo`,
  orientacion_5: `☕ *Para vos: Asesoría con Caro*\n\n30 min para evaluar tu perfil y definir el plan ideal.\n💰 $95 · 👉 https://calendly.com/jobs-careerhub/asesoria-con-caro`,
  orientacion_6: `🌍 *Para vos: The NGO Career Project*\n\n2 sesiones para entrar al mundo de las ONG.\n💰 ₡59.900 · 👉 https://calendly.com/jobs-careerhub/ngo-career-project`,
  orientacion_7: `🔍 *Para vos: Personal Job Seeker*\n\nNosotros aplicamos a empleos por vos.\n💰 ₡35.000/mes · 👉 https://calendly.com/jobs-careerhub/personal-job-seeker`,

  idioma: `🌐 *Idioma de las sesiones*\n\n✅ Disponibles en:\n• Español 🇨🇷\n• Inglés 🇺🇸\n\nMencionalo al agendar o al inicio de tu sesión.`,

  pago: `💳 *Formas de pago*\n\n• 📱 SINPE Móvil\n• 🏦 Transferencia bancaria\n• 🌐 PayPal\n\nLos detalles se coordinan con el equipo tras agendar. ✉️`,

  empresas: `🏢 *Servicios para Empresas*\n\n• Outplacement empresarial\n• Atracción de talento\n• Desarrollo de equipos\n• Consultoría de RRHH\n\nEscribinos con tu nombre y empresa para una propuesta.\nO agendar: https://calendly.com/jobs-careerhub`,

  ayuda: `🙋 *¿Necesitás hablar con alguien?*\n\nUn miembro del equipo te responde a la brevedad.\n\n📱 Instagram: @careerhub.latam\n📅 Agendar: https://calendly.com/jobs-careerhub`,

  default: `No entendí del todo 🤔\n\nEscribí *menu* para ver todas las opciones 😊`,
};

// ─── Estado de conversaciones ─────────────────────────────────────
const sesiones = {};

// ─── Detectar intención ───────────────────────────────────────────
function detectar(texto, sesion) {
  const t = texto.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (t.match(/^(hola|buenos|buenas|hey|hi|hello)/)) return "bienvenida";
  if (t.match(/menu|inicio|opciones/))               return "menu";
  if (t.match(/servicio|que ofrecen/))               return "servicios";
  if (t.match(/precio|costo|cuanto|valor/))          return "precios";
  if (t.match(/agend|reserv|cita|book/))             return "agendar";
  if (t.match(/orientacion|cual.*elijo|no se|no sé/)) return "orientacion";
  if (t.match(/idioma|ingles|espanol|english/))      return "idioma";
  if (t.match(/pago|sinpe|paypal|transfer/))         return "pago";
  if (t.match(/empresa|corporat|ong\b|ngo\b/))       return "empresas";
  if (t.match(/ayuda|help|humano|persona/))          return "ayuda";

  // Respuesta numérica dentro del flujo de orientación
  if (sesion?.step === "orientacion" && /^[1-7]$/.test(t)) {
    return `orientacion_${t}`;
  }

  return "default";
}

// ─── Escuchar mensajes ────────────────────────────────────────────
client.on("message", async (msg) => {
  // Ignorar mensajes de grupos y del propio bot
  if (msg.from.endsWith("@g.us") || msg.fromMe) return;

  const from  = msg.from;
  const texto = msg.body || "";

  if (!sesiones[from]) sesiones[from] = { step: "start" };

  const intencion = detectar(texto, sesiones[from]);

  // Actualizar step
  sesiones[from].step = intencion === "orientacion" ? "orientacion" : "start";

  const respuesta = INFO[intencion] || INFO.default;

  await msg.reply(respuesta);

  console.log(`[${new Date().toLocaleTimeString()}] ${from} → "${texto}" → ${intencion}`);
});

// ─── Iniciar cliente ──────────────────────────────────────────────
client.initialize();
