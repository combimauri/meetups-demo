/**
 * Datos del meetup que usa toda la demo (frontend y agente).
 * Son datos de ejemplo: cámbialos por la agenda real de tu evento.
 */

export interface Sesion {
  id: string;
  titulo: string;
  ponente: string;
  hora: string;
  sala: string;
  nivel: 'Introductorio' | 'Intermedio' | 'Avanzado';
  track: 'IA' | 'Web' | 'Cloud' | 'Comunidad';
  resumen: string;
  cupos: number;
}

export const MEETUP = {
  nombre: 'Build with AI · GDG Sucre',
  fecha: 'Sábado · 9:30 a 13:30',
  lugar: 'Sucre, Bolivia',
  descripcion:
    'Una mañana de charlas y demos sobre IA aplicada al desarrollo web, organizada por la comunidad GDG Sucre.',
};

export const SESIONES: Sesion[] = [
  {
    id: 'web-agentica',
    titulo: 'Más allá del chat: interfaces agénticas en Angular',
    ponente: 'Mauri Arce',
    hora: '10:00',
    sala: 'Auditorio',
    nivel: 'Introductorio',
    track: 'Web',
    resumen: 'AG-UI, A2UI y CopilotKit para que un agente genere interfaces reales en Angular.',
    cupos: 80,
  },
  {
    id: 'gemini-api',
    titulo: 'Primeros pasos con la API de Gemini',
    ponente: 'Ponente por confirmar',
    hora: '10:45',
    sala: 'Auditorio',
    nivel: 'Introductorio',
    track: 'IA',
    resumen: 'Prompts, llamadas a funciones y salida estructurada con la API de Gemini.',
    cupos: 80,
  },
  {
    id: 'adk-agentes',
    titulo: 'Agentes con Google ADK',
    ponente: 'Ponente por confirmar',
    hora: '11:30',
    sala: 'Sala 2',
    nivel: 'Intermedio',
    track: 'IA',
    resumen: 'Cómo construir, probar y desplegar agentes con el Agent Development Kit.',
    cupos: 35,
  },
  {
    id: 'cloud-run',
    titulo: 'Despliega tu agente en Cloud Run',
    ponente: 'Ponente por confirmar',
    hora: '11:30',
    sala: 'Auditorio',
    nivel: 'Intermedio',
    track: 'Cloud',
    resumen: 'Del repo a producción: contenedores, variables secretas y escalado a cero.',
    cupos: 80,
  },
  {
    id: 'evals',
    titulo: 'Evaluar agentes: cómo saber si funcionan',
    ponente: 'Ponente por confirmar',
    hora: '12:15',
    sala: 'Sala 2',
    nivel: 'Avanzado',
    track: 'IA',
    resumen: 'Casos de prueba, métricas y regresiones para sistemas con LLM.',
    cupos: 35,
  },
  {
    id: 'comunidad',
    titulo: 'Cómo crecer en comunidad tech',
    ponente: 'Equipo GDG Sucre',
    hora: '13:00',
    sala: 'Auditorio',
    nivel: 'Introductorio',
    track: 'Comunidad',
    resumen: 'Voluntariado, speaking y oportunidades dentro de los GDG.',
    cupos: 80,
  },
];

export function buscarSesion(id: string): Sesion | undefined {
  return SESIONES.find((s) => s.id === id);
}

/** Texto con el evento y la agenda, para el prompt del agente. */
export function agendaComoTexto(): string {
  const lineas = SESIONES.map(
    (s) =>
      `- [${s.id}] ${s.hora} · ${s.sala} · "${s.titulo}" (${s.ponente}) · ${s.nivel} · track ${s.track} · ${s.cupos} cupos. ${s.resumen}`,
  );
  return [
    `Evento: ${MEETUP.nombre}`,
    `Cuándo: ${MEETUP.fecha}`,
    `Dónde: ${MEETUP.lugar}`,
    `De qué trata: ${MEETUP.descripcion}`,
    'Agenda:',
    ...lineas,
  ].join('\n');
}
