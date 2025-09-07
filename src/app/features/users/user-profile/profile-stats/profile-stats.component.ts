import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stats.component.html',
  styleUrls: ['./profile-stats.component.scss']
})
export class ProfileStatsComponent {
  @Input() stats!: { posts: number; followers: number; following: number };
  @Input() kycPassed = false;
  @Input() myRoles: string[] = [];
}
