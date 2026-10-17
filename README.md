# tina-cms-admin-security-patch

[Português (Brasil)](./README.pt-BR.md)

Angular 22 route guard, fragment sanitizer, and sandboxed iframe preview harness mitigating protocol-relative and arbitrary-origin URL injection in `/~/*` admin preview routes (modeled on CVE-2026-34740).

## Problem and Scope

Admin preview routes that accept unvalidated path fragments after `/~/*` can be abused via protocol-relative paths (`//evil.example`), double-slash path injection (`example//fragment`), encoded traversal sequences (`%2f%2f`), or non-HTTPS origins (`http://example.com`, `relative://example.com`). This project provides:

- **`IframeValidationGuard`** (`frontend/src/app/iframe-validation.guard.ts`): Angular route guard enforcing strict `https://` origin validation and allowlisted preview hosts before activating `/~/*` routes.
- **`FragmentSanitizerService`** (`frontend/src/app/fragment-sanitizer.service.ts`): Path fragment sanitizer that rejects double slashes (`//`), backslashes, percent-encoded double slashes, path traversal (`..`), and scheme prefixes before a fragment reaches the preview iframe.
- **`IframeSandboxDirective` & `IframeSandboxComponent`** (`frontend/src/app/iframe-sandbox.directive.ts`, `frontend/src/app/iframe-sandbox.component.ts`): Applies `sandbox="allow-scripts allow-same-origin"`, `csp="default-src 'strict-origin'"`, and `referrerpolicy="strict-origin"` to the preview `<iframe>`.
- **`SecurityDashboardComponent`** (`frontend/src/app/security-dashboard.component.ts`): Interactive verification view where operators can test custom fragments and route targets against `sanitizeFragment` and `canActivate`.

## Architecture

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

## Installation and Local Execution

Prerequisites: Node.js 22+ and npm.

```bash
cd frontend
npm ci
npm run build
npm test -- --watch=false
```

## Automated Verification

The Vitest unit and acceptance suite in `frontend/src/app/*.spec.ts` verifies:

- `[CRIT-1]` `FragmentSanitizerService.sanitizeFragment('example//fragment')` returns `null`.
- `[CRIT-2]` `FragmentSanitizerService.sanitizeFragment('example/fragment')` returns `'example/fragment'`.
- `[CRIT-1]` `IframeValidationGuard.canActivate({ url: ['/~', 'relative://example.com'] })` returns `false`.
- `[CRIT-1]` `IframeValidationGuard.canActivate({ url: ['/~', 'http://example.com'] })` returns `false`.
- `[CRIT-2]` `IframeValidationGuard.canActivate({ url: ['/~', 'https://example.com'] })` returns `true`.

## Limitations

- Standalone Angular 22 verification harness; does not include a TinaCMS GraphQL backend or external content repository.
- Preview host allowlist is static (`example.com`, `localhost`, `127.0.0.1`) and rejects arbitrary external origins by design.
