const VERIFY_TOKEN    = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN    = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

const INFO = {
  bienvenida: `¡Hola! 👋 Bienvenido/a a *CareerHub Latam*.\n\nTu próximo trabajo no es suerte — es estrategia. 🌿\n\nEscribí una opción:\n• *servicios*\n• *precios*\n• *agendar*\n• *orientacion*\n• *pago*\n• *empresas*\n• *ayuda*`,
  menu: `📋 *Menú CareerHub*\n\n1️⃣ servicios\n2️⃣ precios\n3️⃣ agendar\n4️⃣ orientacion\n5️⃣ idioma\n6️⃣ pago\n7️⃣ empresas\n8️⃣ ayuda`,
  servicios: `🎯 *Servicios CareerHub Latam*\n\n*Sesiones individuales:*\n• Asesoría con Caro — $95 — 30 min\n• Crear un Nuevo CV — $65 — 1h\n• LinkedIn: Perfil Efectivo — $65 — 1h\n• Preparación para Entrevistas — $85 — 1h\n• Práctica + Feedback — $50 — 1h\n\n*Programas:*\n• Impulso Exprés 3 sesiones — $180\n• Personal Job Seeker — ₡35.000/mes\n• NGO Career Project — ₡59.900\n• Outplacement 3 meses — $550\n\nEscribí *precios* o *agendar* 📅`,
  precios: `💰 *Precios CareerHub Latam*\n\n• Asesoría con Caro → $95\n• Nuevo CV → $65\n• LinkedIn → $65\n• Preparación Entrevistas → $85\n• Práctica + Feedback → $50\n• Impulso Exprés → $180\n• Personal Job Seeker → ₡35.000/mes\n• NGO Career Project → ₡59.900\n• Outplacement → $550\n\nEscribí *agendar* para reservar 📅`,
  agendar: `📅 *Reservar sesión*\n\n👉 https://calendly.com/jobs-careerhub\n\n¿No sabés cuál elegir? Escribí *orientacion* 😊`,
  orientacion: `🧭 *¿Cuál sesión es para vos?*\n\n1️⃣ Busco trabajo activamente\n2️⃣ Quiero mejorar mi CV\n3️⃣ Tengo una entrevista pronto\n4️⃣ Quiero mejorar mi LinkedIn\n5️⃣ No sé por dónde empezar\n6️⃣ Quiero trabajar en ONG\n7️⃣ Que busquen trabajo por mí\n\nRespondé con el número 👆`,
  orientacion_1: `🚀 Impulso Exprés ($180) o Outplacement ($550)\n👉 https://calendly.com/jobs-careerhub`,
  orientacion_2: `📄 Crear un Nuevo CV — $65\n👉 https://calendly.com/jobs-careerhub/crear-un-nuevo-cv`,
  orientacion_3: `🎤 Práctica + Feedback — $50\n👉 https://calendly.com/jobs-careerhub/practica-entrevistas`,
  orientacion_4: `💼 LinkedIn: Perfil Efectivo — $65\n👉 https://calendly.com/jobs-careerhub/linkedin-perfil-efectivo`,
  orientacion_5: `☕ Asesoría con Caro — $95\n👉 https://calendly.com/jobs-careerhub/asesoria-con-caro`,
  orientacion_6: `🌍 NGO Career Project — ₡59.900\n👉 https://calendly.com/jobs-careerhub/ngo-career-project`,
  orientacion_7: `🔍 Personal Job Seeker — ₡35.000/mes\n👉 https://calendly.com/jobs-careerhub/personal-job-seeker`,
  idioma: `🌐 Sesiones disponibles en español 🇨🇷 e inglés 🇺🇸\nMencionalo al agendar o al inicio de tu sesión.`,
  pago: `💳 *Formas de pago*\n\n• SINPE Móvil\n• Transferencia bancaria\n• PayPal\n\nLos detalles se coordinan tras agendar. ✉️`,
  empresas: `🏢 *Servicios para Empresas*\n\n• Outplacement empresarial\n• Atracción de talento\n• Desarrollo de equipos\n• Consultoría de RRHH\n\nAgendar: https://calendly.com/jobs-careerhub`,
  ayuda: `🙋 El equipo te responde a la brevedad.\n\n📱 @careerhub.latam\n📅 https://calendly.com/jobs-careerhub`,
  default: `No entendí 🤔 Escribí *menu* para ver las opciones.`,
};

const sesiones = {};

function detectar(texto, sesion) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  if (t.match(/^(hola|buenos|buenas|hey|hi)/)) return "bienvenida";
  if (t.match(/menu|inicio|opciones/))          return "menu";
  if (t.match(/servicio/))                      return "servicios";
  if (t.match(/precio|costo|cuanto|valor/))     return "precios";
  if (t.match(/agend|reserv|cita/))             return "agendar";
  if (t.match(/orientacion|no se|cual/))        return "orientacion";
  if (t.match(/idioma|ingles|espanol/))         return "idioma";
  if (t.match(/pago|sinpe|paypal/))             return "pago";
  if (t.match(/empresa|ong\b|ngo\b/))           return "empresas";
  if (t.match(/ayuda|help|humano/))             return "ayuda";
  if (sesion?.step === "orientacion" && /^[1-7]$/.test(t)) return `orientacion_${t}`;
  return "default";
}

async function enviar(to, body) {
  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, text: { body } })
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
      return res.status(200).send(req.query["hub.challenge"]);
    }
    return res.status(403).send("Token inválido");
  }
  if (req.method === "POST") {
    res.status(200).send("OK");
    try {
      const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!msg || msg.type !== "text") return;
      const from = msg.from;
      const texto = msg.text?.body || "";
      if (!sesiones[from]) sesiones[from] = { step: "start" };
      const intent = detectar(texto, sesiones[from]);
      sesiones[from].step = intent === "orientacion" ? "orientacion" : "start";
      await enviar(from, INFO[intent] || INFO.default);
    } catch(e) { console.error(e); }
  }
}
