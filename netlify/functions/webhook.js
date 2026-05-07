const VERIFY_TOKEN    = process.env.VERIFY_TOKEN    || "careerhub_seguro_2024";
const ACCESS_TOKEN    = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const INFO = {
  bienvenida: "¡Hola! 👋 Bienvenido/a a *CareerHub Latam*.\n\nTu próximo trabajo no es suerte — es estrategia. 🌿\n\nEscribí una opción:\n• *servicios*\n• *precios*\n• *agendar*\n• *orientacion*\n• *pago*\n• *empresas*\n• *ayuda*",
  menu:       "📋 *Menú CareerHub*\n\n1️⃣ servicios\n2️⃣ precios\n3️⃣ agendar\n4️⃣ orientacion\n5️⃣ idioma\n6️⃣ pago\n7️⃣ empresas\n8️⃣ ayuda",
  servicios:  "🎯 *Servicios CareerHub Latam*\n\n• Asesoría con Caro — $95\n• Nuevo CV — $65\n• LinkedIn — $65\n• Preparación Entrevistas — $85\n• Práctica + Feedback — $50\n• Impulso Exprés (3 sesiones) — $180\n• Personal Job Seeker — ₡35.000/mes\n• NGO Career Project — ₡59.900\n• Outplacement 3 meses — $550\n\nEscribí *agendar* para reservar 📅",
  precios:    "💰 *Precios CareerHub Latam*\n\n• Asesoría con Caro → $95\n• Nuevo CV → $65\n• LinkedIn → $65\n• Entrevistas → $85\n• Práctica + Feedback → $50\n• Impulso Exprés → $180\n• Personal Job Seeker → ₡35.000/mes\n• NGO Career Project → ₡59.900\n• Outplacement → $550",
  agendar:    "📅 *Reservar sesión*\n\n👉 https://calendly.com/jobs-careerhub\n\n¿No sabés cuál elegir? Escribí *orientacion* 😊",
  orientacion:"🧭 *¿Cuál sesión es para vos?*\n\n1️⃣ Busco trabajo activamente\n2️⃣ Quiero mejorar mi CV\n3️⃣ Tengo una entrevista pronto\n4️⃣ Quiero mejorar mi LinkedIn\n5️⃣ No sé por dónde empezar\n6️⃣ Quiero trabajar en ONG\n7️⃣ Que busquen trabajo por mí\n\nRespondé con el número 👆",
  orientacion_1: "🚀 Impulso Exprés ($180) o Outplacement ($550)\n👉 https://calendly.com/jobs-careerhub",
  orientacion_2: "📄 Crear un Nuevo CV — $65\n👉 https://calendly.com/jobs-careerhub/crear-un-nuevo-cv",
  orientacion_3: "🎤 Práctica + Feedback — $50\n👉 https://calendly.com/jobs-careerhub/practica-entrevistas",
  orientacion_4: "💼 LinkedIn: Perfil Efectivo — $65\n👉 https://calendly.com/jobs-careerhub/linkedin-perfil-efectivo",
  orientacion_5: "☕ Asesoría con Caro — $95\n👉 https://calendly.com/jobs-careerhub/asesoria-con-caro",
  orientacion_6: "🌍 NGO Career Project — ₡59.900\n👉 https://calendly.com/jobs-careerhub/ngo-career-project",
  orientacion_7: "🔍 Personal Job Seeker — ₡35.000/mes\n👉 https://calendly.com/jobs-careerhub/personal-job-seeker",
  idioma:     "🌐 Sesiones en español 🇨🇷 e inglés 🇺🇸\nMencionalo al agendar o al inicio de tu sesión.",
  pago:       "💳 *Formas de pago*\n\n• SINPE Móvil\n• Transferencia bancaria\n• PayPal\n\nLos detalles se coordinan tras agendar. ✉️",
  empresas:   "🏢 *Servicios para Empresas*\n\n• Outplacement empresarial\n• Atracción de talento\n• Desarrollo de equipos\n• Consultoría de RRHH\n\n👉 https://calendly.com/jobs-careerhub",
  ayuda:      "🙋 El equipo te responde a la brevedad.\n📱 @careerhub.latam\n📅 https://calendly.com/jobs-careerhub",
  default:    "No entendí 🤔 Escribí *menu* para ver las opciones.",
};

const sesiones = {};

function detectar(texto, sesion) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  if (/^(hola|buenos|buenas|hey|hi)/.test(t)) return "bienvenida";
  if (/menu|inicio/.test(t))                   return "menu";
  if (/servicio/.test(t))                       return "servicios";
  if (/precio|costo|cuanto/.test(t))            return "precios";
  if (/agend|reserv|cita/.test(t))              return "agendar";
  if (/orientacion|no se|cual/.test(t))         return "orientacion";
  if (/idioma|ingles|espanol/.test(t))          return "idioma";
  if (/pago|sinpe|paypal/.test(t))              return "pago";
  if (/empresa|ong|ngo/.test(t))                return "empresas";
  if (/ayuda|help|humano/.test(t))              return "ayuda";
  if (sesion && sesion.step === "orientacion" && /^[1-7]$/.test(t)) return "orientacion_" + t;
  return "default";
}

async function enviar(to, body) {
  await fetch("https://graph.facebook.com/v19.0/" + PHONE_NUMBER_ID + "/messages", {
    method: "POST",
    headers: { Authorization: "Bearer " + ACCESS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: to, text: { body: body } })
  });
}

exports.handler = async function(event) {
  // GET — verificación Meta
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    if (params["hub.verify_token"] === VERIFY_TOKEN) {
      return { statusCode: 200, body: params["hub.challenge"] };
    }
    return { statusCode: 403, body: "Token invalido" };
  }

  // POST — mensajes entrantes
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (msg && msg.type === "text") {
        const from  = msg.from;
        const texto = msg.text?.body || "";
        if (!sesiones[from]) sesiones[from] = { step: "start" };
        const intent = detectar(texto, sesiones[from]);
        sesiones[from].step = intent === "orientacion" ? "orientacion" : "start";
        await enviar(from, INFO[intent] || INFO.default);
      }
    } catch(e) { console.error(e); }
    return { statusCode: 200, body: "OK" };
  }

  return { statusCode: 405, body: "Method not allowed" };
};
