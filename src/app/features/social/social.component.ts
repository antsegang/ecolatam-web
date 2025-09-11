import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocialService } from './services/social.service';
import { Post, FeedFilter } from './models/post.model';
import { PostCardComponent } from './post-card/post-card.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PostCardComponent],
  templateUrl: './social.component.html',
  styleUrl: './social.component.scss'
})
export class SocialComponent {
  private fb = inject(FormBuilder);
  private api = inject(SocialService);
  auth = inject(AuthService);

  // UI state
  activeTab = signal<FeedFilter>('all');
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  feed = signal<Post[]>([]);
  skeletons = signal<number>(0);

  // Forms (simple MVP)
  postForm = this.fb.group({
    content: ['', [Validators.required, Validators.minLength(2)]],
  });

  volunteerForm = this.fb.group({
    skills: ['', Validators.required],
    availability: [''],
    notes: [''],
  });

  requestVolForm = this.fb.group({
    need: ['', Validators.required],
    details: [''],
  });

  guideForm = this.fb.group({
    topic: ['', Validators.required],
    message: ['', Validators.required],
    preferredDate: [''],
  });

  inspectionForm = this.fb.group({
    targetType: ['business' as 'business' | 'location', Validators.required],
    targetId: [''],
    notes: [''],
  });

  isVip = computed(() => this.auth.hasRole('vip'));

  constructor() {
    this.loadFeed();
  }

  setTab(tab: FeedFilter) {
    this.activeTab.set(tab);
    this.loadFeed();
  }

  loadFeed() {
    this.loading.set(true);
    this.skeletons.set(3);
    this.errorMsg.set(null);
    const tab = this.activeTab();
    const obs = tab === 'vip' ? this.api.getVipFeed({}) : this.api.getFeed({ filter: tab });
    obs.subscribe({
      next: posts => {
        const list = Array.isArray(posts) ? posts : [];
        if (list.length === 0) {
          // Fallback: placeholders para que el diseño luzca completo
          this.feed.set(this.generatePlaceholders(tab));
        } else {
          this.feed.set(list);
        }
        this.loading.set(false);
        this.skeletons.set(0);
      },
      error: err => { this.errorMsg.set(err?.message || 'Error al cargar el feed'); this.loading.set(false); },
    });
  }

  submitPost() {
    if (this.postForm.invalid) return;
    const { content } = this.postForm.getRawValue();
    this.api.createPost({ content: content || '' }).subscribe({
      next: () => { this.postForm.reset(); this.loadFeed(); },
      error: err => { this.errorMsg.set(err?.message || 'No se pudo publicar'); },
    });
  }

  like(post: Post) {
    this.api.likePost(post.id).subscribe({
      next: (res) => {
        // Optimistic update simple
        const updated = this.feed().map(p => p.id === post.id ? { ...p, likes: res.likes } : p);
        this.feed.set(updated);
      },
    });
  }

  submitVolunteer() {
    if (this.volunteerForm.invalid) return;
    const v = this.volunteerForm.getRawValue();
    this.api.offerVolunteer({
      skills: v.skills || '',
      availability: v.availability || undefined,
      notes: v.notes || undefined,
    }).subscribe({
      next: () => this.volunteerForm.reset(),
      error: err => this.errorMsg.set(err?.message || 'No se pudo enviar el voluntariado'),
    });
  }

  submitRequestVol() {
    if (this.requestVolForm.invalid) return;
    const r = this.requestVolForm.getRawValue();
    this.api.requestVolunteers({
      need: r.need || '',
      details: r.details || undefined,
    }).subscribe({
      next: () => this.requestVolForm.reset(),
      error: err => this.errorMsg.set(err?.message || 'No se pudo solicitar voluntarios'),
    });
  }

  submitGuide() {
    if (this.guideForm.invalid) return;
    const g = this.guideForm.getRawValue();
    this.api.contactGuide({
      topic: g.topic || '',
      message: g.message || '',
      preferredDate: g.preferredDate || undefined,
    }).subscribe({
      next: () => this.guideForm.reset(),
      error: err => this.errorMsg.set(err?.message || 'No se pudo contactar guía'),
    });
  }

  submitInspection() {
    if (this.inspectionForm.invalid) return;
    const i = this.inspectionForm.getRawValue();
    this.api.requestInspection({
      targetType: (i.targetType || 'business'),
      targetId: i.targetId || undefined,
      notes: i.notes || undefined,
    }).subscribe({
      next: () => this.inspectionForm.reset(),
      error: err => this.errorMsg.set(err?.message || 'No se pudo solicitar inspección'),
    });
  }

  private generatePlaceholders(tab: FeedFilter): Post[] {
    const now = new Date();
    const base: Post[] = [
      {
        id: 'ph-1',
        authorId: 'u-1',
        authorName: 'EcoLATAM',
        roleTags: ['educación'],
        content: 'Cómo separar residuos en casa y reducir tu huella.',
        media: [{ cid: 'placeholders/eco1.svg' } as any],
        createdAt: now.toISOString(),
        likes: 128,
        commentsCount: 12,
      },
      {
        id: 'ph-2',
        authorId: 'u-2',
        authorName: 'Negocio Responsable',
        roleTags: ['negocio','reciclaje'],
        content: 'Buscamos voluntarios para jornada de reciclaje en la colonia.',
        media: [{ cid: 'placeholders/eco2.svg' } as any],
        createdAt: now.toISOString(),
        likes: 256,
        commentsCount: 34,
      },
      {
        id: 'ph-3',
        authorId: 'u-3',
        authorName: 'Inspector Eco',
        roleTags: ['inspección'],
        content: 'Recomendaciones para preparar tu negocio para una inspección ambiental.',
        media: [{ cid: 'placeholders/eco3.svg' } as any],
        createdAt: now.toISOString(),
        likes: 86,
        commentsCount: 7,
      },
    ];
    // Ajuste mínimo según pestaña
    if (tab === 'vip') base.forEach(p => (p.roleTags = [...(p.roleTags || []), 'vip']));
    if (tab === 'business') base.forEach(p => (p.roleTags = [...(p.roleTags || []), 'business']));
    if (tab === 'volunteer') base.forEach(p => (p.roleTags = [...(p.roleTags || []), 'volunteer']));
    if (tab === 'guide') base.forEach(p => (p.roleTags = [...(p.roleTags || []), 'guide']));
    return base;
  }
}
