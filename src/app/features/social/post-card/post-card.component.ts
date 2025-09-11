import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() like = new EventEmitter<Post>();

  get mediaGatewayBase() {
    // Gateway público por ahora (ajustar si hay uno propio)
    return 'https://ipfs.io/ipfs';
  }

  srcFor(cid?: string): string | undefined {
    if (!cid) return undefined;
    if (cid.startsWith('http')) return cid;
    if (cid.startsWith('/')) return cid;
    if (cid.startsWith('placeholders/')) return `/${cid}`; // servido desde public/
    return `${this.mediaGatewayBase}/${cid}`;
  }
}
