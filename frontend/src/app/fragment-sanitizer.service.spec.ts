import { TestBed } from '@angular/core/testing';
import { FragmentSanitizerService } from './fragment-sanitizer.service';

describe('FragmentSanitizerService', () => {
  let service: FragmentSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FragmentSanitizerService);
  });

  it('[CRIT-1] rejeita fragmento com barras duplas', () => {
    const fragment = 'example//fragment';
    expect(service.sanitizeFragment(fragment)).toBeNull();
  });

  it('[CRIT-2] permite fragmento sem barras duplas', () => {
    const fragment = 'example/fragment';
    expect(service.sanitizeFragment(fragment)).toBe('example/fragment');
  });
});