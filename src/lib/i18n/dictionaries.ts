/**
 * String dictionaries for Telos. Default language is Spanish; English is the
 * secondary toggle. Keys are flat dotted strings used by t() / useT().
 *
 * Keep keys short and grouped by feature. When you add a key, add it to BOTH es and en.
 */

export type Lang = "es" | "en";

type Dict = Record<string, string>;

export const es: Dict = {
  // Nav + global
  "nav.how": "Cómo funciona",
  "nav.transparency": "Transparencia",
  "nav.businesses": "Negocios",
  "nav.postulados": "Postulados",
  "nav.agencies": "Agencias",
  "nav.donate": "Donar",
  "nav.portals": "Portales",
  "nav.portal.donor": "Portal donante",
  "nav.portal.agency": "Portal agencia",
  "nav.portal.admin": "Panel Telos",
  "nav.back.home": "Volver al inicio",

  // Hero
  "hero.pill": "Fundación piloto — Colombia 2026",
  "hero.h1a": "Capital con propósito",
  "hero.h1b": "para los pequeños negocios de Colombia.",
  "hero.sub":
    "Conectamos donantes con agencias verificadas que entregan servicios — marketing, contabilidad, legal, tecnología — a negocios listos para crecer. El negocio nunca recibe efectivo. Tú ves cada peso.",
  "hero.cta.donate": "Donar ahora",
  "hero.cta.transparency": "Ver dónde va el dinero",

  // Stat strip
  "stat.raised": "Recaudado",
  "stat.disbursed": "Desembolsado",
  "stat.deployed": "desplegado",
  "stat.businesses": "Negocios impactados",
  "stat.cities": "ciudades",
  "stat.agencies": "Agencias activas",
  "stat.verified": "100% verificadas",
  "stat.donors": "Donantes",
  "stat.countries": "países",
  "stat.toservices": "A servicios",
  "stat.fee0": "Telos no cobra comisión",

  // Flow / model
  "flow.kicker": "El modelo",
  "flow.title": "Tu donación nunca toca al negocio.",
  "flow.sub":
    "Telos paga directo a la agencia que entrega el servicio. Eso reduce fraude, simplifica impuestos y hace cada peso trazable.",
  "flow.s1.t": "Donante aporta",
  "flow.s1.d":
    "Transfieres directo a Telos y subes el comprobante. Validamos contra el banco en 24–48h.",
  "flow.s2.t": "Telos evalúa",
  "flow.s2.d":
    "Verificamos los negocios postulados (visita y comunidad) y auditamos las agencias (cámara de comercio, referencias, portafolio).",
  "flow.s3.t": "Abrimos RFP público",
  "flow.s3.d":
    "Notificamos por email a las agencias vetadas en las categorías relevantes. Cualquiera puede postular con su propuesta. El negocio elige.",
  "flow.s4.t": "Pagamos y publicamos",
  "flow.s4.d":
    "Telos paga a la agencia contra entregables. La factura y la prueba quedan públicas.",

  // Featured / closing CTAs
  "featured.kicker": "Negocios destacados",
  "featured.title": "Quién está creciendo con Telos.",
  "featured.viewall": "Ver todos",
  "trust.label": "Donantes de",

  // Why transparency
  "why.kicker": "Por qué transparencia",
  "why.title": "Cada peso, en línea. Cada entregable, público.",
  "why.p1":
    "La confianza en filantropía se gana con datos, no con discursos. Por eso publicamos cada transacción —donaciones, desembolsos, facturas, entregables— en un libro mayor abierto.",
  "why.b1": "Libro mayor público en tiempo real.",
  "why.b2": "Cada desembolso lleva factura y entregable adjuntos.",
  "why.b3": "Auditoría externa anual publicada en el sitio.",
  "why.b4": "100% de tu donación va a servicios. Telos no cobra comisión.",
  "why.card.kicker": "Reparto por servicio",
  "why.card.note": "a negocios",
  "why.card.foot":
    "Los costos operativos de Telos se financian con un fondo aparte de donaciones de operación y grants. Nunca tocan tu donación.",

  // CTA
  "cta.h": "Una panadería en Medellín hoy. Una red de mil negocios mañana.",
  "cta.p":
    "Empieza con USD $25. Verás exactamente a qué negocio fue, qué servicio recibió, y quién lo entregó.",
  "cta.b1": "Donar",
  "cta.b2": "Cómo funciona",

  // Categories
  "cat.marketing": "Marketing y branding",
  "cat.tech": "Tecnología y web",
  "cat.accounting": "Contabilidad",
  "cat.legal": "Legal y compliance",
  "cat.export": "Exportación",

  // How it works
  "how.kicker": "Cómo funciona",
  "how.title": "Un modelo simple, diseñado para no perder un peso.",
  "how.sub":
    "Pensamos Telos al revés: empezamos preguntando \"¿cómo evitamos que el dinero se desvíe o se pierda en gastos?\" El resultado es un flujo donde los fondos van directo a agencias verificadas, no al efectivo del negocio.",
  "how.faq": "Preguntas frecuentes",
  "how.q1": "¿Cómo sé que mi donación llegó?",
  "how.a1":
    "Después de transferir, subes el comprobante (PDF o captura) en el flujo de donación. Telos valida contra el banco en 24–48 horas, te notifica por email y publica el aporte en el libro mayor con tu ID de transacción. En esta fase piloto no emitimos certificados con beneficio tributario.",
  "how.q2": "¿Por qué no le dan el dinero directamente al negocio?",
  "how.a2":
    "Para reducir fraude y mejorar resultados. Cuando una microempresa recibe efectivo, suele cubrir gastos urgentes en lugar de invertir en capacidades. Pagando a la agencia, el servicio se entrega sí o sí.",
  "how.q3": "¿Cuánto se queda Telos de mi donación?",
  "how.a3":
    "Nada. El 100% de tu donación va a servicios para negocios. Los costos operativos de Telos (verificación, plataforma, auditoría, equipo) se financian con un fondo aparte de donaciones de operación o grants, separados del fondo de servicios. Ambos quedan publicados en el libro mayor.",
  "how.q4": "Soy agencia. ¿Cómo me registro?",
  "how.a4":
    "Postula desde Portal Agencia. Validamos cámara de comercio, RUT y mínimo 3 referencias. Proceso ~2 semanas.",

  // Transparency
  "trans.kicker": "Libro mayor público",
  "trans.title": "Transparencia, en vivo.",
  "trans.sub":
    "Cada donación, desembolso y entregable de Telos, accesible para cualquier persona. Sin filtros.",
  "trans.csv": "Descargar CSV",
  "trans.audit": "Auditoría 2025",
  "trans.escrow": "En custodia",
  "trans.pending": "Pendiente de desembolso",
  "trans.bycategory": "Por categoría de servicio",
  "trans.totaldisb": "Sobre total desembolsado",
  "trans.ledger": "Libro mayor",
  "trans.ledgersub": "Todas las transacciones, ordenadas por fecha",
  "trans.filter.all": "Todos los tipos",
  "trans.filter.donation": "Donaciones",
  "trans.filter.disbursement": "Desembolsos",
  "trans.filter.deliverable": "Entregables",
  "trans.col.date": "Fecha",
  "trans.col.type": "Tipo",
  "trans.col.from": "De",
  "trans.col.to": "A",
  "trans.col.purpose": "Concepto",
  "trans.col.amount": "Monto",
  "trans.col.proof": "Prueba",
  "trans.rfps.t": "RFPs abiertas en este momento",
  "trans.rfps.sub":
    "Negocios buscando agencia. Cualquiera puede ver qué propuestas ya llegaron.",
  "trans.rfps.cta": "¿Eres agencia? Postula desde tu portal",
  "trans.rfps.budget": "Presupuesto",
  "trans.rfps.noyet": "Aún sin propuestas — sé el primero.",

  // Businesses
  "biz.kicker": "Negocios",
  "biz.title": "Historias en curso.",
  "biz.sub":
    "Cada negocio postuló, fue evaluado, y está esperando o recibiendo servicios. Da clic para ver detalles, donantes y entregables.",
  "biz.filter.all": "Todos",
  "biz.back": "Volver a negocios",
  "biz.raised": "Recaudado",
  "biz.of": "de",
  "biz.donors": "donantes",
  "biz.milestones": "Hitos",
  "biz.story": "Historia",
  "biz.service": "Servicio solicitado",
  "biz.deliveredby": "Entregado por",
  "biz.projecttimeline": "Hitos del proyecto",
  "biz.completed": "Completado · prueba publicada",
  "biz.pending": "Pendiente",
  "biz.goalmet": "Meta cumplida",
  "biz.remaining": "Falta",
  "biz.cta": "Donar a este negocio",
  "biz.vetted":
    "Verificado por Telos. Existencia confirmada con visita presencial y validación de la comunidad.",
  "biz.years": "años de operación",

  // Postulados
  "post.kicker": "Postulados · comunidad",
  "post.title": "La comunidad decide quién sigue.",
  "post.sub":
    "Negocios postulados por la comunidad. Vota por los que crees que más necesitan crecer. Los más votados pasan a evaluación prioritaria por Telos.",
  "post.cta": "Postular un negocio",
  "post.howvote.t": "Voto sin registro, pero con frenos contra abuso.",
  "post.howvote.p":
    "No necesitas crear cuenta. Validamos con Cloudflare Turnstile (sin recopilar datos personales), limitamos a 1 voto por negocio por persona cada 24 horas, y aplicamos rate limiting por IP. Si detectamos patrones automatizados los descontamos.",
  "post.sort.votes": "Más votados",
  "post.sort.recent": "Más recientes",
  "post.review": "En revisión Telos",
  "post.approved": "Aprobado para votar",
  "post.by": "Postulado por",
  "post.needs": "Necesita:",
  "post.voted": "Ya votaste",
  "post.vote": "Votar",
  "post.watchvideo": "Ver video del negocio",
  "post.empty": "No hay postulados todavía. Sé el primero en proponer uno.",

  // Postular form
  "postular.back": "Volver a postulados",
  "postular.kicker": "Postular un negocio",
  "postular.title": "¿Conoces un negocio que merece crecer?",
  "postular.sub":
    "Cualquier persona puede postular: el dueño, un cliente, un familiar. Telos revisará en 5 días hábiles.",
  "postular.s1": "Negocio",
  "postular.s2": "Historia",
  "postular.s3": "Tu contacto",
  "postular.s4": "Verificación",
  "postular.f.name": "Nombre del negocio",
  "postular.f.city": "Ciudad",
  "postular.f.years": "Años operando",
  "postular.f.category": "¿Qué tipo de servicio necesita?",
  "postular.f.address": "Dirección física",
  "postular.f.addressnote":
    "Solo Telos lo verá. Sirve para verificar la existencia del negocio.",
  "postular.f.video": "Video o YouTube URL",
  "postular.f.optional": "(opcional)",
  "postular.f.videonote":
    "Si grabaste un video del negocio (aunque sea con celular), ayuda mucho a verificar y a los votantes a conectarse.",
  "postular.f.story": "Historia del negocio",
  "postular.f.need": "¿Qué necesita específicamente?",
  "postular.f.why": "¿Por qué merece crecer?",
  "postular.contact.note":
    "Necesitamos un contacto solo para validar la postulación. No se publica.",
  "postular.f.fullname": "Tu nombre",
  "postular.f.email": "Tu email",
  "postular.f.relation": "¿Cuál es tu relación con el negocio?",
  "postular.rel.owner": "Soy el dueño / la dueña",
  "postular.rel.family": "Familiar del dueño",
  "postular.rel.customer": "Soy cliente",
  "postular.rel.friend": "Amigo / vecino",
  "postular.rel.other": "Otro",
  "postular.f.confirm":
    "Confirmo que este es un negocio real y que los datos son verídicos. Entiendo que Telos verificará antes de aprobar.",
  "postular.tstile": "No soy un robot",
  "postular.privacy": "protege tu privacidad",
  "postular.submit": "Enviar postulación",
  "postular.ok.t": "¡Postulación recibida!",
  "postular.ok.p":
    "Telos revisará en los próximos 5 días hábiles. Te notificaremos por email cuando sea aprobada o si necesitamos más información. ID:",
  "postular.ok.cta": "Ver postulados",
  "postular.sr.t": "Qué pasa después",
  "postular.sr.s1": "Tu postulación entra a la cola de revisión de Telos.",
  "postular.sr.s2":
    "Verificamos que el negocio existe — visita presencial, video o validación de la comunidad.",
  "postular.sr.s3": "Si aprueba, aparece en el muro público para recibir votos.",
  "postular.sr.s4": "Los más votados pasan a evaluación de necesidad y match con agencia.",
  "postular.sr.priv":
    "Solo el nombre del negocio, ciudad y necesidad son públicos. Tu contacto queda privado.",

  // Agencies
  "ag.kicker": "Agencias verificadas",
  "ag.title": "Quién entrega el servicio.",
  "ag.sub":
    "Toda agencia en Telos pasa por verificación legal, financiera y de referencias. Sus tarifas son auditadas y publicadas.",
  "ag.verified": "Verificada",
  "ag.projects": "Proyectos",
  "ag.csat": "CSAT",
  "ag.team": "Equipo",
  "ag.lead": "Líder",
  "ag.apply.t": "¿Tienes una agencia? Postula.",
  "ag.apply.p": "Proceso de verificación ~2 semanas. Sin costo.",
  "ag.apply.cta": "Postular mi agencia",

  // Donate
  "don.kicker": "Donar",
  "don.title": "Tu donación, paso a paso.",
  "don.sub":
    "Cuatro pasos. Transferencia directa. Validamos el comprobante en 24–48h y verás tu aporte en el libro mayor.",
  "don.s1": "Monto",
  "don.s2": "Destino",
  "don.s3": "Transferir",
  "don.s4": "Comprobante",
  "don.amount.label": "¿Cuánto quieres donar?",
  "don.next": "Continuar",
  "don.back": "Atrás",
  "don.dest.label": "¿A dónde quieres que vaya?",
  "don.dest.general": "Fondo general Telos",
  "don.dest.generalsub": "Distribuido entre negocios más urgentes",
  "don.dest.specific": "Un negocio específico",
  "don.dest.specificsub": "Eliges de la lista de negocios postulados",
  "don.dest.category": "Una categoría de servicio",
  "don.dest.categorysub": "Ej: solo marketing, solo contabilidad",
  "don.tr.label": "Haz tu transferencia",
  "don.tr.sub":
    "Telos no procesa pagos automáticamente en esta fase. Transfiere directamente y luego sube el comprobante.",
  "don.tr.ref": "Tu código de referencia",
  "don.tr.copy": "Copiar",
  "don.tr.refnote":
    "Inclúyelo en la descripción/concepto de la transferencia para que Telos identifique tu aporte más rápido.",
  "don.tr.intl": "Internacional",
  "don.tr.savings": "Cuenta de ahorros",
  "don.tr.holder": "Titular",
  "don.tr.polygon": "Red Polygon",
  "don.tr.polygonnote":
    "Red recomendada: Polygon (gas barato). También aceptamos Base y Ethereum.",
  "don.tr.wirenote":
    "Para transferencias bancarias internacionales escríbenos a tesoreria@telos.foundation y te enviamos las instrucciones SWIFT.",
  "don.tr.next": "Continuar a comprobante",
  "don.up.label": "Sube tu comprobante",
  "don.up.sub":
    "PDF o captura de la transferencia. Validamos contra el banco en 24–48 horas y verás tu aporte reflejado en el libro mayor.",
  "don.up.dz1": "Arrastra el archivo o haz clic para subir",
  "don.up.dz2": "PDF, PNG o JPG · hasta 5MB",
  "don.up.change": "Haz clic para cambiar",
  "don.up.email": "Tu email",
  "don.up.emailnote":
    "Te notificaremos cuando validemos. También es tu acceso al portal de donante (sin contraseña, te enviamos un link mágico cuando quieras entrar).",
  "don.up.bankref": "Referencia bancaria",
  "don.up.opt": "(opcional)",
  "don.up.date": "Fecha de transferencia",
  "don.up.msg": "Mensaje a Telos",
  "don.up.submit": "Enviar comprobante",
  "don.up.anon": "Donar anónimamente",
  "don.up.anonnote":
    "En el libro mayor público aparecerás como \"Anónimo · País\". Telos sabe quién eres por el email para notificarte, pero no lo publica.",
  "don.thx": "¡Recibimos tu comprobante!",
  "don.thx.p":
    "Validaremos el aporte con el banco en las próximas 24–48 horas. Te notificaremos por email y aparecerá en el libro mayor.",
  "don.thx.status": "Estado: validando",
  "don.thx.cta": "Ver mi portal de donante",
  "don.thx.ledger": "Ver el libro mayor",
  "don.sum.t": "Resumen",
  "don.sum.donation": "Donación",
  "don.sum.toservices": "Va a servicios",
  "don.sum.note":
    "100% de tu donación va a servicios. Telos no cobra comisión. Tu aporte queda publicado en el libro mayor con trazabilidad completa una vez validado.",

  // Magic link
  "login.back": "Volver al inicio",
  "login.title": "Tu portal de donante",
  "login.sub":
    "Sin contraseña. Te enviamos un link mágico al email con el que donaste y entras de un clic.",
  "login.title.donor": "Tu portal de donante",
  "login.sub.donor":
    "Sin contraseña. Te enviamos un link mágico al email con el que donaste y entras de un clic.",
  "login.title.agency": "Portal de agencias",
  "login.sub.agency":
    "Sin contraseña. Si tu agencia ya está vetada, recibirás los RFPs abiertos en tu categoría. Si no, puedes postular tu agencia desde dentro.",
  "login.title.admin": "Panel Telos",
  "login.sub.admin":
    "Acceso solo para el equipo de Telos. Te enviamos un link mágico al email autorizado.",
  "login.email": "Tu email",
  "login.send": "Enviar link mágico",
  "login.note":
    "¿No tienes cuenta? No necesitas crearla. Si donaste antes con este email te llegará el link; si no, te invitamos a hacer tu primer aporte.",
  "login.sent.t": "Revisa tu email.",
  "login.sent.p": "Enviamos un link mágico a",
  "login.sent.p2": "El link expira en 15 minutos.",
  "login.resend": "Reenviar link",
  "login.change": "Cambiar email",
  "login.verify.title": "Verificando tu sesión…",
  "login.verify.fail.title": "Link inválido o expirado",
  "login.verify.fail.p": "Los links mágicos expiran en 15 minutos. Pide uno nuevo.",
  "login.verify.fail.cta": "Pedir un nuevo link",

  // Donor portal
  "dp.kicker": "Portal donante",
  "dp.title": "Hola",
  "dp.sub": "Estos son los negocios que impulsaste y dónde va tu dinero.",
  "dp.again": "Donar de nuevo",
  "dp.totaldonated": "Total donado",
  "dp.businesses": "Negocios apoyados",
  "dp.deliverables": "Entregables completados",
  "dp.thisyear": "Aportado este año",
  "dp.impact": "Tu impacto, traceado",
  "dp.viewledger": "Ver libro mayor completo",
  "dp.pending": "Validación en curso",
  "dp.lastsent": "Tu último aporte",
  "dp.validating": "Validando",
  "dp.refl": "Referencia",
  "dp.submitted": "Enviado",
  "dp.eta": "Telos validará en 24–48h y notificará por email.",
  "dp.again.t": "¿Listo para aportar de nuevo?",
  "dp.again.p":
    "Cada aporte impulsa a un negocio real. Verás exactamente a dónde va.",
  "dp.again.cta": "Donar de nuevo",
  "dp.logout": "Salir",
  "dp.empty": "Aún no tienes aportes registrados. Cuando dones, aparecerán aquí.",

  // Agency portal
  "ap.kicker": "Portal agencia",
  "ap.title": "Buenos días",
  "ap.sub": "Tus RFPs abiertas y proyectos activos.",
  "ap.invoice": "Nueva factura",
  "ap.deliver": "Subir entregable",
  "ap.active": "Proyectos activos",
  "ap.pending": "Hitos pendientes",
  "ap.invoiced": "Facturado YTD",
  "ap.csat": "Satisfacción",
  "ap.rfps.t": "RFPs abiertas para ti",
  "ap.rfps.sub": "RFPs activos en tu categoría que puedes postular.",
  "ap.rfps.empty": "No hay RFPs abiertas en tu categoría ahora mismo.",
  "ap.bid": "Postular",
  "ap.alreadybid": "Ya postulada",
  "ap.proposalsCount": "propuestas hasta ahora",
  "ap.projects": "Proyectos activos",
  "ap.next": "Próximos pagos",
  "ap.empty": "Aún no tienes proyectos asignados.",

  // Bid modal
  "bid.to": "Postular a",
  "bid.scope": "Alcance del trabajo",
  "bid.cost": "Costo (COP)",
  "bid.weeks": "Semanas",
  "bid.team": "Equipo",
  "bid.public":
    "Tu propuesta queda visible en la página de Transparencia y para el negocio. Sé honesto y específico.",
  "bid.submit": "Enviar propuesta",
  "bid.ok": "Propuesta enviada",

  // Admin
  "adm.kicker": "Panel Telos · interno",
  "adm.title": "Operaciones",
  "adm.sub":
    "Aprobaciones pendientes, validación de donaciones y pipeline de RFPs.",
  "adm.live": "Sistema operativo",
  "adm.queue.t": "Aprobaciones pendientes",
  "adm.f.all": "Todo",
  "adm.f.biz": "Negocios",
  "adm.f.ag": "Agencias",
  "adm.f.disb": "Desembolsos",
  "adm.donations.t": "Donaciones por validar",
  "adm.donations.confirm": "Marcar como recibida",
  "adm.donations.reject": "Rechazar",
  "adm.donations.empty": "No hay donaciones pendientes de validación.",
  "adm.pipe.t": "Pipeline de RFPs",
  "adm.pipe.sub":
    "Negocios aprobados en proceso de match. Expande cada uno para ver propuestas recibidas.",
  "adm.pipe.all": "Todas",
  "adm.pipe.open": "Abiertas",
  "adm.pipe.review": "En revisión",
  "adm.pipe.awarded": "Asignadas",
  "adm.pipe.review.help":
    "Deadline cerrado. SMB está revisando — apóyalo a decidir y marca la propuesta elegida.",
  "adm.pipe.awarded.help": "SMB eligió a",
  "adm.pipe.awarded.help2": "Contrato firmado, proyecto en curso.",
  "adm.pipe.empty": "Nada en esta etapa.",
  "adm.award": "Marcar elegida por SMB",
  "adm.awarded.tag": "Elegida por el negocio",
  "adm.proposal.new": "Nueva",
  "adm.proposal.empty": "Sin propuestas aún.",
  "adm.approve": "Aprobar postulación",
  "adm.reject": "Rechazar",

  // Turnstile / verification
  "ts.title": "Verificación",
  "ts.sub": "Confirmamos que eres una persona, no un bot.",
  "ts.checking": "Verificando...",
  "ts.ok": "Verificado",
  "ts.privacy":
    "No recopilamos datos personales. Solo validamos que tu navegador es legítimo.",

  // Footer
  "ft.about":
    "Fundación dedicada a impulsar pequeños negocios en Colombia con servicios profesionales financiados por donantes globales.",
  "ft.pilot": "Operación piloto 2026 · Bogotá / Medellín",
  "ft.manual": "Aportes validados manualmente por nuestro equipo (24–48h)",
  "ft.about.t": "Sobre Telos",
  "ft.team": "Equipo",
  "ft.board": "Junta directiva",
  "ft.act": "Actúa",
  "ft.beagency": "Postular como agencia",
  "ft.bebiz": "Postular como negocio",
  "ft.volunteer": "Ser voluntario",
  "ft.contact": "Contacto",
  "ft.rights": "Todos los derechos reservados",
  "ft.privacy": "Privacidad",
  "ft.terms": "Términos",
  "ft.code": "Código de conducta",

  // Generic
  "common.copy": "Copiar",
  "common.copied": "Copiado",
  "common.loading": "Cargando…",
  "common.error": "Algo salió mal. Inténtalo de nuevo.",
  "common.dismiss": "Cerrar",
  "common.required": "Requerido",
};

