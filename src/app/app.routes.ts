import { Routes } from '@angular/router';

import { etiquetasChat } from './shared/etiquetas';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'paso-1' },
  {
    path: 'paso-1',
    title: 'Paso 1 · Chat con AG-UI',
    providers: [etiquetasChat('¡Hola! Pregúntame lo que quieras sobre el meetup.')],
    loadComponent: () => import('./paso-1/paso-1').then((m) => m.Paso1),
  },
  {
    path: 'paso-2',
    title: 'Paso 2 · Tools y estado compartido',
    providers: [etiquetasChat('Puedo mostrarte charlas, guardarlas en tu agenda e inscribirte.')],
    loadComponent: () => import('./paso-2/paso-2').then((m) => m.Paso2),
  },
  {
    path: 'paso-3',
    title: 'Paso 3 · Interfaces con A2UI',
    providers: [etiquetasChat('Pídeme un formulario de inscripción o compara charlas.')],
    loadComponent: () => import('./paso-3/paso-3').then((m) => m.Paso3),
  },
  { path: '**', redirectTo: 'paso-1' },
];
