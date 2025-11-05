import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SmartLoaderService {
  active = signal(false);
  message = signal('');

  show(msg?: string){
    if (msg) this.message.set(msg);
    this.active.set(true);
  }
  hide(){
    this.active.set(false);
  }
}
