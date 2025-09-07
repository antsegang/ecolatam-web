import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserDetail } from '../../data/users.models';

export type Tab = 'posts' | 'about' | 'activity';

@Component({
  selector: 'app-profile-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.scss'],
  animations: [
    trigger('tabAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class ProfileTabsComponent {
  @Input() tab: Tab = 'posts';
  @Output() tabChange = new EventEmitter<Tab>();
  @Input() user!: UserDetail;
  @Input() posts: Array<{ id: number; content: string; createdAt: string }> = [];
  @Input() isSelf = false;
  @Input() paisLabel?: string;
  @Input() provinciaLabel?: string;
  @Input() cantonLabel?: string;
  @Input() distritoLabel?: string;
}
