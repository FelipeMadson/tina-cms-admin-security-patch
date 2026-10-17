import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityDashboardComponent } from './security-dashboard.component';
import { FragmentSanitizerService } from './fragment-sanitizer.service';
import { IframeValidationGuard } from './iframe-validation.guard';

@NgModule({
  imports: [CommonModule, SecurityDashboardComponent],
  exports: [SecurityDashboardComponent],
  providers: [FragmentSanitizerService, IframeValidationGuard],
})
export class SecurityDashboardModule {}
