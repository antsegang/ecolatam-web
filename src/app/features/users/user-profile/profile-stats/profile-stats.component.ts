import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FluentIconComponent } from '@shared/ui/fluent-icon';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule, FluentIconComponent],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.scss']
})
export class ProfileStatsComponent {
  @Input() stats!: { posts: number; followers: number; following: number };
  @Input() kycPassed = false;
  @Input() myRoles: string[] = [];
}
