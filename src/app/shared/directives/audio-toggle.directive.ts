import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appAudioToggle]',
  standalone: true,
})
export class AudioToggleDirective implements OnInit, OnDestroy {
  /** Ruta del audio (mp3/ogg/wav en /assets o URL absoluta) */
  @Input('appAudioToggle') src!: string;

  /** Volumen 0..1 */
  @Input() volume = 0.6;

  /** Repetir al terminar */
  @Input() loop = false;

  /** Texto accesible base (se alterna Play/Pause automáticamente) */
  @Input() label = 'Jingle';

  private audio?: HTMLAudioElement;
  private isPlaying = false;
  private cleanupFns: Array<() => void> = [];

  constructor(private host: ElementRef<HTMLElement>, private r: Renderer2) {}

  ngOnInit(): void {
    const el = this.host.nativeElement;

    // Asegurar que sea accesible como "botón"
    this.r.setAttribute(el, 'role', 'button');
    this.r.setAttribute(el, 'tabindex', '0');
    this.r.setAttribute(el, 'aria-pressed', 'false');
    this.r.addClass(el, 'audio-toggle');

    // Prepara audio
    this.audio = new Audio(this.src);
    this.audio.preload = 'auto';
    this.audio.loop = this.loop;
    this.audio.volume = this.volume;

    // Sincroniza estados si el audio termina (cuando no hay loop)
    const endedUnsub = this.r.listen(this.audio, 'ended', () => {
      if (!this.loop) this.setPlaying(false);
    });
    this.cleanupFns.push(endedUnsub);

    // Cursor y prevent-select
    this.r.setStyle(el, 'cursor', 'pointer');
    this.r.setStyle(el, 'user-select', 'none');

    // Accesible: etiqueta dinámica
    this.updateAriaLabel();
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach(fn => fn());
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = undefined;
    }
  }

  @HostListener('click')
  async onClick() {
    await this.toggle();
  }

  @HostListener('keydown', ['$event'])
  async onKeydown(ev: KeyboardEvent) {
    if (ev.code === 'Space' || ev.code === 'Enter') {
      ev.preventDefault();
      await this.toggle();
    }
  }

  private async toggle() {
    if (!this.audio) return;
    if (this.isPlaying) {
      this.audio.pause();
      this.setPlaying(false);
    } else {
      try {
        await this.audio.play();
        this.setPlaying(true);
      } catch {
        // Si el navegador bloquea, se habilita tras el primer gesto del usuario
      }
    }
  }

  private setPlaying(playing: boolean) {
    const el = this.host.nativeElement;
    this.isPlaying = playing;
    this.r.setAttribute(el, 'aria-pressed', playing ? 'true' : 'false');
    this.r.setAttribute(el, 'aria-label', this.ariaText());
    if (playing) {
      this.r.addClass(el, 'is-playing');
      this.r.removeClass(el, 'is-paused');
    } else {
      this.r.addClass(el, 'is-paused');
      this.r.removeClass(el, 'is-playing');
    }
  }

  private ariaText() {
    return `${this.label}: ${this.isPlaying ? 'Pausar' : 'Reproducir'}`;
  }

  private updateAriaLabel() {
    this.r.setAttribute(this.host.nativeElement, 'aria-label', this.ariaText());
  }
}
