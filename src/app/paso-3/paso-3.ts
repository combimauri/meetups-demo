/**
 * Paso 3 · A2UI: el agente compone la interfaz.
 *
 * Aquí no registramos ninguna tool. El runtime le da al agente "render_a2ui"
 * y la app le envía su catálogo (meetup-catalog.ts). El agente responde con JSON
 * declarativo y CopilotKit lo dibuja con NUESTROS componentes Angular.
 * Cuando el usuario pulsa un botón, la acción vuelve al agente por AG-UI.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CopilotChat } from '@copilotkit/angular';

@Component({
  selector: 'app-paso-3',
  imports: [CopilotChat],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="layout layout--ancho">
      <aside class="card">
        <small class="eyebrow">Prueba con</small>
        <ul class="sugerencias">
          <li>“Quiero inscribirme al meetup”</li>
          <li>“Muéstrame las charlas de IA”</li>
          <li>“Compárame las charlas de las 11:30”</li>
        </ul>
        <p class="nota">
          El agente solo puede usar los componentes del catálogo:
          los básicos de A2UI + <code>SesionCard</code> y <code>TicketCard</code>.
        </p>
      </aside>
      <div class="chat-panel">
        <copilot-chat agentId="paso3" />
      </div>
    </section>
  `,
})
export class Paso3 {}
