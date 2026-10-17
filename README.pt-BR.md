# tina-cms-admin-security-patch

[English](./README.md)

Guarda de rotas Angular 22, serviço de sanitização de fragmentos e contêiner de preview `<iframe>` em sandbox para mitigação de injeção de URL com protocolo relativo ou origem arbitrária em rotas administrativas `/~/*` (baseado no vetor CVE-2026-34740).

## Problema e Escopo

Rotas administrativas de preview que interpolam fragmentos após `/~/*` sem validação estrita permitem redirecionamento ou execução de conteúdo de origens arbitrárias por meio de barras duplas (`example//fragment`), protocolos relativos (`relative://example.com`), origens sem TLS (`http://example.com`) ou sequências codificadas (`%2f%2f`). Este projeto implementa:

- **`IframeValidationGuard`** (`frontend/src/app/iframe-validation.guard.ts`): Guarda de rota Angular que exige protocolo `https://`, bloqueia barras duplas após o esquema e restringe o preview a hosts explicitamente autorizados.
- **`FragmentSanitizerService`** (`frontend/src/app/fragment-sanitizer.service.ts`): Sanitizador de fragmentos relativos que rejeita barras duplas (`//`), barras invertidas, `..`, esquemas de URI e sequências codificadas equivalentes antes da injeção no `<iframe>`.
- **`IframeSandboxDirective` e `IframeSandboxComponent`** (`frontend/src/app/iframe-sandbox.directive.ts`, `frontend/src/app/iframe-sandbox.component.ts`): Aplica `sandbox="allow-scripts allow-same-origin"`, `csp="default-src 'strict-origin'"` e `referrerpolicy="strict-origin"` ao elemento `<iframe>`.
- **`SecurityDashboardComponent`** (`frontend/src/app/security-dashboard.component.ts`): Painel interativo para inspeção em tempo real das respostas de `sanitizeFragment` e `canActivate`.

## Arquitetura

```text
frontend/
  src/
    main.ts
    app.ts
    app/
      fragment-sanitizer.service.ts
      fragment-sanitizer.service.spec.ts
      iframe-validation.guard.ts
      iframe-validation.guard.spec.ts
      iframe-sandbox.directive.ts
      iframe-sandbox.component.ts
      security-dashboard.component.ts
      security-dashboard.module.ts
```

## Instalação e Execução Local

Pré-requisitos: Node.js 22+ e npm.

```bash
cd frontend
npm ci
npm run build
npm test -- --watch=false
```

## Verificação Automatizada

A suíte automatizada com TestBed e Vitest (`frontend/src/app/*.spec.ts`) valida:

- `[CRIT-1]` `FragmentSanitizerService.sanitizeFragment('example//fragment')` retorna `null`.
- `[CRIT-2]` `FragmentSanitizerService.sanitizeFragment('example/fragment')` retorna `'example/fragment'`.
- `[CRIT-1]` `IframeValidationGuard.canActivate({ url: ['/~', 'relative://example.com'] })` retorna `false`.
- `[CRIT-1]` `IframeValidationGuard.canActivate({ url: ['/~', 'http://example.com'] })` retorna `false`.
- `[CRIT-2]` `IframeValidationGuard.canActivate({ url: ['/~', 'https://example.com'] })` retorna `true`.

## Limitações

- Aplicação Angular 22 isolada para validação de guarda de rota e sanitização de iframe; não inclui backend GraphQL do TinaCMS.
- Lista de hosts permitidos para preview é estática (`example.com`, `localhost`, `127.0.0.1`), rejeitando origens externas arbitrárias.
