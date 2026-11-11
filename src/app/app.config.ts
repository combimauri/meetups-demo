import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideCopilotKit } from '@copilotkit/angular';

import { routes } from './app.routes';
import { meetupCatalog } from './paso-3/meetup-catalog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),

    // Toda la configuración de CopilotKit vive en DI, no en un componente envoltorio.
    provideCopilotKit({
      runtimeUrl: '/api/copilotkit', // proxy de Angular -> Copilot Runtime (puerto 8200)
      a2ui: { catalog: meetupCatalog }, // paso 3: sin catálogo, A2UI queda apagado
    }),
  ],
};
