// hover-sound.directive.ts
import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { SoundService } from '../../services/sound.service';

@Directive({
  selector: '[appHoverSound]',
})
export class HoverSoundDirective implements OnInit {
  /** Ruta del audio (mp3/wav/ogg en /assets) */
  @Input('appHoverSound') src!: string;

  /** Volumen 0..1 */
  @Input() hoverVolume = 0.4;

  /** Evita spameo si el mouse vibra encima del botón */
  @Input() minIntervalMs = 80;

  private lastPlay = 0;

  constructor(private el: ElementRef<HTMLElement>, private sound: SoundService) {}

  async ngOnInit() {
    if (!this.src) return;
    try { await this.sound.load(this.src); } catch { /* ignora si falla la precarga */ }
  }

  @HostListener('mouseenter')
  async onEnter() {
    const now = performance.now();
    if (now - this.lastPlay < this.minIntervalMs) return;
    this.lastPlay = now;
    if (!this.src) return;
    this.sound.play(this.src, { volume: this.hoverVolume }).catch(() => {});
  }
}
