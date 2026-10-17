import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FragmentSanitizerService {
  sanitizeFragment(fragment: string): string | null {
    if (!fragment || typeof fragment !== 'string') {
      return null;
    }

    const trimmed = fragment.trim();
    if (!trimmed || trimmed.includes('//') || trimmed.includes('\\') || trimmed.includes('..')) {
      return null;
    }

    let decoded = trimmed;
    try {
      decoded = decodeURIComponent(trimmed);
    } catch {
      return null;
    }

    if (
      decoded.includes('//') ||
      decoded.includes('\\') ||
      decoded.includes('..') ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)
    ) {
      return null;
    }

    const validRelativePath = /^[a-zA-Z0-9._~-]+(?:\/[a-zA-Z0-9._~-]+)*$/;
    if (!validRelativePath.test(trimmed)) {
      return null;
    }

    return trimmed;
  }
}
