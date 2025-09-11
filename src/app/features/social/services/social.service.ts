import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { Post, FeedFilter } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private api = inject(ApiService);

  // --- Feed / Posts ---
  getFeed(params: { page?: number; pageSize?: number; filter?: FeedFilter } = {}): Observable<Post[]> {
    // TODO: ajustar ruta al endpoint real (p.ej. '/posts' o '/feed')
    return this.api.get<Post[]>('/posts', {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      filter: params.filter ?? 'all',
    });
  }

  createPost(body: { content: string; media?: Array<{ cid: string; iv?: string; mime?: string }>; roleTags?: string[] }): Observable<Post> {
    // TODO: ajustar ruta al endpoint real
    return this.api.post<Post>('/posts', body);
  }

  likePost(postId: number | string): Observable<{ likes: number }> {
    // TODO: ajustar ruta al endpoint real
    return this.api.post<{ likes: number }>(`/posts/${postId}/like`, {});
  }

  // --- Voluntariado ---
  offerVolunteer(payload: { skills: string; availability?: string; notes?: string }): Observable<any> {
    // Ejemplo: '/volunteer' podría aceptar POST para ofrecerse
    return this.api.post('/volunteer', payload);
  }

  requestVolunteers(payload: { businessId?: number | string; need: string; details?: string }): Observable<any> {
    // Ejemplo: '/volunteer/requests'
    return this.api.post('/volunteer/requests', payload);
  }

  // --- Guías ---
  contactGuide(payload: { topic: string; message: string; preferredDate?: string }): Observable<any> {
    // Ejemplo: '/tour_guide/contact'
    return this.api.post('/tour_guide/contact', payload);
  }

  // --- Inspecciones ---
  requestInspection(payload: { targetType: 'business' | 'location'; targetId?: number | string; notes?: string }): Observable<any> {
    // Ejemplo: '/inspector/requests'
    return this.api.post('/inspector/requests', payload);
  }

  // --- VIP ---
  getVipFeed(params: { page?: number; pageSize?: number } = {}): Observable<Post[]> {
    // Ejemplo: '/vip/posts'
    return this.api.get<Post[]>('/vip/posts', {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    });
  }
}

