/**
 * Paso 2 · UI generativa "estática" + estado compartido.
 *
 * Tú escribes los componentes Angular; el agente decide CUÁNDO mostrarlos
 * llamando a herramientas (tools) que el frontend registra y anuncia por AG-UI.
 * Las tools viven mientras viva este componente: al salir de la ruta, desaparecen.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  CopilotChat,
  connectAgentContext,
  registerComponent,
  registerFrontendTool,
  registerHumanInTheLoop,
} from '@copilotkit/angular';
import { z } from 'zod';

import { MiAgenda } from '../shared/mi-agenda.service';
import { ConfirmarInscripcion } from './confirmar-inscripcion';
import { SesionesTool } from './sesiones-tool';

@Component({
  selector: 'app-paso-2',
  imports: [CopilotChat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="layout">
      <aside class="card">
        <small class="eyebrow">Estado de la app (signals)</small>
        <h2>Mi agenda</h2>
        <ul class="mi-agenda">
          @for (s of agenda.sesiones(); track s.id) {
            <li [attr.data-track]="s.track">
              <span><b>{{ s.hora }}</b> {{ s.titulo }}</span>
              <button type="button" aria-label="Quitar" (click)="agenda.quitar(s.id)">✕</button>
            </li>
          } @empty {
            <li class="vacio">Todavía no guardaste charlas. Pídeselo al asistente.</li>
          }
        </ul>
        @if (agenda.inscripcion(); as i) {
          <div class="inscrito">✅ Inscripción de <b>{{ i.nombre }}</b> confirmada</div>
        }
      </aside>
      <div class="chat-panel">
        <copilot-chat agentId="paso2" />
      </div>
    </section>
  `,
})
export class Paso2 {
  protected readonly agenda = inject(MiAgenda);

  constructor() {
    // 1) Solo dibuja: el agente pasa ids y Angular pinta las tarjetas.
    registerComponent({
      agentId: 'paso2',
      name: 'mostrar_sesiones',
      description: 'Muestra tarjetas con charlas del meetup.',
      parameters: z.object({ ids: z.array(z.string()).describe('ids de las charlas') }),
      component: SesionesTool,
    });

    // 2) Ejecuta código de la app: el agente modifica el estado (un signal).
    registerFrontendTool({
      agentId: 'paso2',
      name: 'agregar_a_mi_agenda',
      description: 'Agrega una charla a la agenda personal del usuario.',
      parameters: z.object({ sesionId: z.string() }),
      handler: async ({ sesionId }) =>
        this.agenda.agregar(sesionId)
          ? `Charla ${sesionId} agregada a la agenda.`
          : `La charla ${sesionId} no existe o ya estaba en la agenda.`,
    });

    // 3) Human-in-the-loop: el agente propone, el usuario confirma.
    registerHumanInTheLoop({
      agentId: 'paso2',
      name: 'confirmar_inscripcion',
      description: 'Pide al usuario que confirme su inscripción al meetup.',
      parameters: z.object({
        nombre: z.string(),
        email: z.string(),
        sesiones: z.array(z.string()).describe('ids de las charlas elegidas'),
      }),
      component: ConfirmarInscripcion,
    });

    // 4) Contexto: el agente "ve" la agenda actual en cada mensaje.
    connectAgentContext(() => ({
      description: 'Mi agenda: charlas que el usuario guardó (JSON)',
      value: JSON.stringify(this.agenda.sesiones().map(({ id, titulo, hora }) => ({ id, titulo, hora }))),
    }));
  }
}
