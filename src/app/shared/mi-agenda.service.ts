import { Injectable, computed, signal } from '@angular/core';

import { SESIONES, type Sesion } from '../data/meetup';

export interface Inscripcion {
  nombre: string;
  email: string;
  sesiones: Sesion[];
}

/** Estado de la app que comparten la UI y el agente: la agenda del usuario. */
@Injectable({ providedIn: 'root' })
export class MiAgenda {
  private readonly ids = signal<string[]>([]);

  readonly sesiones = computed(() => SESIONES.filter((s) => this.ids().includes(s.id)));
  readonly inscripcion = signal<Inscripcion | null>(null);

  tiene(id: string): boolean {
    return this.ids().includes(id);
  }

  agregar(id: string): boolean {
    if (!SESIONES.some((s) => s.id === id) || this.tiene(id)) return false;
    this.ids.update((ids) => [...ids, id]);
    return true;
  }

  quitar(id: string): void {
    this.ids.update((ids) => ids.filter((x) => x !== id));
  }

  confirmar(nombre: string, email: string): void {
    this.inscripcion.set({ nombre, email, sesiones: this.sesiones() });
  }
}
