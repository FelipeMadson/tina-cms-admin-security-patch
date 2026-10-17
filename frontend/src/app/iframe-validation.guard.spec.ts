import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IframeValidationGuard } from './iframe-validation.guard';

describe('IframeValidationGuard', () => {
  let guard: IframeValidationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    guard = TestBed.inject(IframeValidationGuard);
  });

  it('[CRIT-1] rejeita URL com protocolo relativo', () => {
    const route = { url: ['/~', 'relative://example.com'] };
    expect(guard.canActivate(route)).toBeFalse();
  });

  it('[CRIT-1] rejeita URL com origem arbitrária', () => {
    const route = { url: ['/~', 'http://example.com'] };
    expect(guard.canActivate(route)).toBeFalse();
  });

  it('[CRIT-2] permite URL com protocolo absoluto', () => {
    const route = { url: ['/~', 'https://example.com'] };
    expect(guard.canActivate(route)).toBeTrue();
  });
});