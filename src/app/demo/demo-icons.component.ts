import { Component } from '@angular/core';
import { FluentIconComponent } from '@shared/ui/fluent-icon';

@Component({
  selector: 'app-demo-icons',
  standalone: true,
  imports: [FluentIconComponent],
  template: `
    <button class="btn" style="color:#2563eb">
      <fluent-icon name="add" [size]="20" style="filled" class="mr-2" />
      Nuevo
    </button>

    <div style="margin-top:12px; color: var(--accent, #16a34a)">
      <fluent-icon name="mail" [size]="24" style="regular" />
      <span style="margin-left:8px;">Inbox</span>
    </div>
  `
})
export class DemoIconsComponent {}

