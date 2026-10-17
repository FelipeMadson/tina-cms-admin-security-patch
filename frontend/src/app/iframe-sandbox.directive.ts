import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appIframeSandbox]',
  standalone: true,
})
export class IframeSandboxDirective implements OnChanges {
  @Input() appIframeSandbox = '';

  constructor(private readonly el: ElementRef<HTMLIFrameElement>) {
    this.applyAttributes();
  }

  ngOnChanges(): void {
    this.applyAttributes();
  }

  private applyAttributes(): void {
    const element = this.el.nativeElement;
    element.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    element.setAttribute('csp', "default-src 'strict-origin'");
    element.setAttribute('referrerpolicy', 'strict-origin');
    if (this.appIframeSandbox) {
      element.setAttribute('data-validated-fragment', this.appIframeSandbox);
    } else {
      element.removeAttribute('data-validated-fragment');
    }
  }
}
