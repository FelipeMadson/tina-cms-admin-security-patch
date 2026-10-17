import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SecurityDashboardComponent } from './app/security-dashboard.component';

@Component({
  selector: 'product-app',
  standalone: true,
  imports: [SecurityDashboardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main><app-security-dashboard></app-security-dashboard></main>`,
})
export class App {}
