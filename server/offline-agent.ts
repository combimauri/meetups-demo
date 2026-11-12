/**
 * Plan B para el día de la charla: un agente AG-UI guionizado.
 *
 * No llama a ningún modelo. Lee el último mensaje, decide una respuesta con
 * reglas simples y emite los MISMOS eventos AG-UI que emitiría un agente real
 * (RUN_STARTED, TEXT_MESSAGE_*, TOOL_CALL_*, RUN_FINISHED). Así la demo funciona
 * sin wifi y, de paso, enseña qué viaja por el protocolo.
 */
import { AbstractAgent, EventType, type BaseEvent, type RunAgentInput } from '@ag-ui/client';
import { Observable } from 'rxjs';
import { randomUUID } from 'node:crypto';

import { MEETUP, SESIONES, buscarSesion } from '../src/app/data/meetup';

type Paso = 'paso1' | 'paso2' | 'paso3';
type Accion =
  | { tipo: 'nada' }
  | { tipo: 'texto'; texto: string }
  | { tipo: 'tool'; nombre: string; args: Record<string, unknown>; texto?: string };

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

function textoDe(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((p) => (typeof p === 'object' && p && 'text' in p ? String(p.text) : '')).join(' ');
  }
  return '';
}

function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function sesionesMencionadas(texto: string): string[] {
  const t = normalizar(texto);
  const porTrack = SESIONES.filter((s) => t.includes(normalizar(s.track)));
  if (porTrack.length) return porTrack.map((s) => s.id);
  const porNivel = SESIONES.filter((s) => t.includes(normalizar(s.nivel)));
  if (porNivel.length) return porNivel.map((s) => s.id);
  const porPalabra = SESIONES.filter((s) =>
    normalizar(s.titulo)
      .split(/\W+/)
      .some((w) => w.length > 4 && t.includes(w)),
  );
  return porPalabra.map((s) => s.id);
}

export class OfflineAgent extends AbstractAgent {
  constructor(private readonly paso: Paso) {
    super({ agentId: paso });
  }

  override clone(): OfflineAgent {
    return new OfflineAgent(this.paso);
  }

