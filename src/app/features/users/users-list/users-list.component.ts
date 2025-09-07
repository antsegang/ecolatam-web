import { Component, OnInit, inject, signal, DestroyRef , HostBinding} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // 👈 DatePipe
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersApi } from '../data/users.api';
import { Page, UserListItem } from '../data/users.models';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fadeIn, slideIn } from '@shared/styles/animations';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe], // 👈
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  animations: [fadeIn, slideIn],
})
export class UsersListComponent implements OnInit {
  private api = inject(UsersApi);
  private fb  = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  @HostBinding('@fadeIn') readonly fade = true;

  loading  = signal<boolean>(false);
  pageData = signal<Page<UserListItem> | null>(null);

  form = this.fb.nonNullable.group({ q: [''] });

  readonly limit = 12;
  private offset = 0;

  ngOnInit(): void {
    this.load();
    this.form.controls.q.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(0));
  }

  private filterItems(items: UserListItem[], q?: string): UserListItem[] {
    if (!q?.trim()) return items;
    const term = q.trim().toLowerCase();
    return items.filter(u =>
      [u.name, u.lastname, u.username, u.email]
        .some(v => v?.toLowerCase().includes(term))
    );
  }

  load(offset = 0): void {
    this.loading.set(true);
    this.offset = offset;

    const qRaw = this.form.getRawValue().q;
    const q = qRaw && qRaw.trim() ? qRaw.trim() : undefined;

    this.api.list({ q, limit: this.limit, offset })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          // Fallback de filtrado local si el backend no aplica q
          const filtered = this.filterItems(res.items, q);
          const page: Page<UserListItem> = {
            ...res,
            items: filtered,
            // si hay q, asumimos que estamos “en cliente”: no hay más páginas
            hasMore: q ? false : res.hasMore,
            total: q ? filtered.length : res.total,
          };
          this.pageData.set(page);
        },
        error: () => this.pageData.set({ items: [], limit: this.limit, offset, hasMore: false })
      });
  }

  onSubmit(): void { this.load(0); }
  prev(): void { if (this.offset > 0) this.load(Math.max(0, this.offset - this.limit)); }
  next(): void { if (this.pageData()?.hasMore) this.load(this.offset + this.limit); }
  trackById = (_: number, item: UserListItem) => item.id;
}