export const en: Dict = {
  "nav.how": "How it works",
  "nav.transparency": "Transparency",
  "nav.businesses": "Businesses",
  "nav.postulados": "Nominees",
  "nav.agencies": "Agencies",
  "nav.donate": "Donate",
  "nav.portals": "Portals",
  "nav.portal.donor": "Donor portal",
  "nav.portal.agency": "Agency portal",
  "nav.portal.admin": "Telos panel",
  "nav.back.home": "Back to home",

  "hero.pill": "Pilot foundation — Colombia 2026",
  "hero.h1a": "Capital with purpose",
  "hero.h1b": "for Colombia's small businesses.",
  "hero.sub":
    "We connect donors with vetted agencies that deliver services — marketing, accounting, legal, technology — to businesses ready to grow. The business never receives cash. You see every dollar.",
  "hero.cta.donate": "Donate now",
  "hero.cta.transparency": "See where money goes",

  "stat.raised": "Raised",
  "stat.disbursed": "Disbursed",
  "stat.deployed": "deployed",
  "stat.businesses": "Businesses impacted",
  "stat.cities": "cities",
  "stat.agencies": "Active agencies",
  "stat.verified": "100% vetted",
  "stat.donors": "Donors",
  "stat.countries": "countries",
  "stat.toservices": "To services",
  "stat.fee0": "Telos charges no fee",

  "flow.kicker": "The model",
  "flow.title": "Your donation never touches the business.",
  "flow.sub":
    "Telos pays the agency directly. This reduces fraud, simplifies taxes, and makes every dollar traceable.",
  "flow.s1.t": "Donor contributes",
  "flow.s1.d":
    "You transfer directly to Telos and upload the proof. We validate against the bank in 24–48h.",
  "flow.s2.t": "Telos evaluates",
  "flow.s2.d":
    "We verify nominated businesses (visit and community) and audit agencies (chamber of commerce, references, portfolio).",
  "flow.s3.t": "Public RFP opens",
  "flow.s3.d":
    "We email all vetted agencies in the relevant categories. Anyone can submit a proposal. The business picks.",
  "flow.s4.t": "We pay and publish",
  "flow.s4.d":
    "Telos pays the agency against deliverables. Invoice and proof are public.",

  "featured.kicker": "Featured businesses",
  "featured.title": "Who's growing with Telos.",
  "featured.viewall": "View all",
  "trust.label": "Donors from",

  "why.kicker": "Why transparency",
  "why.title": "Every dollar online. Every deliverable public.",
  "why.p1":
    "Trust in philanthropy is earned with data, not speeches. So we publish every transaction — donations, disbursements, invoices, deliverables — in an open ledger.",
  "why.b1": "Public real-time ledger.",
  "why.b2": "Every disbursement has invoice and deliverable attached.",
  "why.b3": "Annual external audit published on the site.",
  "why.b4": "100% of your donation goes to services. Telos charges no fee.",
  "why.card.kicker": "Breakdown by service",
  "why.card.note": "to businesses",
  "why.card.foot":
    "Telos's operating costs are funded by a separate stream of operations donations and grants. They never touch your donation.",

  "cta.h": "A bakery in Medellín today. A thousand businesses tomorrow.",
  "cta.p":
    "Start with USD $25. You'll see exactly which business it went to, what service it bought, and who delivered it.",
  "cta.b1": "Donate",
  "cta.b2": "How it works",

  "cat.marketing": "Marketing & branding",
  "cat.tech": "Tech & web",
  "cat.accounting": "Accounting",
  "cat.legal": "Legal & compliance",
  "cat.export": "Exports",

  "how.kicker": "How it works",
  "how.title": "A simple model, designed not to lose a dollar.",
  "how.sub":
    "We designed Telos backwards: starting from \"how do we prevent money from being diverted or wasted on overhead?\" The result is a flow where funds go directly to verified agencies, not to the business's cash.",
  "how.faq": "Frequently asked questions",
  "how.q1": "How do I know my donation arrived?",
  "how.a1":
    "After transferring, you upload the proof (PDF or screenshot) in the donation flow. Telos validates against the bank in 24–48 hours, notifies you by email, and publishes the contribution in the ledger with your transaction ID. In this pilot phase we do not issue tax-deduction certificates.",
  "how.q2": "Why not give money directly to the business?",
  "how.a2":
    "To reduce fraud and improve outcomes. When a microbusiness gets cash, it often covers urgent expenses instead of investing in capabilities. Paying the agency ensures the service is delivered.",
  "how.q3": "How much does Telos keep from my donation?",
  "how.a3":
    "Zero. 100% of your donation goes to services for businesses. Telos operating costs (vetting, platform, audit, team) are funded by a separate stream of operations donations or grants, distinct from the services fund. Both are published in the ledger.",
  "how.q4": "I'm an agency. How do I register?",
  "how.a4":
    "Apply from Agency Portal. We validate registration, tax ID and 3+ references. ~2 week process.",

  "trans.kicker": "Public ledger",
  "trans.title": "Transparency, live.",
  "trans.sub":
    "Every Telos donation, disbursement and deliverable, accessible to anyone. No filters.",
  "trans.csv": "Download CSV",
  "trans.audit": "2025 audit",
  "trans.escrow": "In escrow",
  "trans.pending": "Pending disbursement",
  "trans.bycategory": "By service category",
  "trans.totaldisb": "Of total disbursed",
  "trans.ledger": "Ledger",
  "trans.ledgersub": "All transactions, sorted by date",
  "trans.filter.all": "All types",
  "trans.filter.donation": "Donations",
  "trans.filter.disbursement": "Disbursements",
  "trans.filter.deliverable": "Deliverables",
  "trans.col.date": "Date",
  "trans.col.type": "Type",
  "trans.col.from": "From",
  "trans.col.to": "To",
  "trans.col.purpose": "Purpose",
  "trans.col.amount": "Amount",
  "trans.col.proof": "Proof",
  "trans.rfps.t": "Open RFPs right now",
  "trans.rfps.sub":
    "Businesses seeking an agency. Anyone can see which proposals have arrived.",
  "trans.rfps.cta": "Are you an agency? Bid from your portal",
  "trans.rfps.budget": "Budget",
  "trans.rfps.noyet": "No proposals yet — be the first.",

  "biz.kicker": "Businesses",
  "biz.title": "Stories in motion.",
  "biz.sub":
    "Each business applied, was vetted, and is awaiting or receiving services. Click to see details, donors and deliverables.",
  "biz.filter.all": "All",
  "biz.back": "Back to businesses",
  "biz.raised": "Raised",
  "biz.of": "of",
  "biz.donors": "donors",
  "biz.milestones": "Milestones",
  "biz.story": "Story",
  "biz.service": "Service requested",
  "biz.deliveredby": "Delivered by",
  "biz.projecttimeline": "Project milestones",
  "biz.completed": "Completed · proof published",
  "biz.pending": "Pending",
  "biz.goalmet": "Goal met",
  "biz.remaining": "Remaining",
  "biz.cta": "Donate to this business",
  "biz.vetted":
    "Vetted by Telos. Existence confirmed via in-person visit and community validation.",
  "biz.years": "years operating",

  "post.kicker": "Community nominees",
  "post.title": "The community decides who's next.",
  "post.sub":
    "Businesses nominated by the community. Vote for those you believe most need to grow. The most upvoted get priority review by Telos.",
  "post.cta": "Nominate a business",
  "post.howvote.t": "Vote without registering, but with abuse controls.",
  "post.howvote.p":
    "No account needed. We verify with Cloudflare Turnstile (no personal data), limit 1 vote per business per person every 24 hours, and apply per-IP rate limiting. Automated patterns are discarded.",
  "post.sort.votes": "Most voted",
  "post.sort.recent": "Most recent",
  "post.review": "Telos reviewing",
  "post.approved": "Approved for voting",
  "post.by": "Nominated by",
  "post.needs": "Needs:",
  "post.voted": "You voted",
  "post.vote": "Vote",
  "post.watchvideo": "Watch business video",
  "post.empty": "No nominees yet. Be the first to nominate one.",

  "postular.back": "Back to nominees",
  "postular.kicker": "Nominate a business",
  "postular.title": "Know a business that deserves to grow?",
  "postular.sub":
    "Anyone can nominate: the owner, a customer, a relative. Telos reviews in 5 business days.",
  "postular.s1": "Business",
  "postular.s2": "Story",
  "postular.s3": "Your contact",
  "postular.s4": "Verification",
  "postular.f.name": "Business name",
  "postular.f.city": "City",
  "postular.f.years": "Years operating",
  "postular.f.category": "What service does it need?",
  "postular.f.address": "Physical address",
  "postular.f.addressnote": "Only Telos sees this. Helps verify the business exists.",
  "postular.f.video": "Video or YouTube URL",
  "postular.f.optional": "(optional)",
  "postular.f.videonote":
    "If you filmed a video of the business (even with a phone), it greatly helps verification and lets voters connect.",
  "postular.f.story": "Business story",
  "postular.f.need": "What does it specifically need?",
  "postular.f.why": "Why does it deserve to grow?",
  "postular.contact.note":
    "We need a contact only to validate the nomination. Not published.",
  "postular.f.fullname": "Your name",
  "postular.f.email": "Your email",
  "postular.f.relation": "Your relationship to the business?",
  "postular.rel.owner": "I am the owner",
  "postular.rel.family": "Owner's family",
  "postular.rel.customer": "I am a customer",
  "postular.rel.friend": "Friend / neighbor",
  "postular.rel.other": "Other",
  "postular.f.confirm":
    "I confirm this is a real business and the data is truthful. I understand Telos will verify before approving.",
  "postular.tstile": "I'm not a robot",
  "postular.privacy": "protects your privacy",
  "postular.submit": "Submit nomination",
  "postular.ok.t": "Nomination received!",
  "postular.ok.p":
    "Telos will review within 5 business days. You'll get an email when approved or if we need more info. ID:",
  "postular.ok.cta": "View nominees",
  "postular.sr.t": "What happens next",
  "postular.sr.s1": "Your nomination enters Telos's review queue.",
  "postular.sr.s2":
    "We verify the business exists — in-person visit, video, or community validation.",
  "postular.sr.s3": "If approved, it appears on the public board for voting.",
  "postular.sr.s4":
    "The most voted progress to needs assessment and agency match.",
  "postular.sr.priv":
    "Only business name, city and need are public. Your contact stays private.",

  "ag.kicker": "Verified agencies",
  "ag.title": "Who delivers the service.",
  "ag.sub":
    "Every Telos agency passes legal, financial and reference verification. Their rates are audited and published.",
  "ag.verified": "Verified",
  "ag.projects": "Projects",
  "ag.csat": "CSAT",
  "ag.team": "Team",
  "ag.lead": "Lead",
  "ag.apply.t": "Have an agency? Apply.",
  "ag.apply.p": "~2-week verification. No cost.",
  "ag.apply.cta": "Apply my agency",

  "don.kicker": "Donate",
  "don.title": "Your donation, step by step.",
  "don.sub":
    "Four steps. Direct transfer. We validate the proof within 24–48h and you'll see your contribution in the ledger.",
  "don.s1": "Amount",
  "don.s2": "Destination",
  "don.s3": "Transfer",
  "don.s4": "Proof",
  "don.amount.label": "How much do you want to donate?",
  "don.next": "Continue",
  "don.back": "Back",
  "don.dest.label": "Where should it go?",
  "don.dest.general": "Telos general fund",
  "don.dest.generalsub": "Distributed among most urgent businesses",
  "don.dest.specific": "A specific business",
  "don.dest.specificsub": "You pick from the applicant list",
  "don.dest.category": "A service category",
  "don.dest.categorysub": "E.g. marketing only, accounting only",
  "don.tr.label": "Make your transfer",
  "don.tr.sub":
    "Telos doesn't process payments automatically in this phase. Transfer directly and then upload the proof.",
  "don.tr.ref": "Your reference code",
  "don.tr.copy": "Copy",
  "don.tr.refnote":
    "Include it in the transfer description/memo so Telos can identify your contribution faster.",
  "don.tr.intl": "International",
  "don.tr.savings": "Savings account",
  "don.tr.holder": "Holder",
  "don.tr.polygon": "Polygon network",
  "don.tr.polygonnote":
    "Recommended network: Polygon (cheap gas). We also accept Base and Ethereum.",
  "don.tr.wirenote":
    "For international bank transfers email tesoreria@telos.foundation and we'll send SWIFT instructions.",
  "don.tr.next": "Continue to proof",
  "don.up.label": "Upload your proof",
  "don.up.sub":
    "PDF or screenshot of the transfer. We verify against the bank within 24–48 hours and you'll see your contribution in the ledger.",
  "don.up.dz1": "Drag the file or click to upload",
  "don.up.dz2": "PDF, PNG or JPG · up to 5MB",
  "don.up.change": "Click to change",
  "don.up.email": "Your email",
  "don.up.emailnote":
    "We'll notify you once validated. It's also your donor portal access (no password — we send a magic link whenever you want to sign in).",
  "don.up.bankref": "Bank reference",
  "don.up.opt": "(optional)",
  "don.up.date": "Transfer date",
  "don.up.msg": "Message to Telos",
  "don.up.submit": "Send proof",
  "don.up.anon": "Donate anonymously",
  "don.up.anonnote":
    "You'll appear as \"Anonymous · Country\" in the public ledger. Telos knows who you are via your email so we can notify you, but won't publish it.",
  "don.thx": "Proof received!",
  "don.thx.p":
    "We'll validate the contribution against the bank in the next 24–48 hours. We'll notify you by email and it will appear in the ledger.",
  "don.thx.status": "Status: validating",
  "don.thx.cta": "View my donor portal",
  "don.thx.ledger": "View the ledger",
  "don.sum.t": "Summary",
  "don.sum.donation": "Donation",
  "don.sum.toservices": "Goes to services",
  "don.sum.note":
    "100% of your donation goes to services. Telos charges no fee. Your contribution is published in the ledger with full traceability once validated.",

  "login.back": "Back to home",
  "login.title": "Your donor portal",
  "login.sub":
    "No password. We send a magic link to the email you donated with — one click and you're in.",
  "login.title.donor": "Your donor portal",
  "login.sub.donor":
    "No password. We send a magic link to the email you donated with — one click and you're in.",
  "login.title.agency": "Agency portal",
  "login.sub.agency":
    "No password. If your agency is already vetted, you'll see open RFPs in your category. If not, you can apply from inside.",
  "login.title.admin": "Telos panel",
  "login.sub.admin":
    "Telos team only. We'll send a magic link to the authorized email.",
  "login.email": "Your email",
  "login.send": "Send magic link",
  "login.note":
    "No account? You don't need one. If you donated before with this email, the link will arrive; if not, we'd love your first contribution.",
  "login.sent.t": "Check your email.",
  "login.sent.p": "We sent a magic link to",
  "login.sent.p2": "The link expires in 15 minutes.",
  "login.resend": "Resend link",
  "login.change": "Change email",
  "login.verify.title": "Verifying your session…",
  "login.verify.fail.title": "Invalid or expired link",
  "login.verify.fail.p":
    "Magic links expire after 15 minutes. Request a new one.",
  "login.verify.fail.cta": "Request a new link",

  "dp.kicker": "Donor portal",
  "dp.title": "Hi",
  "dp.sub": "Here are the businesses you backed and where your money is going.",
  "dp.again": "Donate again",
  "dp.totaldonated": "Total donated",
  "dp.businesses": "Businesses supported",
  "dp.deliverables": "Deliverables completed",
  "dp.thisyear": "Donated this year",
  "dp.impact": "Your impact, traced",
  "dp.viewledger": "View full ledger",
  "dp.pending": "Validation in progress",
  "dp.lastsent": "Your last contribution",
  "dp.validating": "Validating",
  "dp.refl": "Reference",
  "dp.submitted": "Submitted",
  "dp.eta": "Telos will validate within 24–48h and notify by email.",
  "dp.again.t": "Ready to contribute again?",
  "dp.again.p":
    "Every contribution lifts a real business. You'll see exactly where it goes.",
  "dp.again.cta": "Donate again",
  "dp.logout": "Sign out",
  "dp.empty": "No contributions on record yet. When you donate, they'll appear here.",

  "ap.kicker": "Agency portal",
  "ap.title": "Good morning",
  "ap.sub": "Your open RFPs and active projects.",
  "ap.invoice": "New invoice",
  "ap.deliver": "Upload deliverable",
  "ap.active": "Active projects",
  "ap.pending": "Pending milestones",
  "ap.invoiced": "Invoiced YTD",
  "ap.csat": "Satisfaction",
  "ap.rfps.t": "Open RFPs for you",
  "ap.rfps.sub": "Active RFPs in your category that you can bid on.",
  "ap.rfps.empty": "No open RFPs in your category right now.",
  "ap.bid": "Bid",
  "ap.alreadybid": "Already bid",
  "ap.proposalsCount": "proposals so far",
  "ap.projects": "Active projects",
  "ap.next": "Upcoming payments",
  "ap.empty": "No assigned projects yet.",

  "bid.to": "Bid on",
  "bid.scope": "Scope of work",
  "bid.cost": "Cost (COP)",
  "bid.weeks": "Weeks",
  "bid.team": "Team",
  "bid.public":
    "Your proposal is visible on the Transparency page and to the business. Be honest and specific.",
  "bid.submit": "Submit proposal",
  "bid.ok": "Proposal submitted",

  "adm.kicker": "Telos panel · internal",
  "adm.title": "Operations",
  "adm.sub":
    "Pending approvals, donation validation, and RFP pipeline.",
  "adm.live": "System operational",
  "adm.queue.t": "Pending approvals",
  "adm.f.all": "All",
  "adm.f.biz": "Businesses",
  "adm.f.ag": "Agencies",
  "adm.f.disb": "Disbursements",
  "adm.donations.t": "Donations to validate",
  "adm.donations.confirm": "Mark as received",
  "adm.donations.reject": "Reject",
  "adm.donations.empty": "No donations awaiting validation.",
  "adm.pipe.t": "RFP pipeline",
  "adm.pipe.sub":
    "Approved businesses in the matching process. Expand each to see received proposals.",
  "adm.pipe.all": "All",
  "adm.pipe.open": "Open",
  "adm.pipe.review": "In review",
  "adm.pipe.awarded": "Awarded",
  "adm.pipe.review.help":
    "Deadline closed. SMB is reviewing — help them decide and mark the chosen proposal.",
  "adm.pipe.awarded.help": "SMB chose",
  "adm.pipe.awarded.help2": "Contract signed, project in progress.",
  "adm.pipe.empty": "Nothing at this stage.",
  "adm.award": "Mark chosen by SMB",
  "adm.awarded.tag": "Chosen by the business",
  "adm.proposal.new": "New",
  "adm.proposal.empty": "No proposals yet.",
  "adm.approve": "Approve nomination",
  "adm.reject": "Reject",

  "ts.title": "Verification",
  "ts.sub": "We confirm you're a person, not a bot.",
  "ts.checking": "Verifying...",
  "ts.ok": "Verified",
  "ts.privacy":
    "No personal data collected. We only validate your browser is legitimate.",

  "ft.about":
    "A foundation dedicated to lifting small businesses in Colombia through professional services funded by global donors.",
  "ft.pilot": "Pilot operation 2026 · Bogotá / Medellín",
  "ft.manual": "Contributions manually validated by our team (24–48h)",
  "ft.about.t": "About Telos",
  "ft.team": "Team",
  "ft.board": "Board",
  "ft.act": "Act",
  "ft.beagency": "Apply as agency",
  "ft.bebiz": "Apply as business",
  "ft.volunteer": "Volunteer",
  "ft.contact": "Contact",
  "ft.rights": "All rights reserved",
  "ft.privacy": "Privacy",
  "ft.terms": "Terms",
  "ft.code": "Code of conduct",

  "common.copy": "Copy",
  "common.copied": "Copied",
  "common.loading": "Loading…",
  "common.error": "Something went wrong. Try again.",
  "common.dismiss": "Dismiss",
  "common.required": "Required",
};

export const dictionaries: Record<Lang, Dict> = { es, en };
