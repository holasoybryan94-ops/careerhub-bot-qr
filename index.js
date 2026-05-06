import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";

const INFO = {
  bienvenida: `¡Hola! 👋 Bienvenido/a a *CareerHub Latam*.\n\nTu próximo trabajo no es suerte — es estrategia. 🌿\n\nEscribí una opción:\n• *servicios* — Qué ofrecemos\n• *precios* — Costos de cada sesión\n• *agendar* — Reservar tu sesión\n• *orientacion* — Ayuda para elegir\n• *pago* — Formas de pago\n• *empresas* — Servicios corporativos\n• *ayuda* — Hablar con el equipo`,
  menu: `📋 *Menú CareerHub Latam*\n\n1️⃣ *servicios*\n2️⃣ *precios*\n3️⃣ *agendar*\n4️⃣ *orientacion*\n5️⃣ *idioma*\n6️⃣ *pago*\n7️⃣ *empresas*\n8️⃣ *ayuda*`,
  servicios: `🎯 *Servicios CareerHub Latam*\n\n*Sesiones individuales:*\n• Asesoría con Caro — 30 min\n• Crear un Nuevo CV — 1 hora\n• LinkedIn: Perfil Efectivo — 1 hora\n• Preparación para Entrevistas — 1 hora (2 partes)\n• Práctica para Entrevistas + Feedback — 1 hora\n\n*Programas:*\n• Impulso Exprés — 3 sesiones\n• Personal Job Seeker — suscripción mensual\n• The NGO Career Project — 2 sesiones\n• Outplacement: Camino al Éxito — 3 meses\n\n100% virtuales, en español o inglés 💻\nEscribí *precios* para ver los costos.`,
  precios: `💰 *Precios CareerHub Latam*\n\n*Sesiones individuales:*\n• Asesoría con Caro → $95\n• Crear un Nuevo CV → $65\n• LinkedIn: Perfil Efectivo → $65\n• Preparación para Entrevistas → $85\n• Práctica + Feedback → $50\n\n*Programas:*\n• Impulso Exprés (3 sesiones) → $180\n• Personal Job Seeker → ₡35.000/mes\n• NGO Career Project → ₡59.900\n• Outplacement 3 meses → $550\n\nEscribí *agendar* para reservar 📅`,
  agendar: `📅 *Reservar tu sesión*\n\n👉 https://calendly.com/jobs-careerhub\n\nElegís el servicio y el horario que más te convenga.\n\n¿No sabés cuál elegir? Escribí *orientacion* 😊`,
  orientacion: `🧭 *¿Cuál sesión es para vos?*\n\n1️⃣ Busco trabajo activamente\n2️⃣ Quiero mejorar mi CV\n3️⃣ Tengo una entrevista pronto\n4️⃣ Quiero mejorar mi LinkedIn\n5️⃣ No sé por dónde empezar\n6️⃣ Quiero trabajar en ONG\n7️⃣ Que busquen trabajo por mí\n\nRespondé con el número 👆`,
  orientacion_1: `🚀 *Para vos: Impulso Exprés o Outplacement*\n\n• Impulso Exprés — 3 sesiones ($180)\n• Outplacement — 3 meses completos ($550)\n\n👉 https://calendly.com/jobs-careerhub`,
  orientacion_2: `📄 *Para vos: Crear un Nuevo CV*\n\nCV listo en la sesión. En inglés o español.\n💰 $65 · 👉 https://calendly.com/jobs-careerhub/crear-un-nuevo-cv`,
  orientacion_3: `🎤 *Para vos: Práctica para Entrevistas + Feedback*\n\nSimulación real + feedback personalizado.\n💰 $50 · 👉 https://calendly.com/jobs-careerhub/practica-entrevistas`,
  orientacion_4: `💼 *Para vos: LinkedIn: Perfil Efectivo*\n\nPerfil completo con tips de búsqueda.\n💰 $65 · 👉 https://calendly.com/jobs-careerhub/linkedin-perfil-efectivo`,
  orientacion_5: `☕ *Para vos: Asesoría con Caro*\n\n30 min para evaluar tu perfil y definir el plan.\n💰 $95 · 👉 https://calendly.com/jobs-careerhub/asesoria-con-caro`,
  orientacion_6: `🌍 *Para vos: The NGO Career Project*\n\n2 sesiones para entrar al mundo de las ONG.\n💰 ₡59.900 · 👉 https://calendly.com/jobs-careerhub/ngo-career-project`,
  orientacion_7: `🔍 *Para vos: Personal Job Seeker*\n\nNosotros aplicamos a empleos por vos.\n💰 ₡35.000/mes · 👉 https://calendly.com/jobs-careerhub/personal-job-seeker`,
  idioma: `🌐 *Idioma de las sesiones*\n\n✅ Disponibles en:\n• Español 🇨🇷\n• Inglés 🇺🇸\n\nMencionalo al agendar o al inicio de tu sesión.`,
  pago: `💳 *Formas de pago*\n\n• 📱 SINPE Móvil\n• 🏦 Transferencia bancaria\n• 🌐 PayPal\n\nLos detalles se coordinan con el equipo tras agendar. ✉️`,
  empresas: `🏢 *Servicios para Empresas*\n\n• Outplacement empresarial\n• Atracción de talento\n• Desarrollo de equipos\n• Consultoría de RRHH\n\nEscribinos con tu nombre y empresa.\nAgendar: https://calendly.com/jobs-careerhub`,
  ayuda: `🙋 *¿Necesitás hablar con alguien?*\n\nUn miembro del equipo te responde a la brevedad.\n\n📱 Instagram: @careerhub.latam\n📅 Agendar: https://calendly.com/jobs-careerhub`,
  default: `No entendí del todo 🤔\n\nEscribí *menu* para ver todas las opciones 😊`,
};

