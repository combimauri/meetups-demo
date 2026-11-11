/**
 * Paso 3 · El catálogo A2UI.
 *
 * El agente NO envía código: envía JSON que nombra componentes de este catálogo.
 * Aquí decides qué componentes existen, qué props aceptan (con zod) y con qué
 * componente Angular se dibuja cada uno. Lo que no está en el catálogo, no se dibuja.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  DynamicStringSchema,
  createAngularCatalog,
  type A2UICatalogDefinitions,
  type A2UIProps,
} from '@copilotkit/angular/a2ui';
import { z } from 'zod';

import { CATALOG_ID } from './catalog-id';

const definiciones = {
  SesionCard: {
    description: 'Tarjeta de una charla del meetup, con el estilo visual de GDG.',
    props: z.object({
      titulo: DynamicStringSchema,
      ponente: DynamicStringSchema,
      hora: DynamicStringSchema,
      sala: DynamicStringSchema.optional(),
      track: z.enum(['IA', 'Web', 'Cloud', 'Comunidad']).optional(),
      nivel: DynamicStringSchema.optional(),
    }),
  },
  TicketCard: {
    description: 'Entrada confirmada al meetup. Úsala solo después de que el usuario envíe la inscripción.',
    props: z.object({
      nombre: DynamicStringSchema,
      email: DynamicStringSchema,
      evento: DynamicStringSchema,
      fecha: DynamicStringSchema.optional(),
      sesiones: z.array(z.string()).optional(),
    }),
  },
} satisfies A2UICatalogDefinitions;

@Component({
  selector: 'app-a2ui-sesion-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="sesion" [attr.data-track]="props().track ?? 'Web'">
      <header>
        <span class="hora">{{ props().hora ?? '--:--' }}</span>
        <span class="chip">{{ props().track ?? 'Web' }}</span>
      </header>
      <h4>{{ props().titulo ?? '…' }}</h4>
      <p>{{ props().ponente ?? '' }}</p>
      <footer>
        @if (props().sala) {<span>📍 {{ props().sala }}</span>}
        @if (props().nivel) {<span>{{ props().nivel }}</span>}
      </footer>
    </article>
  `,
  styleUrl: './a2ui-cards.css',
})
export class A2uiSesionCard {
  readonly props = input.required<A2UIProps<typeof definiciones, 'SesionCard'>>();
}

@Component({
  selector: 'app-a2ui-ticket-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="ticket">
      <div class="franja"><i></i><i></i><i></i><i></i></div>
      <div class="cuerpo">
        <small>Entrada confirmada</small>
        <h3>{{ props().evento ?? '' }}</h3>
        @if (props().fecha) {<p class="fecha">{{ props().fecha }}</p>}
        <dl>
          <dt>Nombre</dt><dd>{{ props().nombre ?? '' }}</dd>
          <dt>Email</dt><dd>{{ props().email ?? '' }}</dd>
        </dl>
        @if (props().sesiones?.length) {
          <ul>
            @for (s of props().sesiones; track s) {<li>{{ s }}</li>}
          </ul>
        }
      </div>
    </article>
  `,
  styleUrl: './a2ui-cards.css',
})
export class A2uiTicketCard {
  readonly props = input.required<A2UIProps<typeof definiciones, 'TicketCard'>>();
}

/** Catálogo = componentes básicos de A2UI + nuestros componentes de marca. */
export const meetupCatalog = createAngularCatalog(
  definiciones,
  { SesionCard: A2uiSesionCard, TicketCard: A2uiTicketCard },
  { catalogId: CATALOG_ID, includeBasicCatalog: true },
);
