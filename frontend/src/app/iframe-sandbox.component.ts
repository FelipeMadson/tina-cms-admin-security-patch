import { Component, Input } from '@angular/core';
import { IframeSandboxDirective } from './iframe-sandbox.directive';

@Component({
  selector: 'app-iframe-sandbox',
  standalone: true,
  imports: [IframeSandboxDirective],
  template: `
    <div class="sandbox-frame-shell">
      <div class="sandbox-meta">
        <span class="mono">sandbox="allow-scripts allow-same-origin"</span>
        <span class="mono">csp="default-src 'strict-origin'"</span>
      </div>
      <iframe
        title="Sandboxed Admin Preview"
        [appIframeSandbox]="url"
        src="about:blank"
      ></iframe>
    </div>
  `,
  styles: [`
    .sandbox-frame-shell {
      border: 1px solid #d4d4d8;
      border-radius: 4px;
      background: #fafafa;
      padding: 12px;
    }
    .sandbox-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: #52525b;
      margin-bottom: 8px;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    iframe {
      width: 100%;
      height: 120px;
      border: 1px solid #e4e4e7;
      background: #ffffff;
    }
  `],
})
export class IframeSandboxComponent {
  @Input() url = '';
}
