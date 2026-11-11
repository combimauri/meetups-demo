import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="barra">
      <a class="marca" routerLink="/">
        <span class="puntos" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span>GDG Sucre <small>· demo web agéntica</small></span>
      </a>
      <nav>
        @for (p of pasos; track p.ruta) {
          <a [routerLink]="p.ruta" routerLinkActive="activo" [attr.data-color]="p.color">
            <b>{{ p.num }}</b> {{ p.nombre }}
          </a>
        }
      </nav>
    </header>
    <main><router-outlet /></main>
  `,
})
export class App {
  readonly pasos = [
    { num: 1, ruta: '/paso-1', nombre: 'Chat · AG-UI', color: 'blue' },
    { num: 2, ruta: '/paso-2', nombre: 'Tools · estado', color: 'red' },
    { num: 3, ruta: '/paso-3', nombre: 'A2UI', color: 'green' },
  ];
}
