import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IpfsService {
  private apiBase = 'https://ipfs.ecolatam.com/api';
  private toHex(u8: Uint8Array): string { return Array.from(u8).map(b => b.toString(16).padStart(2,'0')).join(''); }

  private async encryptFile(file: File, key: CryptoKey): Promise<{ iv: Uint8Array; cipher: ArrayBuffer }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new Uint8Array(await file.arrayBuffer());
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    return { iv, cipher };
  }

  private async generateKey(userId: number): Promise<CryptoKey> {
    // Nota: derivación simplificada; en producción deriva con secreto del servidor
    const passphrase = `ecolatam-user-${userId}`;
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('ipfs-ecolatam-salt'), iterations: 100000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async uploadEncrypted(files: File[], userId: number): Promise<Array<{ cid: string; iv: string }>> {
    const key = await this.generateKey(userId);
    const results: Array<{ cid: string; iv: string }> = [];
    for (const f of files) {
      const { iv, cipher } = await this.encryptFile(f, key);
      const form = new FormData();
      form.append('file', new Blob([cipher]), `${f.name}.enc`);
      // Asumimos endpoint compatible con /api/v0/add (ajustar si difiere)
      const res = await fetch(`${this.apiBase}/v0/add`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('IPFS upload failed');
      const text = await res.text();
      // Respuesta típica: JSONL con { Hash, Name, Size }
      const lastLine = text.trim().split('\n').pop() || '{}';
      const obj = JSON.parse(lastLine);
      results.push({ cid: obj.Hash, iv: this.toHex(iv) });
    }
    return results;
  }
}