const sesiones = {};

function detectar(texto, sesion) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  if (t.match(/^(hola|buenos|buenas|hey|hi|hello)/)) return "bienvenida";
  if (t.match(/menu|inicio|opciones/))               return "menu";
  if (t.match(/servicio|que ofrecen/))               return "servicios";
  if (t.match(/precio|costo|cuanto|valor/))          return "precios";
  if (t.match(/agend|reserv|cita|book/))             return "agendar";
  if (t.match(/orientacion|cual.*elijo|no se/))      return "orientacion";
  if (t.match(/idioma|ingles|espanol|english/))      return "idioma";
  if (t.match(/pago|sinpe|paypal|transfer/))         return "pago";
  if (t.match(/empresa|corporat|ong\b|ngo\b/))       return "empresas";
  if (t.match(/ayuda|help|humano|persona/))          return "ayuda";
  if (sesion?.step === "orientacion" && /^[1-7]$/.test(t)) return `orientacion_${t}`;
  return "default";
}

async function conectar() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_baileys");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }),
    browser: ["CareerHub Bot", "Chrome", "1.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log("✅ CareerHub Bot conectado!");
    if (connection === "close") {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const reconectar = code !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada (${code}). Reconectando: ${reconectar}`);
      if (reconectar) setTimeout(conectar, 3000);
      else console.log("Sesión cerrada. Borrá la carpeta auth_baileys y volvé a escanear.");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      if (msg.key.remoteJid?.endsWith("@g.us")) continue;
      const from = msg.key.remoteJid;
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
      if (!texto) continue;
      if (!sesiones[from]) sesiones[from] = { step: "start" };
      const intencion = detectar(texto, sesiones[from]);
      sesiones[from].step = intencion === "orientacion" ? "orientacion" : "start";
      await sock.sendMessage(from, { text: INFO[intencion] || INFO.default });
      console.log(`[${new Date().toLocaleTimeString()}] "${texto}" → ${intencion}`);
    }
  });
}

conectar().catch(console.error);
