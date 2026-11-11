# Demo · Más allá del chat: interfaces agénticas en Angular

Demo de la charla para **GDG Sucre**. Una app Angular de inscripción a un meetup donde un agente con Gemini pasa de un chat de texto a generar interfaces reales, con **CopilotKit**, **AG-UI** y **A2UI**.

| Ruta | Qué muestra | Archivos clave |
| --- | --- | --- |
| `/paso-1` | Chat conectado a un agente por **AG-UI** (eventos SSE) | `app.config.ts`, `paso-1/paso-1.ts` |
| `/paso-2` | **UI generativa estática**: tools que dibujan componentes Angular, estado compartido con signals y *human-in-the-loop* | `paso-2/*` |
| `/paso-3` | **A2UI**: el agente compone formularios y tarjetas con el catálogo de la app; las acciones vuelven al agente | `paso-3/*` |
| `server/` | **Copilot Runtime** con un agente por paso | `server/index.ts` |

## Requisitos

- Node 22 o superior
- Una API key de Gemini: <https://aistudio.google.com/apikey>

## Cómo correrla

```bash
npm install
cp .env.example .env   # y pega tu GOOGLE_API_KEY
npm run dev            # agente en :8200 + Angular en :4200
```

Abre <http://localhost:4200>.

### Plan B: sin internet ni API key

```bash
npm run dev:offline
```

Los agentes se reemplazan por `server/offline-agent.ts`: un agente AG-UI **guionizado** que emite los mismos eventos que uno real (texto, tool calls, A2UI). Úsalo si falla el wifi del evento o para ensayar. Frases que entiende:

- Paso 1: "¿Qué charlas hay?", "¿Cuándo y dónde es?"
- Paso 2: "Muéstrame las charlas de IA", "Agrega la charla de Cloud Run", "Quiero inscribirme, soy Ana Pérez y mi email es ana@ejemplo.com"
- Paso 3: "Muéstrame las charlas de IA", "Quiero inscribirme al meetup" (luego llena el formulario y pulsa *Inscribirme*)

## Guion sugerido de la demo

1. **Paso 1**: enseña lo poco que hace falta: `provideCopilotKit` + `<copilot-chat>`. Abre DevTools → Network → la petición `run` y muestra los eventos AG-UI llegando (`RUN_STARTED`, `TEXT_MESSAGE_CONTENT`, …). El botón flotante de CopilotKit (el Inspector, solo en desarrollo) también muestra los eventos en vivo.
2. **Paso 2**: "Muéstrame las charlas de IA" → el agente llama a `mostrar_sesiones` y Angular pinta `SesionesTool`. Agrega una charla y mira cómo cambia el panel *Mi agenda* (un signal). Pide inscribirte y muestra cómo la tool `confirmar_inscripcion` espera al usuario.
3. **Paso 3**: "Quiero inscribirme al meetup" → el agente envía JSON A2UI y CopilotKit lo dibuja con componentes Angular. Llena el formulario, pulsa *Inscribirme* y el agente responde con un `TicketCard`, un componente de **tu** catálogo.

## Cómo encaja todo

```
Angular (CopilotKit)  ── AG-UI (HTTP + SSE) ──▶  Copilot Runtime  ──▶  Gemini
   ▲  catálogo A2UI                                 │ middleware A2UI (paso 3)
   └──── superficies A2UI (JSON) + eventos ◀────────┘
```

- **AG-UI** es el protocolo de eventos entre el agente y la app.
- **A2UI** es el formato declarativo de la interfaz: el agente envía datos, no código, y solo puede usar componentes del catálogo.
- **CopilotKit** une ambas cosas: runtime en Node + SDK de Angular con signals.

## Versiones

Probado con Angular 22.2, `@copilotkit/angular` 0.6.0 y `@copilotkit/runtime` 1.86.0 (A2UI v0.9). El modelo por defecto es `google/gemini-3.5-flash`; cámbialo con `GEMINI_MODEL` en `.env`.

Los datos del meetup (`src/app/data/meetup.ts`) son de ejemplo: reemplázalos por la agenda real.