  override run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((obs) => {
      let cancelado = false;
      const emitir = (e: Record<string, unknown>) => {
        if (!cancelado) obs.next({ timestamp: Date.now(), ...e } as BaseEvent);
      };

      (async () => {
        emitir({ type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId });
        const accion = this.decidir(input);

        if (accion.tipo === 'tool') {
          if (accion.texto) await this.streamTexto(emitir, accion.texto);
          const toolCallId = `call_${randomUUID()}`;
          const parentMessageId = randomUUID();
          emitir({ type: EventType.TOOL_CALL_START, toolCallId, toolCallName: accion.nombre, parentMessageId });
          // Los argumentos viajan en trozos, como cuando el modelo los genera en streaming.
          const json = JSON.stringify(accion.args);
          for (let i = 0; i < json.length; i += 40) {
            emitir({ type: EventType.TOOL_CALL_ARGS, toolCallId, delta: json.slice(i, i + 40) });
            await pausa(15);
          }
          emitir({ type: EventType.TOOL_CALL_END, toolCallId });
        } else if (accion.tipo === 'texto') {
          await this.streamTexto(emitir, accion.texto);
        }

        emitir({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId });
        if (!cancelado) obs.complete();
      })().catch((err) => obs.error(err));

      return () => {
        cancelado = true;
      };
    });
  }

  private async streamTexto(emitir: (e: Record<string, unknown>) => void, texto: string) {
    const messageId = randomUUID();
    emitir({ type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant' });
    for (const trozo of texto.match(/.{1,12}(\s|$)|\S+/g) ?? [texto]) {
      emitir({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: trozo });
      await pausa(25);
    }
    emitir({ type: EventType.TEXT_MESSAGE_END, messageId });
  }

  private decidir(input: RunAgentInput): Accion {
    const ultimo = input.messages.at(-1);
    if (!ultimo) return { tipo: 'texto', texto: '¡Hola! ¿En qué te ayudo con el DevFest?' };

    // Respuesta después de que el frontend ejecutó una herramienta.
    if (ultimo.role === 'tool') {
      const resultado = textoDe(ultimo.content);
      // En el paso 3 la interfaz ya habla por sí sola: no añadimos texto.
      if (this.paso === 'paso3') return { tipo: 'nada' };
      if (resultado.includes('cancel')) return { tipo: 'texto', texto: 'Sin problema, no envié la inscripción.' };
      if (resultado.includes('confirm')) return { tipo: 'texto', texto: '¡Inscripción enviada! Te esperamos.' };
      if (resultado.includes('agregada')) return { tipo: 'texto', texto: 'Hecho, ya está en tu agenda.' };
      return { tipo: 'texto', texto: '¿Quieres que agregue alguna a tu agenda?' };
    }

    const texto = textoDe(ultimo.content);
    const t = normalizar(texto);

    if (this.paso === 'paso3') return this.decidirA2UI(texto, t);
    if (this.paso === 'paso2') return this.decidirTools(input, texto, t);
    return this.decidirTexto(t);
  }

  // Paso 1: solo texto.
  private decidirTexto(t: string): Accion {
    if (t.includes('cuando') || t.includes('donde') || t.includes('hora')) {
      return { tipo: 'texto', texto: `El DevFest es el **${MEETUP.fecha.toLowerCase()}** en ${MEETUP.lugar}. ¡Te esperamos!` };
    }
    if (t.includes('ia') || t.includes('charla') || t.includes('agenda')) {
      const lista = SESIONES.map((s) => `- **${s.hora}** ${s.titulo}`).join('\n');
      return { tipo: 'texto', texto: `Esta es la agenda:\n\n${lista}\n\n¿Te interesa alguna en particular?` };
    }
    return { tipo: 'texto', texto: `¡Hola! Soy el asistente de ${MEETUP.nombre}. Pregúntame por la agenda, el horario o el lugar.` };
  }

  // Paso 2: herramientas que el frontend registró con componentes Angular.
  private decidirTools(input: RunAgentInput, texto: string, t: string): Accion {
    if (t.includes('inscrib') || t.includes('registr')) {
      const email = texto.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
      const nombre = texto.match(/(?:soy|me llamo|nombre es)\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)?)/i)?.[1];
      if (!email || !nombre) {
        return { tipo: 'texto', texto: '¡Genial! Dime tu nombre y tu email para inscribirte.' };
      }
      const agenda = input.context.find((c) => c.description.includes('Mi agenda'))?.value ?? '[]';
      let sesiones: string[] = [];
      try {
        sesiones = (JSON.parse(agenda) as { id: string }[]).map((s) => s.id);
      } catch {
        /* contexto vacío */
      }
      return { tipo: 'tool', nombre: 'confirmar_inscripcion', args: { nombre, email, sesiones } };
    }
    const ids = sesionesMencionadas(texto);
    if ((t.includes('agrega') || t.includes('anade') || t.includes('guarda')) && ids.length) {
      return { tipo: 'tool', nombre: 'agregar_a_mi_agenda', args: { sesionId: ids[0] } };
    }
    return {
      tipo: 'tool',
      nombre: 'mostrar_sesiones',
      args: { ids: ids.length ? ids : SESIONES.map((s) => s.id) },
    };
  }

  // Paso 3: interfaces A2UI compuestas con el catálogo del frontend.
  private decidirA2UI(texto: string, t: string): Accion {
    if (t.includes('enviar_inscripcion')) {
      const ctx = this.contextoDeAccion(texto);
      const titulos = (ctx.sesiones ?? [])
        .map((id) => buscarSesion(id))
        .filter(Boolean)
        .map((s) => `${s!.hora} | ${s!.titulo}`);
      return {
        tipo: 'tool',
        nombre: 'render_a2ui',
        texto: '¡Listo! Aquí está tu entrada.',
        args: {
          surfaceId: `ticket-${Date.now()}`,
          components: [
            { id: 'root', component: 'Column', children: ['ticket'] },
            {
              id: 'ticket',
              component: 'TicketCard',
              nombre: ctx.nombre || 'Asistente',
              email: ctx.email || '—',
              evento: MEETUP.nombre,
              fecha: MEETUP.fecha,
              sesiones: titulos.length ? titulos : ['Acceso general'],
            },
          ],
        },
      };
    }

    if (t.includes('inscrib') || t.includes('registr') || t.includes('formulario')) {
      return {
        tipo: 'tool',
        nombre: 'render_a2ui',
        texto: 'Completa tus datos y elige tus charlas:',
        args: {
          surfaceId: `inscripcion-${Date.now()}`,
          components: [
            { id: 'root', component: 'Card', child: 'col' },
            { id: 'col', component: 'Column', children: ['titulo', 'nombre', 'email', 'sesiones', 'enviar'] },
            { id: 'titulo', component: 'Text', text: `Inscripción al ${MEETUP.nombre}`, variant: 'h3' },
            { id: 'nombre', component: 'TextField', label: 'Nombre', value: { path: '/form/nombre' } },
            { id: 'email', component: 'TextField', label: 'Email', value: { path: '/form/email' } },
            {
              id: 'sesiones',
              component: 'ChoicePicker',
              label: '¿A qué charlas vas?',
              variant: 'multipleSelection',
              value: { path: '/form/sesiones' },
              options: SESIONES.map((s) => ({ label: `${s.hora} | ${s.titulo}`, value: s.id })),
            },
            {
              id: 'enviar',
              component: 'Button',
              child: 'enviar-txt',
              variant: 'primary',
              action: {
                event: {
                  name: 'enviar_inscripcion',
                  context: {
                    nombre: { path: '/form/nombre' },
                    email: { path: '/form/email' },
                    sesiones: { path: '/form/sesiones' },
                  },
                },
              },
            },
            { id: 'enviar-txt', component: 'Text', text: 'Inscribirme' },
          ],
          data: { form: { nombre: '', email: '', sesiones: [] } },
        },
      };
    }

    const ids = sesionesMencionadas(texto);
    const elegidas = (ids.length ? ids : SESIONES.map((s) => s.id)).map((id) => buscarSesion(id)!);
    return {
      tipo: 'tool',
      nombre: 'render_a2ui',
      texto: 'Estas son las charlas:',
      args: {
        surfaceId: `sesiones-${Date.now()}`,
        components: [
          { id: 'root', component: 'Column', children: elegidas.map((s) => `s-${s.id}`) },
          ...elegidas.map((s) => ({
            id: `s-${s.id}`,
            component: 'SesionCard',
            titulo: s.titulo,
            ponente: s.ponente,
            hora: s.hora,
            sala: s.sala,
            track: s.track,
            nivel: s.nivel,
          })),
        ],
      },
    };
  }

  /** La acción A2UI llega como mensaje de usuario con un JSON dentro. */
  private contextoDeAccion(texto: string): { nombre?: string; email?: string; sesiones?: string[] } {
    const inicio = texto.indexOf('{');
    if (inicio === -1) return {};
    try {
      const accion = JSON.parse(texto.slice(inicio));
      const ctx = accion.context ?? accion.userAction?.context ?? {};
      return { nombre: ctx.nombre, email: ctx.email, sesiones: ctx.sesiones };
    } catch {
      return {};
    }
  }
}
