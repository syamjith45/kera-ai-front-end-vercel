
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-operator-stats',
  templateUrl: './stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class OperatorStatsComponent {
  statsView = signal<'daily' | 'weekly'>('daily');
  
  // Heights for bars, in percentage
  dailyScanData = [60, 75, 50, 80, 65, 90, 55, 70, 60, 85, 50, 75];

  setView(view: 'daily' | 'weekly') {
    this.statsView.set(view);
  }
}
