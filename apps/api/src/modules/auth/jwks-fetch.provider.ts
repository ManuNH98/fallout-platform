import type { FetchImplementation } from 'jose';

export const JWKS_FETCH = Symbol('JWKS_FETCH');

export const jwksFetchProvider = {
  provide: JWKS_FETCH,
  useValue: ((url, options) =>
    fetch(url, options)) satisfies FetchImplementation,
};
