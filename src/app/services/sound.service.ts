// sound.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private ctx?: AudioContext;
  private buffers = new Map<string, AudioBuffer>();

  private get audioContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return this.ctx;
  }

  async load(url: string): Promise<AudioBuffer> {
    if (this.buffers.has(url)) return this.buffers.get(url)!;
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await this.audioContext.decodeAudioData(arr);
    this.buffers.set(url, buf);
    return buf;
  }

  /**
   * Reproduce desde buffer (baja latencia). Permite overlaps.
   */
  async play(url: string, opts?: { volume?: number; playbackRate?: number }) {
    const ctx = this.audioContext;
    // En algunos navegadores el contexto inicia suspendido hasta una interacción del usuario
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch {}
    }

    const buffer = await this.load(url);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    if (opts?.playbackRate) src.playbackRate.value = opts.playbackRate;

    // ganancia / volumen
    const gain = ctx.createGain();
    gain.gain.value = opts?.volume ?? 0.4;

    src.connect(gain).connect(ctx.destination);
    src.start(0);
  }
}
