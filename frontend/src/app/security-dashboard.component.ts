import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FragmentSanitizerService } from './fragment-sanitizer.service';
import { IframeValidationGuard } from './iframe-validation.guard';
import { IframeSandboxComponent } from './iframe-sandbox.component';

export interface SecurityCheckResult {
  id: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  message: string;
}

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, IframeSandboxComponent],
  template: `
    <section class="security-shell">
      <header class="security-header">
        <div>
          <p class="eyebrow">CVE-2026-34740 · TinaCMS Admin Preview</p>
          <h1>Validação de Origem e Sanitização de Fragmento Iframe</h1>
          <p class="subtitle">
            Guarda de rota para <code>/~/&#42;</code> com bloqueio de protocolos relativos, barras duplas e origens não autorizadas.
          </p>
        </div>
        <div class="status-group">
          <div class="status-item">
            <span class="status-label">Sanitizador de Fragmento</span>
            <strong class="status-value">{{ iframeStatus }}</strong>
          </div>
          <div class="status-item">
            <span class="status-label">Guarda de Origem</span>
            <strong class="status-value">{{ originStatus }}</strong>
          </div>
        </div>
      </header>

      <div class="interactive-panel">
        <div class="field-group">
          <label for="fragment-input">Testar fragmento de caminho (<code>sanitizeFragment</code>)</label>
          <div class="input-row">
            <input
              id="fragment-input"
              type="text"
              [value]="customFragment"
              (input)="onFragmentInput($event)"
              placeholder="ex: example/fragment ou example//fragment"
            />
            <span class="verdict" [class.verdict-ok]="sanitizedPreview !== null" [class.verdict-blocked]="sanitizedPreview === null">
              {{ sanitizedPreview !== null ? 'Permitido: ' + sanitizedPreview : 'Bloqueado (null)' }}
            </span>
          </div>
        </div>

        <div class="field-group">
          <label for="origin-input">Testar alvo de rota <code>/~/&#42;</code> (<code>canActivate</code>)</label>
          <div class="input-row">
            <input
              id="origin-input"
              type="text"
              [value]="customRouteTarget"
              (input)="onRouteTargetInput($event)"
              placeholder="ex: https://example.com ou http://example.com"
            />
            <span class="verdict" [class.verdict-ok]="routeAllowed" [class.verdict-blocked]="!routeAllowed">
              {{ routeAllowed ? 'Rota Permitida (true)' : 'Rota Rejeitada (false)' }}
            </span>
          </div>
        </div>
      </div>

      <section class="results-section">
        <h2>Casos de Verificação de Segurança</h2>
        <table class="results-table">
          <thead>
            <tr>
              <th>Critério</th>
              <th>Entrada</th>
              <th>Esperado</th>
              <th>Obtido</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            @for (item of testResults; track item.id + item.input) {
              <tr>
                <td class="mono">{{ item.id }}</td>
                <td class="mono">{{ item.input }}</td>
                <td class="mono">{{ item.expected }}</td>
                <td class="mono">{{ item.actual }}</td>
                <td>{{ item.message }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section class="sandbox-section">
        <h2>Preview Isolado (Sandbox + CSP Strict-Origin)</h2>
        <app-iframe-sandbox [url]="sanitizedPreview ?? ''"></app-iframe-sandbox>
      </section>
    </section>
  `,
  styles: [`
    .security-shell {
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 24px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #18181b;
    }
    .security-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e4e4e7;
      margin-bottom: 24px;
    }
    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #52525b;
      margin: 0 0 6px 0;
      font-weight: 600;
    }
    h1 {
      font-size: 24px;
      line-height: 1.25;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    h2 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }
    .subtitle {
      margin: 0;
      color: #52525b;
      max-width: 62ch;
    }
    .status-group {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .status-item {
      border: 1px solid #d4d4d8;
      border-radius: 4px;
      padding: 10px 14px;
      background: #fafafa;
      min-width: 150px;
    }
    .status-label {
      display: block;
      font-size: 12px;
      color: #52525b;
    }
    .status-value {
      font-size: 15px;
      color: #18181b;
    }
    .interactive-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
      padding: 16px;
      border: 1px solid #e4e4e7;
      border-radius: 4px;
      background: #fafafa;
    }
    .field-group label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
    }
    .input-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    input[type="text"] {
      padding: 8px 10px;
      font-size: 14px;
      border: 1px solid #d4d4d8;
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .verdict {
      font-size: 13px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #d4d4d8;
    }
    .verdict-ok {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }
    .verdict-blocked {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }
    .results-section {
      margin-bottom: 28px;
    }
    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .results-table th,
    .results-table td {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #e4e4e7;
    }
    .results-table th {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #52525b;
      background: #fafafa;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
    }
  `],
})
export class SecurityDashboardComponent implements OnInit {
  iframeStatus = 'Verificado';
  originStatus = 'Verificado';
  customFragment = 'example/fragment';
  sanitizedPreview: string | null = 'example/fragment';
  customRouteTarget = 'https://example.com';
  routeAllowed = true;
  testResults: SecurityCheckResult[] = [];

