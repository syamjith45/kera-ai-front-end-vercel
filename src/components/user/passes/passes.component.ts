
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-passes',
  templateUrl: './passes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class UserPassesComponent {
  passView = signal<'active' | 'history'>('active');

  setView(view: 'active' | 'history') {
    this.passView.set(view);
  }
}
