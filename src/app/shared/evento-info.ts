import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MEETUP, SESIONES } from '../data/meetup';

@Component({
  selector: 'app-evento-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="card evento">
      <small class="eyebrow">GDG Sucre presenta</small>
      <h2>{{ meetup.nombre }}</h2>
      <p class="meta">{{ meetup.fecha }}<br />{{ meetup.lugar }}</p>
      <p>{{ meetup.descripcion }}</p>
      <h3>Agenda</h3>
      <ol class="agenda">
        @for (s of sesiones; track s.id) {
          <li [attr.data-track]="s.track">
            <b>{{ s.hora }}</b> {{ s.titulo }}
          </li>
        }
      </ol>
    </aside>
  `,
})
export class EventoInfo {
  readonly meetup = MEETUP;
  readonly sesiones = SESIONES;
}
