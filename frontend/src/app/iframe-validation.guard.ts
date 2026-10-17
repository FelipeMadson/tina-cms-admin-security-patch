/// <reference types="vitest" />
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toBeFalse: () => R;
    toBeTrue: () => R;
  }
  interface Assertion<R extends void | Promise<void> = void, T = unknown> {
    toBeFalse: () => R;
    toBeTrue: () => R;
  }
}

const globalExpect = (globalThis as {
  expect?: {
    extend?: (matchers: Record<string, (received: unknown) => { pass: boolean; message: () => string }>) => void;
  };
}).expect;

if (typeof globalExpect?.extend === 'function') {
  globalExpect.extend({
    toBeFalse(received: unknown) {
      return {
        pass: received === false,
        message: () => `expected ${String(received)} to be false`,
      };
    },
    toBeTrue(received: unknown) {
      return {
        pass: received === true,
        message: () => `expected ${String(received)} to be true`,
      };
    },
  });
}

export interface RouteFragmentInput {
  url: ReadonlyArray<string | { path?: string; toString(): string }>;
}

const ALLOWED_PREVIEW_HOSTS = new Set(['example.com', 'localhost', '127.0.0.1']);

@Injectable({
  providedIn: 'root',
})
export class IframeValidationGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot | RouteFragmentInput,
    _state?: RouterStateSnapshot
  ): boolean {
    if (!route || !Array.isArray(route.url) || route.url.length === 0) {
      return false;
    }

    const segments = route.url.map((segment) =>
      typeof segment === 'string' ? segment : segment.path ?? String(segment)
    );

    const candidateRaw =
      segments[0] === '/~' || segments[0] === '~'
        ? segments.slice(1).join('/')
        : segments.join('/');

    if (!candidateRaw) {
      return false;
    }

    let decoded = candidateRaw;
    try {
      decoded = decodeURIComponent(candidateRaw);
    } catch {
      return false;
    }

    if (
      !candidateRaw.startsWith('https://') ||
      !decoded.startsWith('https://') ||
      decoded.includes('\\') ||
      decoded.includes('..')
    ) {
      return false;
    }

    const afterProtocol = decoded.slice('https://'.length);
    if (!afterProtocol || afterProtocol.includes('//')) {
      return false;
    }

    try {
      const parsed = new URL(decoded);
      if (parsed.protocol !== 'https:') {
        return false;
      }
      if (!ALLOWED_PREVIEW_HOSTS.has(parsed.hostname)) {
        return false;
      }
      if (parsed.pathname.includes('//')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
