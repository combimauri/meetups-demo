/**
 * Componente que el agente "invoca" con la tool mostrar_sesiones.
 * Recibe la llamada a la herramienta como signal: args, status y result.
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { AngularToolCall } from '@copilotkit/angular';

import { SESIONES } from '../data/meetup';
import { MiAgenda } from '../shared/mi-agenda.service';

export type MostrarSesionesArgs = { ids: string[] };

@Component({
  selector: 'app-sesiones-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tool-sesiones">
      @for (s of sesiones(); track s.id) {
        <article class="sesion-mini" [attr.data-track]="s.track">
          <div>
            <b>{{ s.hora }}</b> {{ s.sala }} <span class="chip">{{ s.track }}</span>
            <h4>{{ s.titulo }}</h4>
            <p>{{ s.ponente }} | {{ s.nivel }}</p>
          </div>
          <button type="button" [disabled]="agenda.tiene(s.id)" (click)="agenda.agregar(s.id)">
            {{ agenda.tiene(s.id) ? '✓ En tu agenda' : '+ Agregar' }}
          </button>
        </article>
      } @empty {
        <p class="cargando">Buscando charlas…</p>
      }
    </div>
  `,
})
export class SesionesTool {
  readonly toolCall = input.required<AngularToolCall<MostrarSesionesArgs>>();
  protected readonly agenda = inject(MiAgenda);

  // Los args llegan en streaming: mientras status es "in-progress" pueden estar incompletos.
  protected readonly sesiones = computed(() => {
    const ids = this.toolCall().args.ids ?? [];
    return SESIONES.filter((s) => ids.includes(s.id));
  });
}