  constructor(
    private readonly fragmentSanitizerService: FragmentSanitizerService,
    private readonly iframeValidationGuard: IframeValidationGuard
  ) {}

  ngOnInit(): void {
    this.testResults = [];
    this.checkFragmentSanitizer();
    this.checkIframeValidationGuard();
    this.sanitizedPreview = this.fragmentSanitizerService.sanitizeFragment(this.customFragment);
    this.routeAllowed = this.iframeValidationGuard.canActivate({ url: ['/~', this.customRouteTarget] });
  }

  onFragmentInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.customFragment = target?.value ?? '';
    this.sanitizedPreview = this.fragmentSanitizerService.sanitizeFragment(this.customFragment);
  }

  onRouteTargetInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.customRouteTarget = target?.value ?? '';
    this.routeAllowed = this.iframeValidationGuard.canActivate({ url: ['/~', this.customRouteTarget] });
  }

  checkFragmentSanitizer(): void {
    const injected = this.fragmentSanitizerService.sanitizeFragment('example//fragment');
    const clean = this.fragmentSanitizerService.sanitizeFragment('example/fragment');
    const injectedBlocked = injected === null;
    const cleanAllowed = clean === 'example/fragment';

    this.iframeStatus = injectedBlocked && cleanAllowed ? 'Protegido' : 'Falha';

    this.testResults.push({
      id: 'CRIT-1',
      input: 'example//fragment',
      expected: 'null',
      actual: String(injected),
      passed: injectedBlocked,
      message: 'Fragmento com barras duplas rejeitado antes da injeção no iframe',
    });

    this.testResults.push({
      id: 'CRIT-2',
      input: 'example/fragment',
      expected: 'example/fragment',
      actual: String(clean),
      passed: cleanAllowed,
      message: 'Fragmento relativo íntegro preservado sem barras duplas',
    });
  }

  checkIframeValidationGuard(): void {
    const relResult = this.iframeValidationGuard.canActivate({ url: ['/~', 'relative://example.com'] });
    const httpResult = this.iframeValidationGuard.canActivate({ url: ['/~', 'http://example.com'] });
    const httpsResult = this.iframeValidationGuard.canActivate({ url: ['/~', 'https://example.com'] });

    this.originStatus = !relResult && !httpResult && httpsResult ? 'Protegido' : 'Falha';

    this.testResults.push({
      id: 'CRIT-1',
      input: '/~/relative://example.com',
      expected: 'false',
      actual: String(relResult),
      passed: !relResult,
      message: 'URL com protocolo relativo rejeitado pela guarda /~/*',
    });

    this.testResults.push({
      id: 'CRIT-1',
      input: '/~/http://example.com',
      expected: 'false',
      actual: String(httpResult),
      passed: !httpResult,
      message: 'URL sem TLS estrito / origem arbitrária rejeitado pela guarda /~/*',
    });

    this.testResults.push({
      id: 'CRIT-2',
      input: '/~/https://example.com',
      expected: 'true',
      actual: String(httpsResult),
      passed: httpsResult,
      message: 'URL HTTPS de origem permitida autorizado pela guarda /~/*',
    });
  }
}
