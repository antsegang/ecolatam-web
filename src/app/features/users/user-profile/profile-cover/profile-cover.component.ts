import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-cover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-cover.component.html',
  styleUrls: ['./profile-cover.component.scss']
})
export class ProfileCoverComponent {
  @Input() imageUrl?: string;
  @Input() canEdit = false;

  previewUrl?: string;

  onFileChange(event: Event){
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.previewUrl = URL.createObjectURL(file);
    }
  }
}
