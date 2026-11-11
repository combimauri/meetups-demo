/**
 * Paso 1 · Un chat conectado a un agente por AG-UI.
 *
 * Todo lo que hace falta: provideCopilotKit (en app.config.ts) y <copilot-chat>.
 * Abre DevTools > Network > "run" para ver los eventos SSE de AG-UI llegando.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CopilotChat } from '@copilotkit/angular';

import { EventoInfo } from '../shared/evento-info';

@Component({
  selector: 'app-paso-1',
  imports: [CopilotChat, EventoInfo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="layout">
      <app-evento-info />
      <div class="chat-panel">
        <copilot-chat agentId="paso1" />
      </div>
    </section>
  `,
})
export class Paso1 {}
