/**
 * Copilot Runtime: el backend de la demo.
 *
 * Expone tres agentes (uno por paso de la charla) en /api/copilotkit.
 * Cada agente habla AG-UI con el frontend Angular mediante Server-Sent Events.
 *
 *   npm run agent            -> agentes reales con Gemini (necesita GOOGLE_API_KEY)
 *   npm run agent:offline    -> agentes guionizados, sin internet ni API key (plan B)
 */
import { createServer } from 'node:http';
import { BuiltInAgent, CopilotRuntime } from '@copilotkit/runtime/v2';
import { createCopilotNodeListener } from '@copilotkit/runtime/v2/node';
import type { AbstractAgent } from '@ag-ui/client';

import { CATALOG_ID } from '../src/app/paso-3/catalog-id';
import { agendaComoTexto } from '../src/app/data/meetup';
import { OfflineAgent } from './offline-agent';

const PORT = Number(process.env['PORT'] ?? 8200);
const MODEL = process.env['GEMINI_MODEL'] ?? 'google/gemini-3.5-flash';
const OFFLINE = process.env['DEMO_OFFLINE'] === '1';

const BASE_PROMPT = `Eres el asistente del DevFest Sucre 2026, organizado por GDG Sucre.
Respondes siempre en español neutro, con tono cercano y frases cortas.
Solo hablas del evento; si te preguntan otra cosa, lo dices con amabilidad y vuelves al evento.

${agendaComoTexto()}`;

const PROMPTS = {
  // Paso 1: chat de texto, nada más.
  paso1: `${BASE_PROMPT}

Responde con texto. Puedes usar listas cortas en markdown.`,

  // Paso 2: el frontend registra herramientas (tools) con componentes Angular.
  paso2: `${BASE_PROMPT}

Tienes herramientas que dibujan componentes en la app. Úsalas en lugar de describir con texto:
- Cuando el usuario quiera ver charlas (todas, de un track, de un nivel o de una hora), llama a "mostrar_sesiones" con los ids. No repitas la lista en texto.
- Cuando quiera guardar o añadir una charla a su agenda, llama a "agregar_a_mi_agenda" con el id.
- Cuando quiera inscribirse, pide nombre y email si no los tienes y luego llama a "confirmar_inscripcion".
  Usa las charlas que ya están en "Mi agenda" (te llegan en el contexto).
Después de usar una herramienta, responde con una sola frase.`,

  // Paso 3: el agente compone interfaces con A2UI a partir del catálogo del frontend.
  paso3: `${BASE_PROMPT}

En este modo generas interfaces con la herramienta "render_a2ui", usando solo componentes del catálogo que te envía la app.
- Si el usuario quiere inscribirse, genera un formulario en una Card con: un título, TextField para nombre (path /form/nombre), TextField para email (path /form/email), un ChoicePicker con las charlas (path /form/sesiones, una opción por charla con su id como value y "hora | título" como label) y un Button primario "Inscribirme" con la acción {"event":{"name":"enviar_inscripcion","context":{"nombre":{"path":"/form/nombre"},"email":{"path":"/form/email"},"sesiones":{"path":"/form/sesiones"}}}}.
  Inicializa data con {"form":{"nombre":"","email":"","sesiones":[]}} o con lo que el usuario ya te haya dicho.
- Si el usuario quiere ver o comparar charlas, usa componentes SesionCard (uno por charla) dentro de una Column.
- Cuando recibas la acción "enviar_inscripcion", genera una confirmación con un TicketCard (nombre, email y los títulos de las charlas elegidas).
Acompaña cada interfaz con una sola frase de texto.`,
};

function agente(prompt: string): AbstractAgent {
  return new BuiltInAgent({ model: MODEL, prompt, maxSteps: 5, temperature: 0.3 });
}

const agents: Record<string, AbstractAgent> = OFFLINE
  ? {
      paso1: new OfflineAgent('paso1'),
      paso2: new OfflineAgent('paso2'),
      paso3: new OfflineAgent('paso3'),
    }
  : {
      paso1: agente(PROMPTS.paso1),
      paso2: agente(PROMPTS.paso2),
      paso3: agente(PROMPTS.paso3),
    };

if (!OFFLINE && !process.env['GOOGLE_API_KEY']) {
  console.warn('⚠️  Falta GOOGLE_API_KEY en .env. Usa "npm run agent:offline" para el modo sin internet.');
}

const runtime = new CopilotRuntime({
  agents: agents as never,
  // A2UI solo para el paso 3: el middleware le inyecta la tool "render_a2ui"
  // y convierte sus llamadas en superficies A2UI que el frontend dibuja.
  a2ui: {
    agents: ['paso3'],
    injectA2UITool: true,
    defaultCatalogId: CATALOG_ID,
    recovery: { debugExposure: 'collapsed' },
  },
});

const listener = createCopilotNodeListener({
  runtime,
  basePath: '/api/copilotkit',
  cors: true,
});

createServer(listener).listen(PORT, () => {
  console.log(
    `🤖 Copilot Runtime en http://localhost:${PORT}/api/copilotkit ` +
      (OFFLINE ? '(modo offline, agentes guionizados)' : `(modelo ${MODEL})`),
  );
});
