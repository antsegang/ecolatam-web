import { Component, Input, OnChanges, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// Importes explícitos con Vite (?raw) de los íconos que usamos
// Registro de íconos inline (vacío por defecto). Puedes rellenarlo con imports ?raw si lo deseas.
const REGISTRY: Record<string, string> = {};


type FluentSize = 16 | 20 | 24 | 28 | 48;
type FluentStyle = 'regular' | 'filled';

@Component({
  selector: 'fluent-icon',
  standalone: true,
  template: `<span class="fluent-icon" [innerHTML]="svg()"></span>`,
  styles: [`
    :host{ display:inline-flex; line-height:0; }
    .fluent-icon svg{ width:1em; height:1em; display:block; }
    .fluent-icon svg{ fill: currentColor; }
  `]
})
export class FluentIconComponent implements OnChanges {
  @Input({ required: true }) name!: string;
  @Input() size: FluentSize = 24;
  @Input() style: FluentStyle = 'regular';
  @Input() iconStyle?: FluentStyle;

  private _svg = signal<SafeHtml | null>(null);
  svg = this._svg.asReadonly();

  constructor(private san: DomSanitizer) {}

  async ngOnChanges() {
    if (!this.name) { this._svg.set(null); return; }
    const s = this.iconStyle ?? this.style;
    const key = `${this.name}_${this.size}_${s}`;

    // 1) Intento directo: registro de imports explícitos
    const inline = REGISTRY[key];
    if (inline) {
      this._svg.set(this.san.bypassSecurityTrustHtml(inline));
      return;
    }

    // 2) Fallbacks estáticos: public/icons, public root, luego /assets/icons
    const file = `${key}.svg`;
    try {
      let resp = await fetch(`/icons/${file}`);
      if (!resp.ok) resp = await fetch(`/${file}`);
      if (!resp.ok) resp = await fetch(`/assets/icons/${file}`);
      if (resp.ok) {
        const raw = await resp.text();
        this._svg.set(this.san.bypassSecurityTrustHtml(raw));
        return;
      }
    } catch {}

    this._svg.set(null);
  }
}


