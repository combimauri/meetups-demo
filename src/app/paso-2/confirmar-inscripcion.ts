/**
 * Human-in-the-loop: el agente propone la inscripción, pero decide el usuario.
 * La herramienta queda "pausada" hasta que llamamos a toolCall().respond(...).
 */
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { HumanInTheLoopToolCall } from '@copilotkit/angular';

import { SESIONES } from '../data/meetup';
import { MiAgenda } from '../shared/mi-agenda.service';

export type ConfirmarInscripcionArgs = { nombre: string; email: string; sesiones: string[] };

@Component({
  selector: 'app-confirmar-inscripcion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hitl">
      <small class="eyebrow">¿Confirmas tu inscripción?</small>
      <p><b>{{ toolCall().args.nombre }}</b> · {{ toolCall().args.email }}</p>
      <ul>
        @for (s of sesiones(); track s.id) {
          <li>{{ s.hora }} · {{ s.titulo }}</li>
        } @empty {
          <li>Acceso general (sin charlas elegidas)</li>
        }
      </ul>
      @switch (toolCall().status) {
        @case ('executing') {
          <div class="acciones">
            <button type="button" class="primario" (click)="confirmar()">Confirmar</button>
            <button type="button" (click)="cancelar()">Cancelar</button>
          </div>
        }
        @case ('complete') {
          <p class="resultado">{{ toolCall().result?.includes('confirmada') ? '✅ Confirmada' : '❌ Cancelada' }}</p>
        }
      }
    </div>
  `,
})
export class ConfirmarInscripcion {
  readonly toolCall = input.required<HumanInTheLoopToolCall<ConfirmarInscripcionArgs>>();
  private readonly agenda = inject(MiAgenda);

  protected readonly sesiones = computed(() => {
    const ids = this.toolCall().args.sesiones ?? [];
    return SESIONES.filter((s) => ids.includes(s.id));
  });

  confirmar() {
    const { nombre = '', email = '', sesiones = [] } = this.toolCall().args;
    sesiones.forEach((id) => this.agenda.agregar(id));
    this.agenda.confirmar(nombre, email);
    this.toolCall().respond({ estado: 'confirmada', nombre, email, sesiones });
  }

  cancelar() {
    this.toolCall().respond({ estado: 'cancelada por el usuario' });
  }
}
