import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '@core/services/api.service';
import { ApiEnvelope, Page, UserDetail, UserListItem } from './users.models';
import { UsersListApiBody, UserDTO } from './users.dto';
import { normalizeUsersListBody, CreateUserPayload, mapUserDtoToDetail } from './users.mappers';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private api = inject(ApiService);

  create(payload: CreateUserPayload): Observable<string> {
    return this.api
      .post<ApiEnvelope<string>>('/users', payload)
      .pipe(map(env => String(env.body)));
  }

  list(params: { q?: string; limit?: number; offset: number }): Observable<Page<UserListItem>> {
    const limit  = params.limit  ?? 10;
    const offset = params.offset ?? 0;

    const query: Record<string, any> = { limit, offset };
    if (params.q?.trim()) query['q'] = params.q.trim();

    return this.api
      .get<ApiEnvelope<UsersListApiBody>>('/users', query)
      .pipe(map(env => normalizeUsersListBody(env.body, limit, offset)));
  }

  getById(id: number): Observable<UserDetail | null> {
    // 1) intenta /users/:id
    return this.api
      .get<ApiEnvelope<UserDTO | UserDTO[]>>(`/users/${id}`)
      .pipe(
        map(env => {
          const raw = Array.isArray(env.body) ? env.body[0] : env.body;
          return raw ? mapUserDtoToDetail(raw) : null;
        }),
      );
  }

  update(payload: Partial<CreateUserPayload> & { id: number }): Observable<string> {
    return this.api
      .put<ApiEnvelope<string>>('/users', payload)
      .pipe(map(env => String(env.body)));
  }

  delete(id: number): Observable<string> {
    return this.api
      .delete<ApiEnvelope<string>>('/users', { body: { id } })
      .pipe(map(env => String(env.body)));
  }
}
