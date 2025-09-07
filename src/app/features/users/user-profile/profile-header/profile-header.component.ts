import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserDetail } from '../../data/users.models';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent {
  @Input() user!: UserDetail;
  @Input() isSelf = false;
  @Input() myRoles: string[] = [];
  @Input() kycPassed = false;
  @Input() locationLabel?: string;
  @Output() kycClick = new EventEmitter<void>();
}
